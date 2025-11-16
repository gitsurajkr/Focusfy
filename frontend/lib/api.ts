// API utility functions for backend communication

import type { User, Task, Note, AuthResponse, ApiError } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper function to make authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'An error occurred',
    }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  signup: async (data: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/api/user/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  signin: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    return fetchWithAuth<AuthResponse>('/api/user/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    return fetchWithAuth<{ user: User }>('/api/user/me');
  },

  updateNotificationSettings: async (data: {
    telegramBotToken?: string;
    telegramChatId?: string;
    discordBotToken?: string;
    discordChannelId?: string;
    gmailTo?: string;
  }): Promise<{ user: User }> => {
    return fetchWithAuth<{ user: User }>('/api/user/notification-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/user/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/user/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Task APIs
export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    return fetchWithAuth<Task[]>('/api/get-tasks');
  },

  addTask: async (data: {
    title: string;
    type?: 'NORMAL' | 'TIMED_EVENT';
    tags?: string[];
    startDate?: Date;
    dueDate?: Date;
    reminder_before?: number;
    reminder_every?: number;
    repeat_interval?: number;
    channel?: string[];
    completed?: boolean;
  }): Promise<Task> => {
    return fetchWithAuth<Task>('/api/add-task', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTask: async (taskId: string, data: {
    title?: string;
    type?: 'NORMAL' | 'TIMED_EVENT';
    tags?: string[];
    dueDate?: Date;
    startDate?: Date;
    reminder_before?: number;
    reminder_every?: number;
    repeat_interval?: number;
    channel?: string[];
    completed?: boolean;
  }): Promise<Task> => {
    return fetchWithAuth<Task>(`/api/update-task/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteTask: async (taskId: string): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/api/delete-task/${taskId}`, {
      method: 'DELETE',
    });
  },
};

// Note APIs
export const noteApi = {
  getNotes: async (): Promise<Note[]> => {
    return fetchWithAuth<Note[]>('/api/get-notes');
  },

  addNote: async (data: { title: string; content: string }): Promise<Note> => {
    return fetchWithAuth<Note>('/api/add-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNote: async (noteId: string, data: { title?: string; content?: string }): Promise<Note> => {
    return fetchWithAuth<Note>(`/api/update-notes/${noteId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteNote: async (noteId: string): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>(`/api/delete-notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};

// Profile API
export const profileApi = {
  updateProfile: async (data: {
    avatar?: string;
    telegramBotToken?: string;
    telegramChatId?: string;
    discordBotToken?: string;
    discordChannelId?: string;
    gmailTo?: string;
  }): Promise<{ user: User }> => {
    return fetchWithAuth<{ user: User }>('/api/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  testTelegram: async (): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/test-telegram', {
      method: 'POST',
    });
  },

  testDiscord: async (): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/test-discord', {
      method: 'POST',
    });
  },

  testGmail: async (): Promise<{ message: string }> => {
    return fetchWithAuth<{ message: string }>('/api/test-gmail', {
      method: 'POST',
    });
  },
};
