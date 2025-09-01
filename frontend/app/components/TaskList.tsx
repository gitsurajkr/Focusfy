'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { Task, ApiError } from '../../types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  filter?: 'ALL' | 'EVENT' | 'HABIT' | 'NORMAL' | 'COMPLETED' | 'OVERDUE' | 'ACTIVE' | 'DUE_TODAY';
  onFilterChange?: (filter: 'ALL' | 'EVENT' | 'HABIT' | 'NORMAL' | 'COMPLETED' | 'OVERDUE' | 'ACTIVE' | 'DUE_TODAY') => void;
}

export default function TaskList({ tasks, onTaskUpdate, filter: externalFilter, onFilterChange }: TaskListProps) {
  // const { token } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'EVENT' | 'HABIT' | 'NORMAL' | 'COMPLETED' | 'OVERDUE' | 'ACTIVE' | 'DUE_TODAY'>(externalFilter || 'ALL');
  
  // Sync with external filter changes
  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter);
    }
  }, [externalFilter]);

  // Handle filter changes
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    onFilterChange?.(newFilter);
  };
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return '🗓️';
      case 'HABIT':
        return 'In Progress';
      case 'NORMAL':
        return '⚒️';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    const minutesUntilDue = Math.floor((date.getTime() - now.getTime()) / (1000 * 60));
    
    // Use a clear, unambiguous date format: "Sep 1, 2025" instead of "01/09/2025"
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    if (isOverdue) {
      const minutesOverdue = Math.abs(minutesUntilDue);
      if (minutesOverdue < 60) {
        return `${dateStr} ${timeStr} (${minutesOverdue}min ago)`;
      } else {
        const hoursOverdue = Math.floor(minutesOverdue / 60);
        return `${dateStr} ${timeStr} (${hoursOverdue}h ago)`;
      }
    } else {
      if (minutesUntilDue < 60) {
        return `${dateStr} ${timeStr} (in ${minutesUntilDue}min)`;
      } else {
        const hoursUntilDue = Math.floor(minutesUntilDue / 60);
        return `${dateStr} ${timeStr} (in ${hoursUntilDue}h)`;
      }
    }
  };

  const formatSimpleDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateTimeLeft = (startDate?: string, endDate?: string) => {
    const now = new Date();
    
    if (!startDate && !endDate) return null;
    
    // If task hasn't started yet
    if (startDate && new Date(startDate) > now) {
      const timeToStart = new Date(startDate).getTime() - now.getTime();
      const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeToStart % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `Starts in ${days}d ${hours}h`;
      if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
      return `Starts in ${minutes}m`;
    }
    
    // If task is ongoing or we only have end date
    if (endDate) {
      const timeToEnd = new Date(endDate).getTime() - now.getTime();
      
      if (timeToEnd < 0) {
        const overdue = Math.abs(timeToEnd);
        const days = Math.floor(overdue / (1000 * 60 * 60 * 24));
        const hours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `⚠️ Overdue by ${days}d ${hours}h`;
        if (hours > 0) return `⚠️ Overdue by ${hours}h`;
        return `⚠️ Overdue`;
      } else {
        const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
      }
    }
    
    return null;
  };

  const toggleTaskComplete = async (task: Task) => {
    try {
      await api.patch(`/api/update-task/${task.id}`, {
        ...task,
        completed: !task.completed,
      });
      
      const statusMessage = !task.completed 
        ? `Quest "${task.title}" completed!` 
        : `Quest "${task.title}" marked as incomplete`;
      showToast.success(statusMessage);
      onTaskUpdate();
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.error || 'Failed to update quest';
      showToast.error(`Failed to update quest: ${errorMessage}`);
      console.error('Error updating task:', apiError);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      const loadingToastId = showToast.loading('Deleting quest...');
      try {
        await api.delete(`/api/delete-task/${taskId}`);
        showToast.update(loadingToastId, 'Quest deleted successfully!', 'success');
        onTaskUpdate();
      } catch (error) {
        const apiError = error as ApiError;
        const errorMessage = apiError.response?.data?.error || 'Failed to delete quest';
        showToast.update(loadingToastId, `Failed to delete quest: ${errorMessage}`, 'error');
        console.error('Error deleting task:', apiError);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const now = new Date();
    
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return task.completed;
    
    // Time-based filters
    if (filter === 'OVERDUE') {
      return !task.completed && task.due_date && new Date(task.due_date) < now;
    }
    if (filter === 'ACTIVE') {
      if (task.completed) return false;
      const hasStarted = !task.start_date || new Date(task.start_date) <= now;
      const notEnded = !task.due_date || new Date(task.due_date) > now;
      return hasStarted && notEnded;
    }
    if (filter === 'DUE_TODAY') {
      if (task.completed || !task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate.toDateString() === now.toDateString();
    }
    
    // Task type filters
    return task.type === filter;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by completion status first (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then by due date if available
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    
    // Finally by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['ALL', 'EVENT', 'HABIT', 'NORMAL', 'COMPLETED'].map((filterType) => (
            <button
            key={filterType}
            onClick={() => handleFilterChange(filterType as typeof filter)}
            className={`px-3 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all ${
              filter === filterType 
              ? filterType === 'EVENT' 
                ? 'bg-gradient-to-r from-pink-500 to-red-500 border-pink-400 shadow-pink-500/25'
                : filterType === 'HABIT'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-green-500/25'
                : filterType === 'NORMAL'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 shadow-blue-500/25'
                : 'bg-gradient-to-r from-gray-700 to-gray-900 border-gray-500 shadow-gray-500/25'
              : ''
            }`}
            >
            {filterType}
            </button>
        ))}
      </div>

      {/* Task Count */}
      <div className="mb-4 text-center">
        <span className="pixel-border pixel-font p-2 text-xs text-gray-300 bg-[#232946]/80">
          {filteredTasks.length} Quest{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="text-center pixel-border bg-[#181825]/80 p-6">
            <p className="text-sm pixel-font"> No quests found!</p>
            <p className="text-xs mt-2">Start your adventure by creating a new task!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`pixel-border bg-[#232946]/80 p-4 ${task.completed ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTaskIcon(task.type)}</span>
                  <h3 className={`font-bold text-sm pixel-font ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleTaskComplete(task)}
                    className={`px-2 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all ${task.completed ? 'opacity-60' : ''}`}
                  >
                    {task.completed ? 'Done' : <svg xmlns="http://www.w3.org/2000/svg" className='h-5 w-5' viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM404.4 276.7L324.4 404.7C320.2 411.4 313 415.6 305.1 416C297.2 416.4 289.6 412.8 284.9 406.4L236.9 342.4C228.9 331.8 231.1 316.8 241.7 308.8C252.3 300.8 267.3 303 275.3 313.6L302.3 349.6L363.7 251.3C370.7 240.1 385.5 236.6 396.8 243.7C408.1 250.8 411.5 265.5 404.4 276.8z"/></svg>}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-2 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-pink-500 to-red-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
                    title='Delete'
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className='w-5 h-5' viewBox="0 0 640 640"><path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z"/></svg>
                  </button>
                </div>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="mb-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 mr-1 mb-1 pixel-border pixel-font"
                    >
                       {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Task Details */}
              <div className="text-xs space-y-1">
                {/* Time Left - Most Important Information */}
                {(() => {
                  const timeLeft = calculateTimeLeft(task.start_date, task.due_date);
                  if (timeLeft) {
                    return (
                      <div className="flex items-center gap-1 font-bold">
                        <span className={timeLeft.includes('Overdue') ? 'text-red-400' : 'text-cyan-400'}>
                          ⏰ {timeLeft}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Start Date */}
                {task.start_date && (
                  <div className="flex items-center gap-1">
                    <span>🚀 Starts: {formatSimpleDate(task.start_date)}</span>
                  </div>
                )}

                {/* End Date */}
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <span>🏁 Ends: {formatSimpleDate(task.due_date)}</span>
                  </div>
                )}
                
                {task.repeat_interval && (
                  <div className="flex items-center gap-1">
                    <span>🔄 Every {task.repeat_interval} mins</span>
                  </div>
                )}

                {task.reminder_before && (
                  <div className="flex items-center gap-1">
                    <span>🔔 Remind {task.reminder_before} mins before</span>
                  </div>
                )}

                {task.reminder_every && (
                  <div className="flex items-center gap-1">
                    <span>🔔 Remind every {task.reminder_every} mins</span>
                  </div>
                )}

                {task.channel.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span>📢 Notify: {task.channel.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
