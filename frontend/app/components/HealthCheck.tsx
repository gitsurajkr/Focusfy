'use client';

import { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [status, setStatus] = useState<{
    backend: 'checking' | 'online' | 'offline';
    database: 'checking' | 'online' | 'offline';
    notifications: 'checking' | 'configured' | 'partial' | 'disabled';
  }>({
    backend: 'checking',
    database: 'checking', 
    notifications: 'checking'
  });
  const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';
  const checkHealth = async () => {
    setStatus({
      backend: 'checking',
      database: 'checking',
      notifications: 'checking'
    });

    try {
      // Check backend health
      const healthResponse = await fetch(`${BACKEND_API_URL}/health`);
      if (healthResponse.ok) {
        setStatus(prev => ({ ...prev, backend: 'online' }));
        
        // Check if we can get tasks (database test)
        const tasksResponse = await fetch(`${BACKEND_API_URL}/api/get-tasks`);
        if (tasksResponse.ok) {
          setStatus(prev => ({ ...prev, database: 'online' }));
        } else {
          setStatus(prev => ({ ...prev, database: 'offline' }));
        }

        // Check notification configuration
        const schedulerResponse = await fetch(`${BACKEND_API_URL}/api/scheduler-status`);
        if (schedulerResponse.ok) {
          const data: { isRunning: boolean } = await schedulerResponse.json();
          if (data.isRunning) {
            setStatus(prev => ({ ...prev, notifications: 'configured' }));
          } else {
            setStatus(prev => ({ ...prev, notifications: 'partial' }));
          }
        } else {
          setStatus(prev => ({ ...prev, notifications: 'disabled' }));
        }
      } else {
        setStatus(prev => ({ 
          ...prev, 
          backend: 'offline',
          database: 'offline',
          notifications: 'disabled'
        }));
      }
    } catch (error: unknown) {
      console.error('Health check failed:', error);
      setStatus({
        backend: 'offline',
        database: 'offline',
        notifications: 'disabled'
      });
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'online':
      case 'configured': return 'task-habit'; // green
      case 'partial': return 'task-normal'; // blue
      case 'checking': return 'bg-yellow-500'; 
      case 'offline':
      case 'disabled': return 'task-event'; // red
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (statusValue: string) => {
    switch (statusValue) {
      case 'online': return '✅ Online';
      case 'configured': return '✅ Active';
      case 'partial': return '⚠️ Partial';
      case 'checking': return '⏳ Checking';
      case 'offline': return '❌ Offline';
      case 'disabled': return '❌ Disabled';
      default: return '❓ Unknown';
    }
  };

  return (
    <div className="minecraft-card mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">🔍 System Status</h3>
        <button 
          onClick={checkHealth}
          className="minecraft-btn text-xs"
        >
          🔄 Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className={`minecraft-container p-2 text-center ${getStatusColor(status.backend)}`}>
          <div className="font-bold text-white">Backend</div>
          <div className="text-white">{getStatusText(status.backend)}</div>
        </div>
        
        <div className={`minecraft-container p-2 text-center ${getStatusColor(status.database)}`}>
          <div className="font-bold text-white">Database</div>
          <div className="text-white">{getStatusText(status.database)}</div>
        </div>
        
        <div className={`minecraft-container p-2 text-center ${getStatusColor(status.notifications)}`}>
          <div className="font-bold text-white">Notifications</div>
          <div className="text-white">{getStatusText(status.notifications)}</div>
        </div>
      </div>

      {status.backend === 'offline' && (
        <div className="mt-3 p-2 minecraft-container bg-red-100 text-xs">
          <strong>⚠️ Backend Offline:</strong> Make sure the backend server is running on port 3001
          <br />
          <code>cd backend && pnpm dev</code>
        </div>
      )}
    </div>
  );
}
