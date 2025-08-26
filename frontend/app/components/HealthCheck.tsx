'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function HealthCheck() {
  const { token } = useAuth();
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
        const tasksResponse = await fetch(`${BACKEND_API_URL}/api/get-tasks`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (tasksResponse.ok) {
          setStatus(prev => ({ ...prev, database: 'online' }));
        } else {
          setStatus(prev => ({ ...prev, database: 'offline' }));
        }

        // Check notification configuration
        const schedulerResponse = await fetch(`${BACKEND_API_URL}/api/scheduler-status`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
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

  const getStatusColor = (status: 'checking' | 'online' | 'offline' | 'configured' | 'partial' | 'disabled') => {
    switch (status) {
      case 'online': return 'bg-gradient-to-r from-green-500 to-emerald-500'; // green
      case 'checking': return 'bg-gradient-to-r from-yellow-500 to-orange-500'; // yellow
      case 'offline': return 'bg-gradient-to-r from-pink-500 to-red-500'; // red
      case 'configured': return 'bg-gradient-to-r from-green-500 to-emerald-500'; // green
      case 'partial': return 'bg-gradient-to-r from-blue-600 to-purple-600'; // blue
      case 'disabled': return 'bg-gradient-to-r from-pink-500 to-red-500'; // red
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  const getStatusText = (statusValue: string) => {
    switch (statusValue) {
      case 'online': return 'Online';
      case 'configured': return 'Active';
      case 'partial': return 'Partial';
      case 'checking': return 'Checking';
      case 'offline': return 'Offline';
      case 'disabled': return 'Disabled';
      default: return 'Unknown';
    }
  };

  return (
    <div className="pixel-border bg-[#181825]/80 p-6 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold pixel-font gaming-accent uppercase tracking-wider">System Status</h3>
        <button 
          onClick={checkHealth}
          className="px-3 py-1 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
        >
           Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <div className={`pixel-border p-2 text-center ${getStatusColor(status.backend)}`}>
          <div className="font-bold text-white pixel-font">Backend</div>
          <div className="text-white pixel-font">{getStatusText(status.backend)}</div>
        </div>
        
        <div className={`pixel-border p-2 text-center ${getStatusColor(status.database)}`}>
          <div className="font-bold text-white pixel-font">Database</div>
          <div className="text-white pixel-font">{getStatusText(status.database)}</div>
        </div>
        
        <div className={`pixel-border p-2 text-center ${getStatusColor(status.notifications)}`}>
          <div className="font-bold text-white pixel-font">Notifications</div>
          <div className="text-white pixel-font">{getStatusText(status.notifications)}</div>
        </div>
      </div>

      {status.backend === 'offline' && (
        <div className="mt-3 p-2 pixel-border bg-[#232946]/80 text-xs">
          <p className="pixel-font text-red-400">
            <strong> Backend Offline:</strong> Make sure the backend server is running on port 3001
          </p>
          <code className="pixel-font text-cyan-400 text-xs block mt-1">cd backend && pnpm dev</code>
        </div>
      )}
    </div>
  );
}
