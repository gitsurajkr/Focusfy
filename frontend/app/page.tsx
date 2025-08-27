'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import NotesSection from './components/NotesSection';
import TaskStats from './components/TaskStats';
import api from '../lib/api';
import { showToast } from '../lib/toast';
import { Task, Note, ApiError } from '../types';

export default function Home() {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskSubTab, setTaskSubTab] = useState<'create' | 'view'>('view');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load tasks and notes on component mount
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchNotes();
    }
  }, [token]);

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/get-tasks');
      setTasks(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) {
        logout();
      } else {
        console.error('Error fetching tasks:', apiError);
        showToast.error('Failed to load tasks');
      }
    }
  };

  const fetchNotes = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/get-notes');
      setNotes(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) {
        logout();
      } else {
        console.error('Error fetching notes:', error);
        showToast.error('Failed to load notes');
      }
    }
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleNotesUpdate = () => {
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021] flex flex-col">
      {/* Header */}
      <header className="flex flex-col justify-center items-center pixel-border bg-[#232946]/80 mb-2 p-4 sm:p-6 text-center shadow-lg">
        <div className="flex justify-center items-center mb-4 w-full max-w-4xl">
          <h1 className="text-2xl font-bold gaming-accent pixel-font tracking-wider">
            FOCUSFY PRODUCTIVITY MANAGER
          </h1>
        </div>
        {/* Mobile tab buttons */}
        <div className="flex justify-center gap-4 sm:hidden w-full">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 rounded-lg pixel-border pixel-font font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${activeTab === 'tasks' ? 'bg-gradient-to-r from-pink-500 to-red-500 border-pink-400 shadow-pink-500/25' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 hover:border-cyan-400 hover:shadow-cyan-400/25 hover:shadow-lg'}`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-3 rounded-lg pixel-border pixel-font font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${activeTab === 'notes' ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-green-500/25' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 hover:border-cyan-400 hover:shadow-cyan-400/25 hover:shadow-lg'}`}
          >
            Notes
          </button>
        </div>
        {/* Desktop tab buttons */}
        <div className="hidden sm:flex justify-center gap-4 w-full">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-3 rounded-lg pixel-border pixel-font font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${activeTab === 'tasks' ? 'bg-gradient-to-r from-pink-500 to-red-500 border-pink-400 shadow-pink-500/25' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 hover:border-cyan-400 hover:shadow-cyan-400/25 hover:shadow-lg'}`}
          >
            MISSIONS
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 rounded-lg pixel-border pixel-font font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${activeTab === 'notes' ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-green-500/25' : 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 hover:border-cyan-400 hover:shadow-cyan-400/25 hover:shadow-lg'}`}
          >
            LOGS
          </button>
        </div>
      </header>

      {/* Sub-navigation for Tasks */}
      {activeTab === 'tasks' && (
        <div className="w-full max-w-6xl mx-auto px-4 mt-4">
          <div className="flex gap-2 sm:gap-4 justify-center">
            <button
              onClick={() => setTaskSubTab('create')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg pixel-border pixel-font text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${taskSubTab === 'create' ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 shadow-purple-500/25' : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 hover:border-purple-400 hover:shadow-purple-400/25 hover:shadow-lg'}`}
            >
              Create Task
            </button>

            <button
              onClick={() => setTaskSubTab('view')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg pixel-border pixel-font text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-300 border-2 shadow-md text-white ${taskSubTab === 'view' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 shadow-cyan-500/25' : 'bg-gradient-to-r from-gray-600 to-gray-700 border-gray-500 hover:border-cyan-400 hover:shadow-cyan-400/25 hover:shadow-lg'}`}
            >
              View Tasks
            </button>

          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto pb-24 sm:pb-0 px-4 mt-6">{/* Main Content */}
        {activeTab === 'tasks' ? (
          taskSubTab === 'create' ? (
            // Create Task Section
            <div className="pixel-border bg-[#181825]/80 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-center mb-6 gaming-accent pixel-font uppercase tracking-wide">
                CREATE NEW MISSION
              </h2>
              <TaskForm onTaskCreated={handleTaskUpdate} />
            </div>
          ) : (
            // View Tasks Section
            <div className="space-y-6">
              <TaskStats tasks={tasks} />
              <div className="pixel-border bg-[#181825]/80 p-6 shadow-lg">
                <h2 className="text-xl font-bold text-center mb-6 gaming-accent pixel-font uppercase tracking-wide">
                  ACTIVE MISSIONS ({tasks.length})
                </h2>
                <TaskList tasks={tasks} onTaskUpdate={handleTaskUpdate} />
              </div>
            </div>
          )
        ) : (
          // Notes Section
          <div className="pixel-border bg-[#181825]/80 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-6 gaming-accent pixel-font uppercase tracking-wide">
              MISSION LOGS
            </h2>
            <NotesSection notes={notes} onNotesUpdate={handleNotesUpdate} />
          </div>
        )}
      </main>
      {/* Mobile Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#232946] border-t border-cyan-400">
        {activeTab === 'tasks' ? (
          // Task Sub-Navigation (Mobile)
          <div className="flex justify-around items-center h-16 px-2">

            <button
              onClick={() => setTaskSubTab('create')}
              className={`flex flex-col items-center flex-1 h-full justify-center ${taskSubTab === 'create' ? 'text-purple-400 font-bold' : 'text-white/70'}`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Create</span>
            </button>
            <button
              onClick={() => setTaskSubTab('view')}
              className={`flex flex-col items-center flex-1 h-full justify-center ${taskSubTab === 'view' ? 'text-cyan-400 font-bold' : 'text-white/70'}`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2v1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">View</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="flex flex-col items-center flex-1 h-full justify-center text-white/70"
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
              </svg>
              <span className="text-xs">Notes</span>
            </button>

          </div>
        ) : (
          // Main Navigation (Mobile - Notes active)
          <div className="flex justify-around items-center h-16 px-2">
            <button
              onClick={() => {
                setActiveTab('tasks');
                setTaskSubTab('view');
              }}
              className="flex flex-col items-center flex-1 h-full justify-center text-white/70"
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2V3a2 2 0 012-2v1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Tasks</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="flex flex-col items-center flex-1 h-full justify-center text-green-400 font-bold"
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" />
              </svg>
              <span className="text-xs">Notes</span>
            </button>
          </div>
        )}
      </nav>
      {/* Footer (visible on all devices) */}
      <footer className="mt-8 mb-20 sm:mb-8 text-center pixel-border bg-[#232946]/80 p-4">
        <div className="space-y-2">
          <p className="text-xs gaming-accent pixel-font">
            Level up your productivity with a gaming pixel vibe!
          </p>
          <div className="flex justify-center items-center gap-2 sm:gap-4 text-xs text-white opacity-80 flex-wrap">
            <span>Crafted by</span>
            <span className="px-2 py-1 pixel-border pixel-font bg-gradient-to-r from-cyan-400 to-blue-500 text-white">Suraj</span>
            <span>•</span>
            <span> {new Date().getFullYear()}</span>
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-2 flex-wrap">
            <a
              href="https://github.com/gitsurajkr"
              className="px-2 py-1 text-xs pixel-border pixel-font bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://surajspace.tech"
              className="px-2 py-1 text-xs pixel-border pixel-font bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio
            </a>
          </div>
          <div className="text-xs text-white opacity-60 mt-2 px-2">
            <span className="pixel-font">&quot;The way to get started is to quit talking and begin doing.&quot; - Steve</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
