import express, { Router } from 'express';
import { addTask, getTasks, addNotes, getNotes, updateTask, updateNote, deleteTask, deleteNote, updateProfile } from '../controller/task';
import SchedulerService from '../services/SchedulerService';
import { decodeUser } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import NotificationService from '../services/NotificationService';

const prisma = new PrismaClient();
const notificationService = NotificationService;

const app = express();
app.use(express.json());

const rootRouter: express.Router = express.Router();


rootRouter.use(decodeUser);

// task routes
rootRouter.post('/add-task', addTask)
rootRouter.get('/get-tasks', getTasks)
rootRouter.patch('/update-task/:id', updateTask)
rootRouter.delete('/delete-task/:id', deleteTask)

// notes routes
rootRouter.post('/add-notes', addNotes)
rootRouter.get('/get-notes', getNotes)
rootRouter.patch('/update-notes/:id', updateNote)
rootRouter.delete('/delete-notes/:id', deleteNote)

// notification routes
rootRouter.post('/test-notification/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

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
      return res.status(404).json({ error: "User not found" });
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: userId }
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const configuredChannels = [];
    const missingConfigs = [];

    if (task.channel.includes('telegram')) {
      if (user.telegramBotToken && user.telegramChatId) {
        configuredChannels.push('telegram');
      } else {
        missingConfigs.push('Telegram (bot token and chat ID required)');
      }
    }

    if (task.channel.includes('discord')) {
      if (user.discordBotToken && user.discordChannelId) {
        configuredChannels.push('discord');
      } else {
        missingConfigs.push('Discord (bot token and channel ID required)');
      }
    }

    if (task.channel.includes('gmail')) {
      if (user.gmailTo) {
        configuredChannels.push('gmail');
      } else {
        missingConfigs.push('Gmail (recipient email required)');
      }
    }

    // If no channels are properly configured, return error
    if (configuredChannels.length === 0) {
      return res.status(400).json({
        error: `No notification channels configured properly. Missing: ${missingConfigs.join(', ')}`
      });
    }

    // Test only the configured channels
    const result = await SchedulerService.testNotificationForUser(taskId, userId, configuredChannels);

    if (result.success) {
      let message = `Test notification sent successfully to: ${configuredChannels.join(', ')}`;
      if (missingConfigs.length > 0) {
        message += `. Skipped: ${missingConfigs.join(', ')}`;
      }
      res.json({ message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to send test notification' });
  }
});
    // profile route
    rootRouter.put('/update-profile', updateProfile);

// Test Gmail endpoint
rootRouter.post('/test-gmail', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.gmailTo) {
      return res.status(400).json({ message: 'No user found or Gmail recipient not configured. Please configure Gmail in settings.' });
    }

    await notificationService.sendUserNotification({
      message: 'This is a test notification from your task app! 📧',
      taskTitle: 'Test Notification',
      taskType: 'NORMAL',
      channels: ['gmail'],
      userSettings: {
        telegramBotToken: user.telegramBotToken,
        telegramChatId: user.telegramChatId,
        discordBotToken: user.discordBotToken,
        discordChannelId: user.discordChannelId,
        gmailTo: user.gmailTo,
      },
    });

    res.json({ message: `Gmail test sent successfully to ${user.gmailTo}!` });
  } catch (error) {
    console.error('Gmail test error:', error);
    res.status(500).json({ message: `Gmail test failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// Test Telegram endpoint
rootRouter.post('/test-telegram', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.telegramBotToken || !user.telegramChatId) {
      return res.status(400).json({
        message: 'Telegram not configured. Please set your bot token and chat ID in settings.'
      });
    }

    await notificationService.sendUserNotification({
      message: req.body.message || 'This is a test notification from your task app! 🤖',
      taskTitle: 'Test Notification',
      taskType: 'NORMAL',
      channels: ['telegram'],
      userSettings: {
        telegramBotToken: user.telegramBotToken,
        telegramChatId: user.telegramChatId,
        discordBotToken: user.discordBotToken,
        discordChannelId: user.discordChannelId,
        gmailTo: user.gmailTo,
      },
    });

    res.json({ message: 'Telegram test sent successfully! ✅' });
  } catch (error) {
    console.error('Telegram test error:', error);
    res.status(500).json({ message: `Telegram test failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

// Test Discord endpoint
rootRouter.post('/test-discord', async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.discordBotToken || !user.discordChannelId) {
      return res.status(400).json({
        message: 'Discord not configured. Please set your bot token and channel ID in settings.'
      });
    }

    await notificationService.sendUserNotification({
      message: req.body.message || 'This is a test notification from your task app! 🎮',
      taskTitle: 'Test Notification',
      taskType: 'NORMAL',
      channels: ['discord'],
      userSettings: {
        telegramBotToken: user.telegramBotToken,
        telegramChatId: user.telegramChatId,
        discordBotToken: user.discordBotToken,
        discordChannelId: user.discordChannelId,
        gmailTo: user.gmailTo,
      },
    });

    res.json({ message: 'Discord test sent successfully! ✅' });
  } catch (error) {
    console.error('Discord test error:', error);
    res.status(500).json({ message: `Discord test failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
  }
});

rootRouter.get('/scheduler-status', (req, res) => {
  const status = SchedulerService.getStatus();
  res.json(status);
});

export { rootRouter };
