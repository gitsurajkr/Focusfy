'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  type: 'EVENT' | 'HABIT' | 'NORMAL';
  tags: string[];
  due_date?: string;
  repeat_interval?: number;
  reminder_before?: number;
  reminder_every?: number;
  channel: string[];
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export default function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [filter, setFilter] = useState<'ALL' | 'EVENT' | 'HABIT' | 'NORMAL' | 'COMPLETED'>('ALL');

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return '🗓️';
      case 'HABIT':
        return '🔄';
      case 'NORMAL':
        return '⚒️';
      default:
        return '📦';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleTaskComplete = async (task: Task) => {
    try {
      const response = await fetch(`http://localhost:3001/api/update-task/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          completed: !task.completed,
        }),
      });

      if (response.ok) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/delete-task/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onTaskUpdate();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return task.completed;
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
            onClick={() => setFilter(filterType as any)}
            className={`minecraft-btn text-xs ${
              filter === filterType 
                ? filterType === 'EVENT' 
                  ? 'task-event'
                  : filterType === 'HABIT'
                  ? 'task-habit'
                  : filterType === 'NORMAL'
                  ? 'task-normal'
                  : 'task-completed'
                : ''
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Task Count */}
      <div className="mb-4 text-center">
        <span className="minecraft-container p-2 text-xs text-gray-300">
          {filteredTasks.length} Quest{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.length === 0 ? (
          <div className="text-center minecraft-container p-6">
            <p className="text-sm"> No quests found!</p>
            <p className="text-xs mt-2">Start your adventure by creating a new task!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`minecraft-card ${
                task.type === 'EVENT'
                  ? 'task-event'
                  : task.type === 'HABIT'
                  ? 'task-habit'
                  : 'task-normal'
              } ${task.completed ? 'task-completed' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTaskIcon(task.type)}</span>
                  <h3 className={`font-bold text-sm ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleTaskComplete(task)}
                    className={`minecraft-btn text-xs ${
                      task.completed ? 'task-completed' : 'task-habit'
                    }`}
                  >
                    {task.completed ? '✅' :<svg xmlns="http://www.w3.org/2000/svg" className='h-5 w-5' viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM404.4 276.7L324.4 404.7C320.2 411.4 313 415.6 305.1 416C297.2 416.4 289.6 412.8 284.9 406.4L236.9 342.4C228.9 331.8 231.1 316.8 241.7 308.8C252.3 300.8 267.3 303 275.3 313.6L302.3 349.6L363.7 251.3C370.7 240.1 385.5 236.6 396.8 243.7C408.1 250.8 411.5 265.5 404.4 276.8z"/></svg>}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="minecraft-btn text-xs"
                    style={{ background: 'var(--minecraft-red)' }}
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
                      className="inline-block bg-yellow-500 text-black text-xs px-2 py-1 mr-1 mb-1"
                      style={{
                        border: '1px solid var(--minecraft-black)',
                        boxShadow: '1px 1px 0px var(--minecraft-black)'
                      }}
                    >
                       {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Task Details */}
              <div className="text-xs space-y-1">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    {/* <span>📅</span> */}
                    <span>Due: {formatDate(task.due_date)}</span>
                  </div>
                )}
                
                {task.repeat_interval && (
                  <div className="flex items-center gap-1">
                    {/* <span>🔄</span> */}
                    <span>Every {task.repeat_interval} mins</span>
                  </div>
                )}

                {task.reminder_before && (
                  <div className="flex items-center gap-1">
                    {/* <span>⏰</span> */}
                    <span>Remind {task.reminder_before} mins before</span>
                  </div>
                )}

                {task.reminder_every && (
                  <div className="flex items-center gap-1">
                    {/* <span>🔔</span> */}
                    <span>Remind every {task.reminder_every} mins</span>
                  </div>
                )}

                {task.channel.length > 0 && (
                  <div className="flex items-center gap-1">
                    {/* <span>📢</span> */}
                    <span>Notify: {task.channel.join(', ')}</span>
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
