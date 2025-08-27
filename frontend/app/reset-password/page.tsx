'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
        <div className="gaming-card max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="pixel-font text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021]">
      <div className="gaming-card max-w-md w-full p-8 relative">
        <div className="text-center mb-8 mt-2">
          <div className="mx-auto h-12 w-12 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2h-6m6 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h2M7 7a2 2 0 012-2h6a2 2 0 012 2m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2V7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold gaming-accent pixel-font mb-2">
            Reset Your Password
          </h2>
          <p className="text-sm text-white/70 pixel-font">
            Enter your new password below
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-xs mb-1 pixel-font">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gaming-input w-full pr-10"
                placeholder="Enter your new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.3 512.5 176.8C465.7 133.3 401 96.4 320.2 96.4C284.1 96.4 249.8 103.8 218.1 117.3L157.8 57C148.4 47.6 133.2 47.6 123.8 57C114.5 66.4 114.4 81.6 123.7 91L73 39.1ZM394.9 284.2L284.2 173.5C297.2 164.1 312.7 158.4 329.4 158.4C383.8 158.4 427.8 202.4 427.8 256.8C427.8 273.5 422.1 289 412.7 302L394.9 284.2ZM192.9 120.6L137.4 176.1C90.6 219.6 59.3 271.5 44.4 307.2C41.1 315.1 41.1 323.9 44.4 331.8C59.3 367.5 90.6 419.4 137.4 462.9C184.2 506.4 248.9 543.3 329.7 543.3C365.8 543.3 400.1 535.9 431.8 522.4L487.3 467C540.1 423.5 571.4 371.6 586.3 335.9L192.9 120.6Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220.1 512.6 176.6C465.5 132.8 400.8 96 320 96ZM320 416C266.1 416 224 373.9 224 320C224 266.1 266.1 224 320 224C373.9 224 416 266.1 416 320C416 373.9 373.9 416 320 416ZM320 256C282.1 256 256 282.1 256 320C256 357.9 282.1 384 320 384C357.9 384 384 357.9 384 320C384 282.1 357.9 256 320 256Z"/></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs mb-1 pixel-font">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="gaming-input w-full pr-10"
                placeholder="Confirm your new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M73 39.1C63.6 29.7 48.4 29.7 39.1 39.1C29.8 48.5 29.7 63.7 39 73.1L567 601.1C576.4 610.5 591.6 610.5 600.9 601.1C610.2 591.7 610.3 576.5 600.9 567.2L504.5 470.8C507.2 468.4 509.9 466 512.5 463.6C559.3 420.1 590.6 368.2 605.5 332.5C608.8 324.6 608.8 315.8 605.5 307.9C590.6 272.2 559.3 220.3 512.5 176.8C465.7 133.3 401 96.4 320.2 96.4C284.1 96.4 249.8 103.8 218.1 117.3L157.8 57C148.4 47.6 133.2 47.6 123.8 57C114.5 66.4 114.4 81.6 123.7 91L73 39.1ZM394.9 284.2L284.2 173.5C297.2 164.1 312.7 158.4 329.4 158.4C383.8 158.4 427.8 202.4 427.8 256.8C427.8 273.5 422.1 289 412.7 302L394.9 284.2ZM192.9 120.6L137.4 176.1C90.6 219.6 59.3 271.5 44.4 307.2C41.1 315.1 41.1 323.9 44.4 331.8C59.3 367.5 90.6 419.4 137.4 462.9C184.2 506.4 248.9 543.3 329.7 543.3C365.8 543.3 400.1 535.9 431.8 522.4L487.3 467C540.1 423.5 571.4 371.6 586.3 335.9L192.9 120.6Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 640 640"><path fill="#ffffff" d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220.1 512.6 176.6C465.5 132.8 400.8 96 320 96ZM320 416C266.1 416 224 373.9 224 320C224 266.1 266.1 224 320 224C373.9 224 416 266.1 416 320C416 373.9 373.9 416 320 416ZM320 256C282.1 256 256 282.1 256 320C256 357.9 282.1 384 320 384C357.9 384 384 357.9 384 320C384 282.1 357.9 256 320 256Z"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="pixel-border bg-red-900/20 text-red-400 p-3 text-xs">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {message && (
            <div className="pixel-border bg-green-900/20 text-green-400 p-3 text-xs">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="gaming-btn w-full px-6 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push('/signin')}
              className="text-xs text-cyan-400 hover:underline pixel-font"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
