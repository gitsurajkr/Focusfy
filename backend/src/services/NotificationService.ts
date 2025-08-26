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
  userId?: string; 
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
      console.log(`User notifications sent: ${successCount}/${promises.length} for task: ${payload.taskTitle}`);
    } catch (error) {
      console.error('Error sending user notifications:', error);
    }
  }

  // User-specific notification methods
  private async sendUserTelegramNotification(payload: UserNotificationPayload): Promise<boolean> {
    if (!payload.userSettings.telegramBotToken || !payload.userSettings.telegramChatId) {
      console.log('User Telegram not configured, skipping notification');
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
      console.log('User Telegram notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('Failed to send user Telegram notification:', error);
      return false;
    }
  }

  private async sendUserDiscordNotification(payload: UserNotificationPayload): Promise<boolean> {
    if (!payload.userSettings.discordBotToken || !payload.userSettings.discordChannelId) {
      console.log('User Discord not configured, skipping notification');
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
      console.log('User Discord notification sent:', payload.taskTitle);
      
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
      console.log('User Gmail not configured or transporter not available, skipping notification');
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

      console.log('User Gmail notification sent to:', payload.userSettings.gmailTo);
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

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      if (!this.gmailTransporter) {
        throw new Error('Gmail transporter not initialized');
      }

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const subject = 'Reset Your Focusfy Password';
      const message = `
Hi there,

You requested to reset your password for your Focusfy account. Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Focusfy Team
      `.trim();

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Reset Your Focusfy Password</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Hi there,
          </p>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            You requested to reset your password for your Focusfy account. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; font-size: 14px; word-break: break-all; margin-bottom: 30px;">
            ${resetLink}
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #888; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
              ⚠️ This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #888; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              <strong>Focusfy Team</strong>
            </p>
          </div>
        </div>
      `;

      await this.gmailTransporter.sendMail({
        from: `"Focusfy Productivity" <${this.gmailUser}>`,
        to: email,
        subject: subject,
        text: message,
        html: htmlMessage
      });

      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Temporary fallback for old sendNotification method (scheduled notifications)
  // TODO: Implement user-specific scheduled notifications
  async sendNotification(payload: NotificationPayload): Promise<void> {
    console.log('Scheduled notification system temporarily disabled - user-specific notifications only');
    console.log('Task:', payload.taskTitle, 'Channels:', payload.channels);
    // For now, just log the notification instead of sending it
    // In the future, this should get user settings and call sendUserNotification
  }
}

export default new NotificationService();
