'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationTest from '../components/NotificationTest';
import HealthCheck from '../components/HealthCheck';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { ApiError } from '../../types';

export default function TestsPage() {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (token) {
      fetchTasks();
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

  if (!user) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021] flex items-center justify-center">
        <div className="pixel-border bg-[#181825]/80 p-6 text-center">
          <p className="pixel-font">Please sign in to access system tests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
      <button
        type="button"
        onClick={() => window.location.assign('/')}
        className="gaming-btn text-xs px-4 py-1 mb-4"
      >
        Back
      </button>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="pixel-border bg-[#232946]/80 p-6 text-center">
          <h1 className="text-2xl font-bold gaming-accent pixel-font tracking-wider mb-2">
            SYSTEM TESTS
          </h1>
          <p className="text-sm pixel-font opacity-80">
            Test your notification systems and check service health
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Health Check */}
        <div className="pixel-border bg-[#181825]/80 p-6">
          <h2 className="text-lg font-bold gaming-accent pixel-font mb-4 text-center">
            HEALTH CHECK
          </h2>
          <HealthCheck />
        </div>

        {/* Notification Tests */}
        <div className="pixel-border bg-[#181825]/80 p-6">
          <h2 className="text-lg font-bold gaming-accent pixel-font mb-4 text-center">
            NOTIFICATION TESTS
          </h2>
          <NotificationTest tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
