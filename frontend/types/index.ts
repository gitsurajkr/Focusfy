// User types
export interface User {
  id: string;
  name: string | null;
  email: string;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  discordBotToken?: string | null;
  discordChannelId?: string | null;
  gmailTo?: string | null;
    created_at: string;
}

// Task types
export interface Task {
  id: string;
  title: string;
  type: 'NORMAL' | 'HABIT' | 'EVENT';
  tags: string[];
  due_date?: string;
  repeat_interval?: number;
  reminder_before?: number;
  reminder_every?: number;
  channel: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
  userId: string;
}

// Note types
export interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
  userId: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Error types
export interface ApiError {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignInResult {
  success: boolean;
  error?: string;
}

// Form types
export interface TaskFormData {
  title: string;
  type: 'NORMAL' | 'HABIT' | 'EVENT';
  tags: string[];
  dueDate?: string;
  repeat_interval?: number;
  reminder_before?: number;
  reminder_every?: number;
  channel: string[];
}

export interface NoteFormData {
  title?: string;
  content: string;
}

export interface ProfileFormData {
  name?: string;
  email?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  discordBotToken?: string;
  discordChannelId?: string;
  gmailTo?: string;
}
