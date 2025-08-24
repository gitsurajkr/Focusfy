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

    console.log('⏰ Scheduler service initialized');
  }

  private async checkPendingNotifications() {
    try {
      const now = new Date();
      const tasks = await prisma.task.findMany({
        where: {
          completed: false,
          OR: [
            // Event tasks with due dates
            {
              type: 'EVENT',
              due_date: {
                not: null,
                gte: now
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

      for (const task of tasks) {
        await this.processTask(task);
      }
    } catch (error) {
      console.error('❌ Error checking pending notifications:', error);
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
      console.error(`❌ Error processing task ${task.id}:`, error);
    }
  }

  private async handleEventTask(task: any) {
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));

    // Check if we should send a "reminder_before" notification
    if (task.reminder_before && minutesUntilDue <= task.reminder_before && minutesUntilDue > 0) {
      const lastNotified = await this.getLastNotificationTime(task.id, 'reminder_before');
      const shouldNotify = !lastNotified || 
        (now.getTime() - lastNotified.getTime()) >= (task.reminder_every || 10) * 60 * 1000;

      if (shouldNotify) {
        const message = NotificationService.getEventReminder(task.title, minutesUntilDue);
        
        await NotificationService.sendNotification({
          message,
          taskTitle: task.title,
          taskType: task.type,
          channels: task.channel
        });

        await this.updateLastNotificationTime(task.id, 'reminder_before');
      }
    }

    // Check if the event has started (overdue notification)
    if (minutesUntilDue <= 0 && minutesUntilDue >= -5) {
      const lastNotified = await this.getLastNotificationTime(task.id, 'started');
      
      if (!lastNotified) {
        const message = `🚨 EVENT STARTED: "${task.title}" has begun! Time to take action! 🎯`;
        
        await NotificationService.sendNotification({
          message,
          taskTitle: task.title,
          taskType: task.type,
          channels: task.channel
        });

        await this.updateLastNotificationTime(task.id, 'started');
      }
    }
  }

  private async handleHabitTask(task: any) {
    const now = new Date();
    const lastNotified = await this.getLastNotificationTime(task.id, 'habit_reminder');
    
    const shouldNotify = !lastNotified || 
      (now.getTime() - lastNotified.getTime()) >= task.repeat_interval * 60 * 1000;

    if (shouldNotify) {
      const message = NotificationService.getHabitReminder(task.title);
      
      await NotificationService.sendNotification({
        message,
        taskTitle: task.title,
        taskType: task.type,
        channels: task.channel
      });

      await this.updateLastNotificationTime(task.id, 'habit_reminder');
    }
  }

  private async handleNormalTask(task: any) {
    const now = new Date();
    const lastNotified = await this.getLastNotificationTime(task.id, 'normal_reminder');
    
    const shouldNotify = !lastNotified || 
      (now.getTime() - lastNotified.getTime()) >= task.reminder_every * 60 * 1000;

    if (shouldNotify) {
      const message = NotificationService.getNormalTaskReminder(task.title);
      
      await NotificationService.sendNotification({
        message,
        taskTitle: task.title,
        taskType: task.type,
        channels: task.channel
      });

      await this.updateLastNotificationTime(task.id, 'normal_reminder');
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

      const message = `🧪 TEST: This is a test notification for "${task.title}"`;
      
      await NotificationService.sendNotification({
        message,
        taskTitle: task.title,
        taskType: task.type as any,
        channels: task.channel
      });

      return { success: true, message: 'Test notification sent' };
    } catch (error: any) {
      console.error('❌ Error sending test notification:', error);
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
