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

class NotificationService {
  private telegramBot: TelegramBot | null = null;
  private discordClient: Client | null = null;
  private gmailTransporter: Transporter | null = null;
  private telegramChatId: string = '';
  private discordChannelId: string = '';
  private gmailUser: string = '';
  private gmailTo: string = '';

  constructor() {
    this.initializeTelegram();
    this.initializeDiscord();
    this.initializeGmail();
  }

  private async initializeTelegram() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

    if (!token) {
      console.warn('Telegram bot token not provided. Telegram notifications disabled.');
      return;
    }

    try {
      this.telegramBot = new TelegramBot(token, { polling: false });
      console.log('Telegram bot initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
    }
  }

  private async initializeDiscord() {
    const token = process.env.DISCORD_BOT_TOKEN;
    this.discordChannelId = process.env.DISCORD_CHANNEL_ID || '';

    if (!token) {
      console.warn('Discord bot token not provided. Discord notifications disabled.');
      return;
    }

    try {
      this.discordClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages
        ]
      });

      this.discordClient.once('ready', () => {
        console.log('Discord bot initialized');
      });

      await this.discordClient.login(token);
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
    }
  }

  private async initializeGmail() {
    const user = process.env.GMAIL_USER;
    const appPassword = process.env.GMAIL_APP_PASSWORD;
    this.gmailUser = user || '';
    this.gmailTo = process.env.GMAIL_TO || user || '';

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

  async sendTelegramNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.telegramBot || !this.telegramChatId) {
      console.log('Telegram not configured, skipping notification');
      return false;
    }

    try {
      const message = this.formatMessage(payload);
      await this.telegramBot.sendMessage(this.telegramChatId, message, {
        parse_mode: 'Markdown'
      });
      console.log('Telegram notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  async sendDiscordNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.discordClient || !this.discordChannelId) {
      console.log('🎮 Discord not configured, skipping notification');
      return false;
    }

    try {
      const channel = await this.discordClient.channels.fetch(this.discordChannelId) as TextChannel;
      if (!channel) {
        console.error('Discord channel not found');
        return false;
      }

      const message = this.formatMessage(payload);
      await channel.send(message);
      console.log('Discord notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
      return false;
    }
  }

  async sendGmailNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.gmailTransporter || !this.gmailTo) {
      console.log('Gmail not configured, skipping email notification');
      return false;
    }

    try {
      const subject = this.getEmailSubject(payload);
      const htmlBody = this.getEmailHtmlBody(payload);
      const textBody = this.getEmailTextBody(payload);

      const mailOptions = {
        from: `"Focusfy Productivity" <${this.gmailUser}>`,
        to: this.gmailTo,
        subject: subject,
        text: textBody,
        html: htmlBody
      };

      await this.gmailTransporter.sendMail(mailOptions);
      console.log('Gmail notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('Failed to send Gmail notification:', error);
      return false;
    }
  }

  private getEmailSubject(payload: NotificationPayload): string {
    const emoji = this.getMinecraftEmoji(payload.taskType);
    return `${emoji} Focusfy: ${payload.taskTitle}`;
  }

  private getEmailTextBody(payload: NotificationPayload): string {
    return `
FOCUSFY PRODUCTIVITY REMINDER 

${payload.message}

Task: ${payload.taskTitle}
Type: ${payload.taskType}
Time: ${new Date().toLocaleString()}

Keep building your productivity castle! 🏗️

---
Sent by Focusfy Productivity System
    `.trim();
  }

  private getEmailHtmlBody(payload: NotificationPayload): string {
    const emoji = this.getMinecraftEmoji(payload.taskType);
    const typeColor = payload.taskType === 'EVENT' ? '#ff6b6b' :
      payload.taskType === 'HABIT' ? '#4ecdc4' : '#45b7d1';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Courier New', monospace; background-color: #2c3e50; color: #ecf0f1; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #34495e; border: 4px solid #95a5a6; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #95a5a6; padding-bottom: 15px; margin-bottom: 20px; }
        .task-type { display: inline-block; padding: 5px 15px; color: white; border: 2px solid; background: ${typeColor}; }
        .message { font-size: 18px; line-height: 1.5; margin: 20px 0; padding: 15px; background: #2c3e50; border-left: 4px solid ${typeColor}; }
        .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px solid #95a5a6; font-size: 12px; opacity: 0.8; }
        .pixel-art { font-family: monospace; font-size: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="pixel-art">🏰 FOCUSFY PRODUCTIVITY 🏰</div>
        </div>
        
        <div class="task-type">${emoji} ${payload.taskType} TASK</div>
        
        <div class="message">
            ${payload.message.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin: 15px 0;">
            <strong>📝 Task:</strong> ${payload.taskTitle}<br>
            <strong>⏰ Time:</strong> ${new Date().toLocaleString()}<br>
            <strong>🎯 Type:</strong> ${payload.taskType}
        </div>
        
        <div class="footer">
            <div class="pixel-art">Keep building your productivity castle! 🏗️</div>
            <div style="margin-top: 10px;">Sent by Focusfy Productivity System</div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const promises: Promise<boolean>[] = [];

    if (payload.channels.includes('telegram')) {
      promises.push(this.sendTelegramNotification(payload));
    }

    if (payload.channels.includes('discord')) {
      promises.push(this.sendDiscordNotification(payload));
    }

    if (payload.channels.includes('gmail') || payload.channels.includes('email')) {
      promises.push(this.sendGmailNotification(payload));
    }

    if (promises.length === 0) {
      console.log('📭 No notification channels configured for task:', payload.taskTitle);
      return;
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      console.log(`Notifications sent: ${successCount}/${promises.length} for task: ${payload.taskTitle}`);
    } catch (error) {
      console.error('Error sending notifications:', error);
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
}

export default new NotificationService();
