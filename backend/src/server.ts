import express from 'express';
import cors from 'cors';
import { rootRouter } from './routes/rootRouter';
import { userRouter } from './routes/userRouter';
import './services/SchedulerService'; // Initialize scheduler

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://afocusfy.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/user', userRouter); 
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
    console.log(`Productivity Server is running on port ${PORT}`);
  
});