import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import NotificationService from './NotificationService';

const prisma = new PrismaClient();

class SchedulerService {
  private jobs: Map<string, any> = new Map();

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Check for pending notifications every minute
    cron.schedule('* * * * *', () => {
      this.checkPendingNotifications();
    });

    console.log('Scheduler service initialized');
  }

  private async checkPendingNotifications() {
    try {
      console.log('Checking for pending notifications...');
      const now = new Date();
      const tasks = await prisma.task.findMany({
        where: {
          completed: false,
          OR: [
            // Event tasks with due dates (include past and future dates)
            {
              type: 'EVENT',
              due_date: {
                not: null
              }
            },
            // Habit tasks with intervals
            {
              type: 'HABIT',
              repeat_interval: {
                not: null
              }
            },
            // Normal tasks with reminders
            {
              type: 'NORMAL',
              reminder_every: {
                not: null
              }
            }
          ]
        }
      });

      console.log(`Found ${tasks.length} tasks to process`);
      for (const task of tasks) {
        await this.processTask(task);
      }
    } catch (error) {
      console.error('Error checking pending notifications:', error);
    }
  }

  private async processTask(task: any) {
    try {
      if (task.type === 'EVENT' && task.due_date) {
        await this.handleEventTask(task);
      } else if (task.type === 'HABIT' && task.repeat_interval) {
        await this.handleHabitTask(task);
      } else if (task.type === 'NORMAL' && task.reminder_every) {
        await this.handleNormalTask(task);
      }
    } catch (error) {
      console.error(`Error processing task ${task.id}:`, error);
    }
  }

  private async handleEventTask(task: any) {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));

    console.log(`   Processing EVENT: "${task.title}"`);
    console.log(`   Current time: ${now.toLocaleString()}`);
    console.log(`   Due date: ${dueDate.toLocaleString()}`);
    console.log(`   Minutes until due: ${minutesUntilDue}`);
    console.log(`   Reminder before: ${task.reminder_before} minutes`);

    // Check if we should send a "reminder_before" notification
    if (task.reminder_before && minutesUntilDue <= task.reminder_before && minutesUntilDue > 0) {
      console.log(`Task "${task.title}" needs reminder (${minutesUntilDue}min until due)`);
      const lastNotified = await this.getLastNotificationTime(task.id, 'reminder_before');
      const shouldNotify = !lastNotified || 
        (now.getTime() - lastNotified.getTime()) >= (task.reminder_every || 10) * 60 * 1000;

      if (shouldNotify) {
        console.log(`Sending reminder for "${task.title}"`);
        const message = NotificationService.getEventReminder(task.title, minutesUntilDue);
        
        // Get user's notification settings
        const user = await prisma.user.findUnique({
          where: { id: task.userId },
          select: {
            telegramBotToken: true,
            telegramChatId: true,
            discordBotToken: true,
            discordChannelId: true,
            gmailTo: true
          }
        });

        if (user) {
          await NotificationService.sendUserNotification({
            message,
            taskTitle: task.title,
            taskType: task.type,
            channels: task.channel,
            userSettings: user
          });
        } else {
          console.error(`User not found for task: ${task.title}`);
        }

        await this.updateLastNotificationTime(task.id, 'reminder_before');
      } else {
        console.log(`⏳ Skipping reminder for "${task.title}" (too soon since last notification)`);
      }
    }

    // Check if the event has started (overdue notification)
    if (minutesUntilDue <= 0 && minutesUntilDue >= -5) {
      console.log(`Task "${task.title}" is overdue by ${Math.abs(minutesUntilDue)} minutes`);
      const lastNotified = await this.getLastNotificationTime(task.id, 'started');
      
      if (!lastNotified) {
        console.log(`Sending overdue notification for "${task.title}"`);
        const message = `EVENT STARTED: "${task.title}" has begun! Time to take action!`;
        
        // Get user's notification settings
        const user = await prisma.user.findUnique({
          where: { id: task.userId },
          select: {
            telegramBotToken: true,
            telegramChatId: true,
            discordBotToken: true,
            discordChannelId: true,
            gmailTo: true
          }
        });

        if (user) {
          await NotificationService.sendUserNotification({
            message,
            taskTitle: task.title,
            taskType: task.type,
            channels: task.channel,
            userSettings: user
          });
        } else {
          console.error(`User not found for task: ${task.title}`);
        }

        await this.updateLastNotificationTime(task.id, 'started');
      } else {
        console.log(`Skipping overdue notification for "${task.title}" (already sent)`);
      }
    }
  }

  private async handleHabitTask(task: any) {
    const now = new Date();
    const lastNotified = await this.getLastNotificationTime(task.id, 'habit_reminder');
    
    console.log(`Processing HABIT: "${task.title}" - Interval: ${task.repeat_interval} minutes`);
    
    const shouldNotify = !lastNotified || 
      (now.getTime() - lastNotified.getTime()) >= task.repeat_interval * 60 * 1000;

    if (shouldNotify) {
      console.log(`Sending habit reminder for "${task.title}"`);
      const message = NotificationService.getHabitReminder(task.title);
      
      // Get user's notification settings
      const user = await prisma.user.findUnique({
        where: { id: task.userId },
        select: {
          telegramBotToken: true,
          telegramChatId: true,
          discordBotToken: true,
          discordChannelId: true,
          gmailTo: true
        }
      });

      if (user) {
        await NotificationService.sendUserNotification({
          message,
          taskTitle: task.title,
          taskType: task.type,
          channels: task.channel,
          userSettings: user
        });
      } else {
        console.error(`User not found for task: ${task.title}`);
      }

      await this.updateLastNotificationTime(task.id, 'habit_reminder');
    } else {
      const minutesSinceLastNotification = Math.floor((now.getTime() - lastNotified!.getTime()) / (1000 * 60));
      console.log(`⏳ Skipping habit reminder for "${task.title}" (${minutesSinceLastNotification}min since last, need ${task.repeat_interval}min)`);
    }
  }

  private async handleNormalTask(task: any) {
    const now = new Date();
    const lastNotified = await this.getLastNotificationTime(task.id, 'normal_reminder');
    
    console.log(`Processing NORMAL: "${task.title}" - Reminder every: ${task.reminder_every} minutes`);
    
    const shouldNotify = !lastNotified || 
      (now.getTime() - lastNotified.getTime()) >= task.reminder_every * 60 * 1000;

    if (shouldNotify) {
      console.log(`Sending normal task reminder for "${task.title}"`);
      const message = NotificationService.getNormalTaskReminder(task.title);
      
      // Get user's notification settings
      const user = await prisma.user.findUnique({
        where: { id: task.userId },
        select: {
          telegramBotToken: true,
          telegramChatId: true,
          discordBotToken: true,
          discordChannelId: true,
          gmailTo: true
        }
      });

      if (user) {
        await NotificationService.sendUserNotification({
          message,
          taskTitle: task.title,
          taskType: task.type,
          channels: task.channel,
          userSettings: user
        });
      } else {
        console.error(`User not found for task: ${task.title}`);
      }

      await this.updateLastNotificationTime(task.id, 'normal_reminder');
    } else {
      const minutesSinceLastNotification = Math.floor((now.getTime() - lastNotified!.getTime()) / (1000 * 60));
      console.log(`⏳ Skipping normal task reminder for "${task.title}" (${minutesSinceLastNotification}min since last, need ${task.reminder_every}min)`);
    }
  }

  private async getLastNotificationTime(taskId: string, type: string): Promise<Date | null> {
    // For now, we'll use a simple in-memory cache
    // In production, you'd want to store this in the database
    const key = `${taskId}_${type}`;
    const cached = this.notificationCache.get(key);
    return cached || null;
  }

  private async updateLastNotificationTime(taskId: string, type: string): Promise<void> {
    const key = `${taskId}_${type}`;
    this.notificationCache.set(key, new Date());
  }

  private notificationCache: Map<string, Date> = new Map();

  // Manual trigger for testing
  async testNotification(taskId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const message = `TEST: This is a test notification for "${task.title}"`;
      
      await NotificationService.sendNotification({
        message,
        taskTitle: task.title,
        taskType: task.type as any,
        channels: task.channel
      });

      return { success: true, message: 'Test notification sent' };
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // Test Gmail notification specifically
  async testGmailNotification() {
    try {
      const message = `TEST: Gmail notification service is working! Sent at ${new Date().toLocaleString()}`;
      
      await NotificationService.sendNotification({
        
        message,
        taskTitle: "Gmail Test",
        taskType: 'NORMAL',
        channels: ['gmail']
      });

      return { success: true, message: 'Gmail test notification sent' };
    } catch (error: any) {
      console.error('Error sending Gmail test notification:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // Test notification for specific user with their configured channels
  async testNotificationForUser(taskId: string, userId: string, configuredChannels: string[]) {
    try {
      const task = await prisma.task.findFirst({
        where: { id: taskId, userId: userId }
      });

      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      const message = `TEST: Your notification system is working! Task: ${task.title} - Sent at ${new Date().toLocaleString()}`;

      // Get user's notification settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          telegramBotToken: true,
          telegramChatId: true,
          discordBotToken: true,
          discordChannelId: true,
          gmailTo: true
        }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Create a user-specific notification service instance
      await NotificationService.sendUserNotification({
        message,
        taskTitle: task.title,
        taskType: task.type as any,
        channels: configuredChannels,
        userSettings: user
      });

      return { success: true, message: `Test notification sent to configured channels: ${configuredChannels.join(', ')}` };
    } catch (error: any) {
      console.error('Error sending user-specific test notification:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // Test Gmail notification for specific user
  async testGmailNotificationForUser(userId: string, gmailTo: string) {
    try {
      const message = `TEST: Gmail notification service is working! Sent at ${new Date().toLocaleString()}`;
      
      // Get user settings
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          gmailTo: true
        }
      });

      if (!user || !user.gmailTo) {
        return { success: false, error: 'Gmail recipient not configured' };
      }

      await NotificationService.sendUserNotification({
        message,
        taskTitle: "Gmail Test",
        taskType: 'NORMAL',
        channels: ['gmail'],
        userSettings: { gmailTo: user.gmailTo }
      });

      return { success: true, message: `Gmail test notification sent to ${user.gmailTo}` };
    } catch (error: any) {
      console.error('Error sending user-specific Gmail test notification:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      activeJobs: this.jobs.size,
      cacheSize: this.notificationCache.size,
      isRunning: true,
      lastCheck: new Date()
    };
  }
}

export default new SchedulerService();
