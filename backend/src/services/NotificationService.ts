import TelegramBot from 'node-telegram-bot-api';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

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
  private telegramChatId: string = '';
  private discordChannelId: string = '';

  constructor() {
    this.initializeTelegram();
    this.initializeDiscord();
  }

  private async initializeTelegram() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '';

    if (!token) {
      console.warn('⚠️ Telegram bot token not provided. Telegram notifications disabled.');
      return;
    }

    try {
      this.telegramBot = new TelegramBot(token, { polling: false });
      console.log('✅ Telegram bot initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
    }
  }

  private async initializeDiscord() {
    const token = process.env.DISCORD_BOT_TOKEN;
    this.discordChannelId = process.env.DISCORD_CHANNEL_ID || '';

    if (!token) {
      console.warn('⚠️ Discord bot token not provided. Discord notifications disabled.');
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
        console.log('✅ Discord bot initialized');
      });

      await this.discordClient.login(token);
    } catch (error) {
      console.error('❌ Failed to initialize Discord bot:', error);
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

    return `🏰 **MINECRAFT PRODUCTIVITY REMINDER** 🏰\n\n` +
           `${emoji} **${typeText}:** ${payload.taskTitle}\n\n` +
           `📢 ${payload.message}\n\n` +
           `⏰ Time: ${new Date().toLocaleString()}\n` +
           `🎮 Keep crafting your productivity!`;
  }

  async sendTelegramNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.telegramBot || !this.telegramChatId) {
      console.log('📱 Telegram not configured, skipping notification');
      return false;
    }

    try {
      const message = this.formatMessage(payload);
      await this.telegramBot.sendMessage(this.telegramChatId, message, {
        parse_mode: 'Markdown'
      });
      console.log('✅ Telegram notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error);
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
        console.error('❌ Discord channel not found');
        return false;
      }

      const message = this.formatMessage(payload);
      await channel.send(message);
      console.log('✅ Discord notification sent:', payload.taskTitle);
      return true;
    } catch (error) {
      console.error('❌ Failed to send Discord notification:', error);
      return false;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const promises: Promise<boolean>[] = [];

    if (payload.channels.includes('telegram')) {
      promises.push(this.sendTelegramNotification(payload));
    }

    if (payload.channels.includes('discord')) {
      promises.push(this.sendDiscordNotification(payload));
    }

    if (promises.length === 0) {
      console.log('📭 No notification channels configured for task:', payload.taskTitle);
      return;
    }

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      console.log(`📊 Notifications sent: ${successCount}/${promises.length} for task: ${payload.taskTitle}`);
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
    }
  }

  // Predefined notification templates
  getEventReminder(taskTitle: string, minutesBefore: number): string {
    if (minutesBefore <= 5) {
      return `🚨 URGENT: "${taskTitle}" starts in ${minutesBefore} minutes! Get ready! 🚨`;
    } else if (minutesBefore <= 15) {
      return `⏰ Reminder: "${taskTitle}" starts in ${minutesBefore} minutes. Prepare yourself!`;
    } else {
      return `📅 Upcoming: "${taskTitle}" starts in ${minutesBefore} minutes. Don't forget!`;
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
