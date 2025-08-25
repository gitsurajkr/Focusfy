import express from 'express';
import cors from 'cors';
import { rootRouter } from './routes/rootRouter';
import './services/SchedulerService'; // Initialize scheduler

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://afocusfy.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', rootRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    notifications: 'enabled'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Minecraft Productivity Server is running on port ${PORT}`);
    console.log(`Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`Discord Bot: ${process.env.DISCORD_BOT_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`Gmail Service: ${process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'Configured' : 'Not configured'}`);
});