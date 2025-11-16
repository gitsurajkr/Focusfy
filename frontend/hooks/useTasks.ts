"use client"

import { useState, useEffect } from 'react';
import { taskApi } from '@/lib/api';
import type { Task } from '@/lib/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskApi.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (taskData: {
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
  }) => {
    try {
      const task = await taskApi.addTask(taskData);
      setTasks(prev => [...prev, task]);
      return task;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add task');
    }
  };

  const updateTask = async (taskId: string, updates: {
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
  }) => {
    try {
      const task = await taskApi.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? task : t));
      return task;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskApi.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete task');
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}
