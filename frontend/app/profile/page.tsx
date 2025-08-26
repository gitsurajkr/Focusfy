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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    const loadingToastId = showToast.loading('Updating password...');

    try {
      const response = await api.patch('/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Use the success message from the backend response
      const successMessage = response.data?.message || 'Password updated successfully!';
      showToast.update(loadingToastId, successMessage, 'success');

      // Clear the form after successful password change
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
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
                >
                  {showCurrentPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>

                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>

                    )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-2 pixel-font">New Password:</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>

                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>

                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-2 pixel-font">Confirm Password:</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.2 512.5 176.8C465.4 133.1 400.7 96.2 319.9 96.2C263.1 96.2 214.3 114.4 173.9 140.4L73 39.1zM236.5 202.7C260 185.9 288.9 176 320 176C399.5 176 464 240.5 464 320C464 351.1 454.1 379.9 437.3 403.5L402.6 368.8C415.3 347.4 419.6 321.1 412.7 295.1C399 243.9 346.3 213.5 295.1 227.2C286.5 229.5 278.4 232.9 271.1 237.2L236.4 202.5zM357.3 459.1C345.4 462.3 332.9 464 320 464C240.5 464 176 399.5 176 320C176 307.1 177.7 294.6 180.9 282.7L101.4 203.2C68.8 240 46.4 279 34.5 307.7C31.2 315.6 31.2 324.4 34.5 332.3C49.4 368 80.7 420 127.5 463.4C174.6 507.1 239.3 544 320.1 544C357.4 544 391.3 536.1 421.6 523.4L357.4 459.2z" /></svg>

                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" /></svg>

                    )}
                  </button>
                </div>
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
