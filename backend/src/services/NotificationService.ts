import TelegramBot from 'node-telegram-bot-api';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Interfaces
interface NotificationPayload {
  message: string;
  taskTitle: string;
  taskType: 'EVENT' | 'HABIT' | 'NORMAL';
  channels: string[];
  userId?: string; // For future user-specific notifications
}

interface UserNotificationPayload {
  message: string;
  taskTitle: string;
  taskType: 'EVENT' | 'HABIT' | 'NORMAL';
  channels: string[];
  userSettings: {
    telegramBotToken?: string | null;
    telegramChatId?: string | null;
    discordBotToken?: string | null;
    discordChannelId?: string | null;
    gmailTo?: string | null;
  };
}

class NotificationService {
  private gmailTransporter: Transporter | null = null;
  private gmailUser: string = '';

  constructor() {
    // Only initialize Gmail with server credentials
    // Telegram and Discord will use user-specific tokens
    this.initializeGmail();
  }

  private async initializeGmail() {
    const user = process.env.GMAIL_USER;
    const appPassword = process.env.GMAIL_APP_PASSWORD;
    this.gmailUser = user || '';

    if (!user || !appPassword) {
      console.warn('Gmail credentials not provided. Email notifications disabled.');
      console.warn('Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables');
      return;
    }

    try {
      this.gmailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: appPassword 
        }
      });

      // Test the connection
      if (this.gmailTransporter) {
        await this.gmailTransporter.verify();
        console.log('Gmail transporter initialized and verified');
      }
    } catch (error) {
      console.error('Failed to initialize Gmail transporter:', error);
      console.warn('Make sure to use App Password, not regular Gmail password');
      console.warn('Enable 2FA and generate App Password at: https://myaccount.google.com/apppasswords');
    }
  }

  private getMinecraftEmoji(taskType: string): string {
    switch (taskType) {
      case 'EVENT': return '🗓️';
      case 'HABIT': return '🔄';
      case 'NORMAL': return '⚒️';
      default: return '📦';
    }
  }

  private formatMessage(payload: NotificationPayload): string {
    const emoji = this.getMinecraftEmoji(payload.taskType);
    const typeText = payload.taskType === 'EVENT' ? 'Event' :
      payload.taskType === 'HABIT' ? 'Habit' : 'Quest';

    return `🏰 **FOCUSFY PRODUCTIVITY REMINDER** 🏰\n\n` +
      `${emoji} **${typeText}:** ${payload.taskTitle}\n\n` +
      `${payload.message}\n\n` +
      `Time: ${new Date().toLocaleString()}\n` +
      `Keep crafting your productivity!`;
  }

  // Send notification using user-specific tokens (for testing and actual notifications)
  async sendUserNotification(payload: UserNotificationPayload) {
    const promises: Promise<boolean>[] = [];

    if (payload.channels.includes('telegram') && payload.userSettings.telegramBotToken && payload.userSettings.telegramChatId) {
      promises.push(this.sendUserTelegramNotification(payload));
    }

    if (payload.channels.includes('discord') && payload.userSettings.discordBotToken && payload.userSettings.discordChannelId) {
      promises.push(this.sendUserDiscordNotification(payload));
    }

    if (payload.channels.includes('gmail') && payload.userSettings.gmailTo) {
      promises.push(this.sendUserGmailNotification(payload));
    }

    if (promises.length === 0) {
      console.log('📭 No user notification channels configured for task:', payload.taskTitle);
      return;
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      // console.log(`User notifications sent: ${successCount}/${promises.length} for task: ${payload.taskTitle}`);
    } catch (error) {
      console.error('Error sending user notifications:', error);
    }
  }

  // User-specific notification methods
  private async sendUserTelegramNotification(payload: UserNotificationPayload): Promise<boolean> {
    if (!payload.userSettings.telegramBotToken || !payload.userSettings.telegramChatId) {
      // console.log('User Telegram not configured, skipping notification');
      return false;
    }

    try {
      // Create a temporary bot instance with user's token
      const userBot = new TelegramBot(payload.userSettings.telegramBotToken, { polling: false });
      const message = this.formatMessage({
        message: payload.message,
        taskTitle: payload.taskTitle,
        taskType: payload.taskType,
        channels: payload.channels
      });
      
      await userBot.sendMessage(payload.userSettings.telegramChatId, message, {
        parse_mode: 'Markdown'
      });
      // console.log('User Telegram notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('Failed to send user Telegram notification:', error);
      return false;
    }
  }

  private async sendUserDiscordNotification(payload: UserNotificationPayload): Promise<boolean> {
    if (!payload.userSettings.discordBotToken || !payload.userSettings.discordChannelId) {
      // console.log('User Discord not configured, skipping notification');
      return false;
    }

    try {
      // Create a temporary Discord client with user's token
      const userDiscordClient = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
      });

      await userDiscordClient.login(payload.userSettings.discordBotToken);
      
      const channel = await userDiscordClient.channels.fetch(payload.userSettings.discordChannelId) as TextChannel;
      if (!channel) {
        console.error('User Discord channel not found');
        await userDiscordClient.destroy();
        return false;
      }

      const message = this.formatMessage({
        message: payload.message,
        taskTitle: payload.taskTitle,
        taskType: payload.taskType,
        channels: payload.channels
      });
      
      await channel.send(message);
      // console.log('User Discord notification sent:', payload.taskTitle);
      
      // Clean up the client
      await userDiscordClient.destroy();
      return true;
    } catch (error) {
      console.error('Failed to send user Discord notification:', error);
      return false;
    }
  }

  private async sendUserGmailNotification(payload: UserNotificationPayload): Promise<boolean> {
    if (!this.gmailTransporter || !payload.userSettings.gmailTo) {
      // console.log('User Gmail not configured or transporter not available, skipping notification');
      return false;
    }

    try {
      const subject = `🏰 Focusfy Notification: ${payload.taskTitle}`;
      const message = this.formatMessage({
        message: payload.message,
        taskTitle: payload.taskTitle,
        taskType: payload.taskType,
        channels: payload.channels
      });

      await this.gmailTransporter.sendMail({
        from: `"Focusfy Productivity" <${this.gmailUser}>`,
        to: payload.userSettings.gmailTo,
        subject: subject,
        text: message,
        html: `<pre style="font-family: 'Courier New', monospace; background: #f0f0f0; padding: 10px; border-radius: 5px;">${message}</pre>`
      });

      // console.log('User Gmail notification sent to:', payload.userSettings.gmailTo);
      return true;
    } catch (error) {
      console.error('Failed to send user Gmail notification:', error);
      return false;
    }
  }

  // Predefined notification templates
  getEventReminder(taskTitle: string, minutesBefore: number): string {
    if (minutesBefore <= 5) {
      return `URGENT: "${taskTitle}" starts in ${minutesBefore} minutes! Get ready! 🚨`;
    } else if (minutesBefore <= 15) {
      return `Reminder: "${taskTitle}" starts in ${minutesBefore} minutes. Prepare yourself!`;
    } else {
      return `Upcoming: "${taskTitle}" starts in ${minutesBefore} minutes. Don't forget!`;
    }
  }

  getHabitReminder(taskTitle: string): string {
    const encouragements = [
      "Time to keep up your great habit! 💪",
      "Your daily quest awaits! 🏆",
      "Let's maintain that streak! 🔥",
      "Another step towards your goals! 🎯",
      "Keep building those good habits! 🏗️"
    ];

    const random = encouragements[Math.floor(Math.random() * encouragements.length)];
    return `🔄 Habit Reminder: "${taskTitle}" - ${random}`;
  }

  getNormalTaskReminder(taskTitle: string): string {
    return `⚒️ Task Reminder: Don't forget about "${taskTitle}" - Let's get it done! 🚀`;
  }

  // Password Reset Email Method
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    if (!this.gmailTransporter) {
      console.error('Gmail transporter not available for password reset email');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const subject = '🔐 Focusfy - Password Reset Request';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset - Focusfy</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              background: linear-gradient(135deg, #181825, #232946);
              margin: 0; 
              padding: 20px;
              color: #ffffff;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #181825; 
              border: 3px solid #00ffff; 
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              color: #00ffff;
              text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .content { 
              line-height: 1.6; 
              margin-bottom: 30px; 
            }
            .reset-button { 
              display: inline-block; 
              background: linear-gradient(45deg, #00ffff, #0080ff); 
              color: #000000; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 4px; 
              font-weight: bold; 
              font-family: 'Courier New', monospace;
              border: 2px solid #00ffff;
              box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
            }
            .reset-button:hover { 
              background: linear-gradient(45deg, #0080ff, #00ffff); 
            }
            .warning { 
              background: #4a1a1a; 
              border: 1px solid #ff6b6b; 
              padding: 15px; 
              border-radius: 4px; 
              margin: 20px 0; 
              color: #ff9999;
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #888; 
              margin-top: 30px; 
            }
            .pixel-art { 
              font-family: monospace; 
              font-size: 14px; 
              color: #00ffff; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎮 FOCUSFY</div>
              <div class="pixel-art">Productivity • Gamified</div>
            </div>
            
            <div class="content">
              <h2 style="color: #00ffff;">Password Reset Request</h2>
              
              <p>Hello,</p>
              
              <p>We received a request to reset the password for your Focusfy account associated with <strong style="color: #00ffff;">${email}</strong>.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="reset-button">🔐 RESET PASSWORD</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong> for security</li>
                  <li>If you didn't request this reset, you can safely ignore this email</li>
                  <li>Your password will remain unchanged until you create a new one</li>
                </ul>
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #00ffff; background: #232946; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>
              
              <p style="margin-top: 30px;">
                Keep crafting your productivity!<br>
                <strong style="color: #00ffff;">The Focusfy Team</strong> 🏰
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent because a password reset was requested for your Focusfy account.</p>
              <p>If you have any questions, please contact our support team.</p>
              <div class="pixel-art" style="margin-top: 15px;">
                ░░░░░░░░░░░░░░░░░░░░░░░░░<br>
                ░ CRAFT YOUR PRODUCTIVITY ░<br>
                ░    BLOCK BY BLOCK      ░<br>
                ░░░░░░░░░░░░░░░░░░░░░░░░░
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
 FOCUSFY - Password Reset Request

Hello,

We received a request to reset the password for your Focusfy account associated with ${email}.

Click the link below to reset your password:
${resetUrl}

⚠️ Important Security Information:
- This link will expire in 1 hour for security
- If you didn't request this reset, you can safely ignore this email
- Your password will remain unchanged until you create a new one

Keep crafting your productivity!
The Focusfy Team 🏰

---
This email was sent because a password reset was requested for your Focusfy account.
If you have any questions, please contact our support team.
      `;

      await this.gmailTransporter.sendMail({
        from: `"Focusfy Productivity" <${this.gmailUser}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      });

      // console.log('Password reset email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Temporary fallback for old sendNotification method (scheduled notifications)
  // TODO: Implement user-specific scheduled notifications
  async sendNotification(payload: NotificationPayload): Promise<void> {
    // console.log('📅 Scheduled notification system temporarily disabled - user-specific notifications only');
    // console.log('Task:', payload.taskTitle, 'Channels:', payload.channels);
    // For now, just log the notification instead of sending it
    // In the future, this should get user settings and call sendUserNotification
  }
}

export default new NotificationService();
