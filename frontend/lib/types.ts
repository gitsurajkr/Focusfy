// Shared TypeScript types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  discordBotToken?: string | null;
  discordChannelId?: string | null;
  gmailTo?: string | null;
}

export interface Task {
  id: string;
  title: string;
  tags: string[];
  type: 'NORMAL' | 'TIMED_EVENT';
  start_date?: Date | null;
  due_date?: Date | null;
  reminder_before?: number | null;
  reminder_every?: number | null;
  repeat_interval?: number | null;
  channel: string[];
  completed: boolean;
  userId: string;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: string;
}
