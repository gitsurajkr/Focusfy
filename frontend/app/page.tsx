'use client';

import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import NotesSection from './components/NotesSection';
// import HealthCheck from './components/HealthCheck';
import TaskStats from './components/TaskStats';
import NotificationTest from './components/NotificationTest';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);

  // Load tasks and notes on component mount
  useEffect(() => {
    fetchTasks();
    fetchNotes();
  }, []);

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/get-tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/get-notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleNotesUpdate = () => {
    fetchNotes();
  };

  return (
    <div className="min-h-screen p-4">
      {/* Health Check Component */}
      {/* <HealthCheck /> */}
      
      {/* Header */}
      <header className="minecraft-container mb-6 p-6 text-center">
        <h1 className="text-2xl mb-4 text-white">
          PRODUCTIVITY MANAGER 
        </h1>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`minecraft-btn ${activeTab === 'tasks' ? 'task-event' : ''}`}
          >
             TASKS
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`minecraft-btn ${activeTab === 'notes' ? 'task-habit' : ''}`}
          >
            NOTES
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'tasks' ? (
          <div className="space-y-6">
            {/* Task Statistics */}
            <TaskStats tasks={tasks} />
            
            {/* Notification Testing (development only) */}
            <NotificationTest tasks={tasks} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Form */}
              <div className="lg:col-span-1">
                <div className="minecraft-card">
                  <h2 className="text-lg mb-4 text-center"> CREATE QUEST</h2>
                  <TaskForm onTaskCreated={handleTaskUpdate} />
                </div>
              </div>
              
              {/* Task List */}
              <div className="lg:col-span-2">
                <div className="minecraft-card">
                  <h2 className="text-lg mb-4 text-center">YOUR QUESTS</h2>
                  <TaskList tasks={tasks} onTaskUpdate={handleTaskUpdate} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="minecraft-card">
            <h2 className="text-lg mb-4 text-center"> ADVENTURE NOTES</h2>
            <NotesSection notes={notes} onNotesUpdate={handleNotesUpdate} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center minecraft-container p-4">
        <div className="space-y-2">
          <p className="text-white text-xs">
             Craft your productivity, block by block!
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-white opacity-80">
            <span>⚡ Crafted by</span>
            <span className="minecraft-btn px-2 py-1 text-xs">Suraj</span>
            <span>•</span>
            <span> {new Date().getFullYear()}</span>
          </div>
          <div className="flex justify-center items-center gap-3 mt-2">
            <a 
              href="https://github.com/gitsurajkr" 
              className="minecraft-btn text-xs px-2 py-1 hover:task-normal transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a 
              href="https://surajspace.tech" 
              className="minecraft-btn text-xs px-2 py-1 hover:task-habit transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Portfolio
            </a>
            
          </div>
          <div className="text-xs text-white opacity-60 mt-2">
            <span>"The way to get started is to quit talking and begin doing." - Steve</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
