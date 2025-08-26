'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { ApiError } from '../../types';

export default function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
    
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    const loadingToastId = showToast.loading('Updating profile...');

    try {
      const response = await api.put('/api/update-profile', formData);
      showToast.update(loadingToastId, 'Profile updated successfully!', 'success');
      
      // Update user context with the response data
      if (response.data && response.data.user) {
        updateUser(response.data.user);
      } else {
        // If no user data in response, update with form data
        updateUser({ name: formData.name, email: formData.email });
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) {
        logout();
      } else {
        console.error('Error updating profile:', apiError);
        showToast.update(loadingToastId, apiError.response?.data?.error || 'Failed to update profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    
    // TODO: Implement password change endpoint in backend
    setTimeout(() => {
      showToast.info('Password change feature is not yet implemented on the server');
      setPasswordLoading(false);
    }, 1000);
    
    return;
    
    /* 
    const loadingToastId = showToast.loading('Updating password...');

    try {
      const response = await api.put('/api/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast.update(loadingToastId, 'Password updated successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) {
        logout();
      } else {
        console.error('Error updating password:', apiError);
        showToast.update(loadingToastId, apiError.response?.data?.error || 'Failed to update password', 'error');
      }
    } finally {
      setPasswordLoading(false);
    }
    */
  };

  if (!user) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021] flex items-center justify-center">
        <div className="pixel-border bg-[#181825]/80 p-6 text-center">
          <p className="pixel-font">Please sign in to access profile settings.</p>
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
            PROFILE SETTINGS
          </h1>
          <p className="text-sm pixel-font opacity-80">
            Manage your account information and security settings
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Information */}
        <div className="pixel-border bg-[#181825]/80 p-6">
          <h2 className="text-lg font-bold gaming-accent pixel-font mb-4 text-center">
            PROFILE INFORMATION
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-2 pixel-font">Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-2 pixel-font">Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded pixel-border pixel-font bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'UPDATING...' : 'UPDATE PROFILE'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Change */}
        <div className="pixel-border bg-[#181825]/80 p-6">
          <h2 className="text-lg font-bold gaming-accent pixel-font mb-4 text-center">
            CHANGE PASSWORD
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-2 pixel-font">Current Password:</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-2 pixel-font">New Password:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-2 pixel-font">Confirm Password:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2 rounded pixel-border pixel-font bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'UPDATING...' : 'CHANGE PASSWORD'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="pixel-border bg-[#181825]/80 p-6">
          <h2 className="text-lg font-bold gaming-accent pixel-font mb-4 text-center">
            ACCOUNT STATS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="pixel-border bg-[#232946]/50 p-4">
              <div className="text-xs pixel-font mt-2">Account Status</div>
              <div className="text-sm font-bold text-green-400 pixel-font">Active</div>
            </div>
            <div className="pixel-border bg-[#232946]/50 p-4">
              <div className="text-xs pixel-font mt-2">Member Since</div>
              <div className="text-sm font-bold text-blue-400 pixel-font">
                {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
