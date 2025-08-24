# Productivity Manager

A pixel-art themed productivity app inspired by Minecraft, built with Next.js and Express.js.

## Features

### 📋 Task Management
- **Three Quest Types:**
  -  **Normal Quest**: Regular tasks with optional reminders
  -  **Timed Event**: Time-sensitive tasks with due dates and countdown reminders
  -  **Daily Habit**: Recurring tasks that repeat at specified intervals

- **Smart Reminders:**
  - Customizable notification channels (Telegram, Discord)
  - Flexible reminder intervals
  - Pre-event notifications for time-sensitive tasks

- **Task Organization:**
  - Tag system for categorization
  - Filter by quest type or completion status
  - Visual priority indicators with Minecraft-themed colors

### Adventure Notes
- Create and manage adventure logs
- Rich text support with markdown-style formatting
- Edit and delete functionality
- Timestamp tracking for creation and updates

### Minecraft Theme
- Pixel-art inspired UI with blocky design elements
- Classic Minecraft color palette
- Retro gaming fonts (Press Start 2P)
- Animated interactions and hover effects
- Responsive design for all screen sizes

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Custom CSS** for Minecraft-themed components

### Backend
- **Express.js** with TypeScript
- **Prisma** as ORM
- **PostgreSQL** database
- **CORS** enabled for frontend communication

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database running

### Project Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd productivity
```

2. **Install dependencies**
```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
npm install
```

3. **Set up the database**
```bash
cd backend
# Create .env file with your PostgreSQL connection
echo "DATABASE_URL=postgresql://username:password@localhost:5432/productivity_db" > .env

# Run migrations
pnpm prisma migrate deploy
pnpm prisma generate

# Optional: Seed with sample data
pnpm seed
```

4. **Start the servers**

Start manually:
```bash
# Terminal 1: Backend (port 3001)
cd backend
pnpm dev

# Terminal 2: Frontend (port 3000)  
cd frontend
npm run dev
```

5. **Open your browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Database Setup Options

**Using Docker (Recommended for development):**
```bash
docker run --name postgres-productivity \
  -e POSTGRES_DB=productivity_db \
  -e POSTGRES_USER=productivity \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:15

# Then use this DATABASE_URL:
# postgresql://productivity:password123@localhost:5432/productivity_db
```

**Using local PostgreSQL:**
1. Install PostgreSQL
2. Create database: `createdb productivity_db`
3. Update DATABASE_URL in `.env` file

## API Endpoints

### Tasks
- `GET /api/get-tasks` - Fetch all tasks
- `POST /api/add-task` - Create new task
- `PATCH /api/update-task/:id` - Update existing task
- `DELETE /api/delete-task/:id` - Delete task

### Notes
- `GET /api/get-notes` - Fetch all notes
- `POST /api/add-notes` - Create new note
- `PATCH /api/update-notes/:id` - Update existing note
- `DELETE /api/delete-notes/:id` - Delete note

### Creating Tasks

**Normal Quest**
```json
{
  "title": "Study Machine Learning",
  "type": "NORMAL",
  "tags": ["study", "ai"],
  "reminder_every": 180,
  "channel": ["telegram"]
}
```

**Timed Event**
```json
{
  "title": "Codeforces Contest",
  "type": "EVENT",
  "due_date": "2025-08-25T20:00:00Z",
  "reminder_before": 30,
  "reminder_every": 10,
  "channel": ["discord"]
}
```

**Daily Habit**
```json
{
  "title": "Morning Workout",
  "type": "HABIT",
  "repeat_interval": 1440,
  "channel": ["telegram"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


## Acknowledgments

- Inspired by Minecraft's iconic pixel art style
- Built with modern web technologies for optimal performance
- Designed for productivity enthusiasts and gamers alike

---

🎮 **Craft your productivity, block by block!** 🎮
