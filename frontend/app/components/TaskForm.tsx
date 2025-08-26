'use client';

import { useState } from 'react';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { ApiError } from '../../types';

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
    
    if (!formData.title.trim()) {
      showToast.warning('Please enter a quest name!');
      return;
    }

    const loadingToastId = showToast.loading('Creating your quest...');
    
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

      await api.post('/api/add-task', taskData);

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
      
      showToast.update(loadingToastId, `Quest "${taskData.title}" created successfully!`, 'success');
      onTaskCreated();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to create quest';
      showToast.update(loadingToastId, `Failed to create quest: ${errorMessage} 💥`, 'error');
      console.error('Error creating task:', apiError);
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
        <label className="block text-xs mb-2 pixel-font">Quest Name:</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
          placeholder="Enter your quest..."
          required
        />
      </div>

      {/* Task Type */}
      <div>
        <label className="block text-xs mb-2 pixel-font"> Quest Type:</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'EVENT' | 'HABIT' | 'NORMAL' }))}
          className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="NORMAL">Normal Quest</option>
          <option value="EVENT">Timed Event</option>
          <option value="HABIT">Daily Habit</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs mb-2 pixel-font">Tags (comma-separated):</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
          placeholder="work, study, personal..."
        />
      </div>

      {/* Due Date (for EVENT and NORMAL) */}
      {(formData.type === 'EVENT' || formData.type === 'NORMAL') && (
        <div>
          <label className="block text-xs mb-2 pixel-font"> Due Date:</label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      )}

      {/* Repeat Interval (for HABIT) */}
      {formData.type === 'HABIT' && (
        <div>
          <label className="block text-xs mb-2 pixel-font">Repeat Every (minutes):</label>
          <input
            type="number"
            value={formData.repeat_interval}
            onChange={(e) => setFormData(prev => ({ ...prev, repeat_interval: e.target.value }))}
            className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="e.g., 180 for 3 hours"
            min="1"
          />
        </div>
      )}

      {/* Reminder Settings for EVENT */}
      {formData.type === 'EVENT' && (
        <>
          <div>
            <label className="block text-xs mb-2 pixel-font"> Remind Before (minutes):</label>
            <input
              type="number"
              value={formData.reminder_before}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_before: e.target.value }))}
              className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g., 30"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs mb-2 pixel-font"> Remind Every (minutes):</label>
            <input
              type="number"
              value={formData.reminder_every}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_every: e.target.value }))}
              className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="e.g., 10"
              min="1"
            />
          </div>
        </>
      )}

      {/* Reminder for NORMAL tasks */}
      {formData.type === 'NORMAL' && (
        <div>
          <label className="block text-xs mb-2 pixel-font"> Remind Every (minutes):</label>
          <input
            type="number"
            value={formData.reminder_every}
            onChange={(e) => setFormData(prev => ({ ...prev, reminder_every: e.target.value }))}
            className="w-full pixel-border pixel-font bg-[#181825] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="e.g., 180 for 3 hours"
            min="1"
          />
        </div>
      )}

      {/* Notification Channels */}
      <div>
        <label className="block text-xs mb-2 pixel-font"> Notification Channels:</label>
        <div className="space-y-2">
          {['telegram', 'discord', 'gmail'].map((channel) => (
            <label key={channel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.channel.includes(channel)}
                onChange={(e) => handleChannelChange(channel, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs capitalize ">
                {channel === 'telegram' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="rounded-full bg-white w-6 h-6 inline-block mr-1"><path d="M320 72C183 72 72 183 72 320C72 457 183 568 320 568C457 568 568 457 568 320C568 183 457 72 320 72zM435 240.7C431.3 279.9 415.1 375.1 406.9 419C403.4 437.6 396.6 443.8 390 444.4C375.6 445.7 364.7 434.9 350.7 425.7C328.9 411.4 316.5 402.5 295.4 388.5C270.9 372.4 286.8 363.5 300.7 349C304.4 345.2 367.8 287.5 369 282.3C369.2 281.6 369.3 279.2 367.8 277.9C366.3 276.6 364.2 277.1 362.7 277.4C360.5 277.9 325.6 300.9 258.1 346.5C248.2 353.3 239.2 356.6 231.2 356.4C222.3 356.2 205.3 351.4 192.6 347.3C177.1 342.3 164.7 339.6 165.8 331C166.4 326.5 172.5 322 184.2 317.3C256.5 285.8 304.7 265 328.8 255C397.7 226.4 412 221.4 421.3 221.2C423.4 221.2 427.9 221.7 430.9 224.1C432.9 225.8 434.1 228.2 434.4 230.8C434.9 234 435 237.3 434.8 240.6z"/></svg>
                ) : channel === 'discord' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="bg-white rounded-full border-2  w-6 h-6 inline-block mr-1"><path d="M524.5 133.8C524.3 133.5 524.1 133.2 523.7 133.1C485.6 115.6 445.3 103.1 404 96C403.6 95.9 403.2 96 402.9 96.1C402.6 96.2 402.3 96.5 402.1 96.9C396.6 106.8 391.6 117.1 387.2 127.5C342.6 120.7 297.3 120.7 252.8 127.5C248.3 117 243.3 106.8 237.7 96.9C237.5 96.6 237.2 96.3 236.9 96.1C236.6 95.9 236.2 95.9 235.8 95.9C194.5 103 154.2 115.5 116.1 133C115.8 133.1 115.5 133.4 115.3 133.7C39.1 247.5 18.2 358.6 28.4 468.2C28.4 468.5 28.5 468.7 28.6 469C28.7 469.3 28.9 469.4 29.1 469.6C73.5 502.5 123.1 527.6 175.9 543.8C176.3 543.9 176.7 543.9 177 543.8C177.3 543.7 177.7 543.4 177.9 543.1C189.2 527.7 199.3 511.3 207.9 494.3C208 494.1 208.1 493.8 208.1 493.5C208.1 493.2 208.1 493 208 492.7C207.9 492.4 207.8 492.2 207.6 492.1C207.4 492 207.2 491.8 206.9 491.7C191.1 485.6 175.7 478.3 161 469.8C160.7 469.6 160.5 469.4 160.3 469.2C160.1 469 160 468.6 160 468.3C160 468 160 467.7 160.2 467.4C160.4 467.1 160.5 466.9 160.8 466.7C163.9 464.4 167 462 169.9 459.6C170.2 459.4 170.5 459.2 170.8 459.2C171.1 459.2 171.5 459.2 171.8 459.3C268 503.2 372.2 503.2 467.3 459.3C467.6 459.2 468 459.1 468.3 459.1C468.6 459.1 469 459.3 469.2 459.5C472.1 461.9 475.2 464.4 478.3 466.7C478.5 466.9 478.7 467.1 478.9 467.4C479.1 467.7 479.1 468 479.1 468.3C479.1 468.6 479 468.9 478.8 469.2C478.6 469.5 478.4 469.7 478.2 469.8C463.5 478.4 448.2 485.7 432.3 491.6C432.1 491.7 431.8 491.8 431.6 492C431.4 492.2 431.3 492.4 431.2 492.7C431.1 493 431.1 493.2 431.1 493.5C431.1 493.8 431.2 494 431.3 494.3C440.1 511.3 450.1 527.6 461.3 543.1C461.5 543.4 461.9 543.7 462.2 543.8C462.5 543.9 463 543.9 463.3 543.8C516.2 527.6 565.9 502.5 610.4 469.6C610.6 469.4 610.8 469.2 610.9 469C611 468.8 611.1 468.5 611.1 468.2C623.4 341.4 590.6 231.3 524.2 133.7zM222.5 401.5C193.5 401.5 169.7 374.9 169.7 342.3C169.7 309.7 193.1 283.1 222.5 283.1C252.2 283.1 275.8 309.9 275.3 342.3C275.3 375 251.9 401.5 222.5 401.5zM417.9 401.5C388.9 401.5 365.1 374.9 365.1 342.3C365.1 309.7 388.5 283.1 417.9 283.1C447.6 283.1 471.2 309.9 470.7 342.3C470.7 375 447.5 401.5 417.9 401.5z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="rounded-full border-2 bg-white w-6 h-6 inline-block mr-1"><path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z"/></svg>
                )} {channel}
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
