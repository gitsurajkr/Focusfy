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
      
      const subject = 'Reset Your Focusfy Password';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Focusfy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Focusfy</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Password Reset Request</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">Hello,</p>
                      
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Focusfy account: <strong>${email}</strong></p>
                      
                      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">Click the button below to reset your password:</p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 0 30px;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 8px; color: #856404; font-size: 14px; font-weight: 600;">⚠️ Important:</p>
                            <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.6;">
                              <li>This link expires in <strong>1 hour</strong></li>
                              <li>If you didn't request this, ignore this email</li>
                              <li>Your password won't change until you set a new one</li>
                            </ul>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">Or copy and paste this link:</p>
                      <p style="margin: 0 0 30px; padding: 12px; background-color: #f8f9fa; border-radius: 4px; color: #667eea; font-size: 13px; word-break: break-all; font-family: monospace;">${resetUrl}</p>
                      
                      <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>The Focusfy Team</strong></p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0; color: #999999; font-size: 12px; text-align: center; line-height: 1.6;">
                        This email was sent because a password reset was requested for your account.<br>
                        If you have questions, contact our support team.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const textContent = `
FOCUSFY - Password Reset Request

Hello,

We received a request to reset the password for your Focusfy account: ${email}

Click the link below to reset your password:
${resetUrl}

⚠️ Important:
- This link expires in 1 hour
- If you didn't request this, ignore this email
- Your password won't change until you set a new one

Best regards,
The Focusfy Team

---
This email was sent because a password reset was requested for your account.
If you have questions, contact our support team.
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
