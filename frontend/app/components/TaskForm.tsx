'use client';

import { useState } from 'react';

interface TaskFormProps {
  onTaskCreated: () => void;
}

export default function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'NORMAL' as 'EVENT' | 'HABIT' | 'NORMAL',
    tags: '',
    dueDate: '',
    repeat_interval: '',
    reminder_before: '',
    reminder_every: '',
    channel: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      const taskData = {
        title: formData.title,
        type: formData.type,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        dueDate: formData.dueDate || null,
        repeat_interval: formData.repeat_interval ? parseInt(formData.repeat_interval) : null,
        reminder_before: formData.reminder_before ? parseInt(formData.reminder_before) : null,
        reminder_every: formData.reminder_every ? parseInt(formData.reminder_every) : null,
        channel: formData.channel,
      };

      const response = await fetch('http://localhost:3001/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        setFormData({
          title: '',
          type: 'NORMAL',
          tags: '',
          dueDate: '',
          repeat_interval: '',
          reminder_before: '',
          reminder_every: '',
          channel: [],
        });
        onTaskCreated();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channel: checked 
        ? [...prev.channel, channel]
        : prev.channel.filter(c => c !== channel)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Title */}
      <div>
        <label className="block text-xs mb-2">Quest Name:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="minecraft-input w-full"
          placeholder="Enter your quest..."
          required
        />
      </div>

      {/* Task Type */}
      <div>
        <label className="block text-xs mb-2"> Quest Type:</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
          className="minecraft-input w-full"
        >
          <option value="NORMAL">Normal Quest</option>
          <option value="EVENT">Timed Event</option>
          <option value="HABIT"> Daily Habit</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs mb-2">Tags (comma-separated):</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="minecraft-input w-full"
          placeholder="work, study, personal..."
        />
      </div>

      {/* Due Date (for EVENT and NORMAL) */}
      {(formData.type === 'EVENT' || formData.type === 'NORMAL') && (
        <div>
          <label className="block text-xs mb-2"> Due Date:</label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="minecraft-input w-full"
          />
        </div>
      )}

      {/* Repeat Interval (for HABIT) */}
      {formData.type === 'HABIT' && (
        <div>
          <label className="block text-xs mb-2">🔄 Repeat Every (minutes):</label>
          <input
            type="number"
            value={formData.repeat_interval}
            onChange={(e) => setFormData(prev => ({ ...prev, repeat_interval: e.target.value }))}
            className="minecraft-input w-full"
            placeholder="e.g., 180 for 3 hours"
            min="1"
          />
        </div>
      )}

      {/* Reminder Settings for EVENT */}
      {formData.type === 'EVENT' && (
        <>
          <div>
            <label className="block text-xs mb-2"> Remind Before (minutes):</label>
            <input
              type="number"
              value={formData.reminder_before}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_before: e.target.value }))}
              className="minecraft-input w-full"
              placeholder="e.g., 30"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs mb-2"> Remind Every (minutes):</label>
            <input
              type="number"
              value={formData.reminder_every}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_every: e.target.value }))}
              className="minecraft-input w-full"
              placeholder="e.g., 10"
              min="1"
            />
          </div>
        </>
      )}

      {/* Reminder for NORMAL tasks */}
      {formData.type === 'NORMAL' && (
        <div>
          <label className="block text-xs mb-2"> Remind Every (minutes):</label>
          <input
            type="number"
            value={formData.reminder_every}
            onChange={(e) => setFormData(prev => ({ ...prev, reminder_every: e.target.value }))}
            className="minecraft-input w-full"
            placeholder="e.g., 180 for 3 hours"
            min="1"
          />
        </div>
      )}

      {/* Notification Channels */}
      <div>
        <label className="block text-xs mb-2"> Notification Channels:</label>
        <div className="space-y-2">
          {['telegram', 'discord'].map((channel) => (
            <label key={channel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.channel.includes(channel)}
                onChange={(e) => handleChannelChange(channel, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs capitalize">
                {channel === 'telegram' ? '📱' : '🎮'} {channel}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`minecraft-btn w-full py-3 ${
          formData.type === 'EVENT'
            ? 'task-event'
            : formData.type === 'HABIT'
            ? 'task-habit'
            : 'task-normal'
        }`}
      >
        CREATE QUEST
      </button>
    </form>
  );
}
