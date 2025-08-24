import express, { Router } from 'express';
import { addTask, getTasks, addNotes, getNotes, updateTask, updateNote, deleteTask, deleteNote } from '../controller/task';
import SchedulerService from '../services/SchedulerService';

const app = express();
app.use(express.json());

const rootRouter: express.Router = express.Router();

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
    const result = await SchedulerService.testNotification(taskId);
    
    if (result.success) {
      res.json({ message: 'Test notification sent successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to send test notification' });
  }
});

rootRouter.get('/scheduler-status', (req, res) => {
  const status = SchedulerService.getStatus();
  res.json(status);
});

export { rootRouter };
