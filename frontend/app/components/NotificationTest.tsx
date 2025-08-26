'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';
import { ApiError } from '../../types';

interface NotificationTestProps {
    tasks: {
        id: string;
        title: string;
        type: string;
        channel: string[];
    }[];
}

export default function NotificationTest({ tasks }: NotificationTestProps) {
    const { token, user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [schedulerStatus, setSchedulerStatus] = useState<{
        isRunning: boolean;
        activeJobs: number;
        cacheSize: number;
        lastCheck: string;
    } | null>(null);

    // Always fetch latest user profile on mount and when token changes
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;
            try {
                // console.log('NotificationTest: Fetching user profile...');
                const res = await api.get('/api/user/me');
                // console.log('NotificationTest: Received user data:', res.data.user);
                updateUser(res.data.user);
            } catch (e) {
                console.error('NotificationTest: Failed to fetch user:', e);
            }
        };
        fetchUser();
    }, [token, updateUser]);

    // Also add an effect that listens for user changes
    useEffect(() => {
        // console.log('NotificationTest: User state changed:', user);
    }, [user]);

    // Listen for window focus to refresh user data (when user comes back from settings)
    useEffect(() => {
        const handleFocus = () => {
            // console.log('NotificationTest: Window focused, refreshing user data...');
            refreshUserData();
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [token, updateUser]);

    const refreshUserData = async () => {
        if (!token) return;
        try {
            // console.log('NotificationTest: Manually refreshing user profile...');
            const res = await api.get('/api/user/me');
            // console.log('NotificationTest: Manual refresh - received user data:', res.data.user);
            updateUser(res.data.user);
            showToast.success('User data refreshed!');
        } catch (e) {
            console.error('NotificationTest: Failed to refresh user:', e);
            showToast.error('Failed to refresh user data');
        }
    };
    const getServiceStatus = (service: 'telegram' | 'discord' | 'gmail') => {
        // console.log(`NotificationTest: Checking ${service} status for user:`, user);
        if (service === 'telegram') {
            const status = user?.telegramBotToken && user?.telegramChatId ? 'Configured' : 'Not Configured';
            // console.log(`NotificationTest: Telegram status: ${status}, token: ${!!user?.telegramBotToken}, chatId: ${!!user?.telegramChatId}`);
            return status;
        } else if (service === 'discord') {
            const status = user?.discordBotToken && user?.discordChannelId ? 'Configured' : 'Not Configured';
            // console.log(`NotificationTest: Discord status: ${status}, token: ${!!user?.discordBotToken}, channelId: ${!!user?.discordChannelId}`);
            return status;
        } else if (service === 'gmail') {
            const status = user?.gmailTo ? 'Configured' : 'Not Configured';
            // console.log(`NotificationTest: Gmail status: ${status}, gmailTo: ${user?.gmailTo}`);
            return status;
        }
        return 'Not Configured';
    };

    const testNotification = async (taskId: string) => {
        setLoading(true);
        setResult(null);
        const loadingToastId = showToast.loading('Testing notification...');

        try {
            const response = await api.post(`/api/test-notification/${taskId}`);
            const message = `${response.data.message}`;
            setResult(message);
            showToast.update(loadingToastId, 'Notification test completed!', 'success');
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.error || apiError.message || 'Unknown error';
            const result = `Error: ${errorMessage}`;
            setResult(result);
            showToast.update(loadingToastId, `Notification test failed: ${errorMessage}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const checkSchedulerStatus = async () => {
        try {
            const response = await api.get('/api/scheduler-status');
            setSchedulerStatus(response.data);
            showToast.info('Scheduler status refreshed ');
        } catch (error) {
            const apiError = error as ApiError;
            showToast.error('Failed to check scheduler status');
            console.error('Error checking scheduler status:', apiError);
        }
    };

    const testGmail = async () => {
        if (!user?.gmailTo) {
            setResult('❌ Gmail not configured. Please add your email address in Settings first.');
            return;
        }

        setLoading(true);
        setResult('📧 Testing Gmail service...');
        
        try {
            // console.log('Testing Gmail for user:', user.gmailTo);
            const response = await api.post('/api/test-gmail');
            // console.log('Gmail test response:', response.data);
            setResult(`${response.data.message}`);
            showToast.success('Gmail test successful!');
        } catch (error) {
            console.error('Gmail test error:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
            setResult(`Gmail test failed: ${errorMessage}`);
            showToast.error(`Gmail test failed: ${errorMessage}`);
        }
        setLoading(false);
    };

    const testTelegram = async () => {
        if (!user?.telegramBotToken || !user?.telegramChatId) {
            setResult('Telegram not configured. Please add your bot token and chat ID in Settings first.');
            return;
        }

        setLoading(true);
        setResult('📱 Testing Telegram service...');
        
        try {
            // console.log('Testing Telegram for chat:', user.telegramChatId);
            const response = await api.post('/api/test-telegram', {
                message: 'Test notification from your task app! 🚀'
            });
            // console.log('Telegram test response:', response.data);
            setResult(`${response.data.message}`);
            showToast.success('Telegram test successful!');
        } catch (error) {
            console.error('Telegram test error:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
            setResult(`Telegram test failed: ${errorMessage}`);
            showToast.error(`Telegram test failed: ${errorMessage}`);
        }
        setLoading(false);
    };

    const testDiscord = async () => {
        if (!user?.discordBotToken || !user?.discordChannelId) {
            setResult('Discord not configured. Please add your bot token and channel ID in Settings first.');
            return;
        }

        setLoading(true);
        setResult('Testing Discord service...');
        
        try {
            // console.log('Testing Discord for channel:', user.discordChannelId);
            const response = await api.post('/api/test-discord', {
                message: 'Test notification from your task app!'
            });
            // console.log('Discord test response:', response.data);
            setResult(`${response.data.message}`);
            showToast.success('Discord test successful!');
        } catch (error) {
            console.error('Discord test error:', error);
            const apiError = error as ApiError;
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
            setResult(`Discord test failed: ${errorMessage}`);
            showToast.error(`Discord test failed: ${errorMessage}`);
        }
        setLoading(false);
    };

    return (
        <div className="gaming-card max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-center gaming-accent pixel-font mb-2 tracking-wider">Notification Tests</h2>
                    <p className="text-sm text-center pixel-font mb-6 text-white/80">Test your notification integrations and scheduler status</p>
                </div>
                <button
                    onClick={refreshUserData}
                    className="gaming-btn text-xs px-4 py-2"
                    title="Refresh user data"
                >
                    Refresh
                </button>
            </div>

            {/* Service Status */}
            <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gmail */}
                    <div className={`pixel-border p-4 flex flex-col items-center ${user?.gmailTo ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                        <span className="font-bold pixel-font text-base mb-1">Gmail</span>
                        <span className={`text-xs font-semibold ${user?.gmailTo ? 'text-green-400' : 'text-red-400'}`}>{getServiceStatus('gmail')}</span>
                        {user?.gmailTo && <span className="text-xs mt-1 text-white/60">{user.gmailTo}</span>}
                    </div>
                    {/* Telegram */}
                    <div className={`pixel-border p-4 flex flex-col items-center ${(user?.telegramBotToken && user?.telegramChatId) ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                        <span className="font-bold pixel-font text-base mb-1">Telegram</span>
                        <span className={`text-xs font-semibold ${(user?.telegramBotToken && user?.telegramChatId) ? 'text-green-400' : 'text-red-400'}`}>{getServiceStatus('telegram')}</span>
                        {user?.telegramChatId && <span className="text-xs mt-1 text-white/60">Chat: {user.telegramChatId}</span>}
                    </div>
                    {/* Discord */}
                    <div className={`pixel-border p-4 flex flex-col items-center ${(user?.discordBotToken && user?.discordChannelId) ? 'bg-green-900/10' : 'bg-red-900/10'}`}>
                     
                        <span className="font-bold pixel-font text-base mb-1">Discord</span>
                        <span className={`text-xs font-semibold ${(user?.discordBotToken && user?.discordChannelId) ? 'text-green-400' : 'text-red-400'}`}>{getServiceStatus('discord')}</span>
                        {user?.discordChannelId && <span className="text-xs mt-1 text-white/60">Channel: {user.discordChannelId}</span>}
                    </div>
                </div>
            </div>

            {/* Scheduler Status */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-semibold pixel-font mb-2 text-white/80">Scheduler Status</p>
                        {schedulerStatus ? (
                            <div className="pixel-border p-3 bg-[#181825]/80 text-xs space-y-1">
                                <div>Status: <span className={schedulerStatus.isRunning ? 'text-green-400' : 'text-red-400'}>{schedulerStatus.isRunning ? 'Running' : 'Stopped'}</span></div>
                                <div>Active Jobs: {schedulerStatus.activeJobs}</div>
                                <div>Cache Size: {schedulerStatus.cacheSize}</div>
                                <div>Last Check: {new Date(schedulerStatus.lastCheck).toLocaleString()}</div>
                            </div>
                        ) : (
                            <div className="text-xs text-white/60">No status loaded yet.</div>
                        )}
                    </div>
                    <button
                        onClick={checkSchedulerStatus}
                        className="gaming-btn mt-2 md:mt-0 px-6 py-2 text-sm"
                    >
                        Check Scheduler Status
                    </button>
                </div>
            </div>

            {/* Individual Service Tests */}
            <div className="mb-8">
                <h3 className="text-base font-bold pixel-font mb-4 text-white/90">🧪 Test Individual Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Gmail */}
                    <div className="pixel-border p-4 flex flex-col gap-2 bg-[#232946]/60">
                        <span className="font-bold pixel-font text-sm mb-1">Gmail</span>
                        <span className="text-xs text-white/60 mb-2">{user?.gmailTo ? `Send test email to ${user.gmailTo}` : 'Configure Gmail in settings first'}</span>
                        <button
                            onClick={testGmail}
                            disabled={loading || !user?.gmailTo}
                            className="gaming-btn text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Test Gmail'}
                        </button>
                    </div>
                    {/* Telegram */}
                    <div className="pixel-border p-4 flex flex-col gap-2 bg-[#232946]/60">
                        <span className="font-bold pixel-font text-sm mb-1">📱 Telegram</span>
                        <span className="text-xs text-white/60 mb-2">{(user?.telegramBotToken && user?.telegramChatId) ? `Send test message to chat ${user.telegramChatId}` : 'Configure Telegram in settings first'}</span>
                        <button
                            onClick={testTelegram}
                            disabled={loading || !user?.telegramBotToken || !user?.telegramChatId}
                            className="gaming-btn text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Test Telegram'}
                        </button>
                    </div>
                    {/* Discord */}
                    <div className="pixel-border p-4 flex flex-col gap-2 bg-[#232946]/60">
                        <span className="font-bold pixel-font text-sm mb-1">Discord</span>
                        <span className="text-xs text-white/60 mb-2">{(user?.discordBotToken && user?.discordChannelId) ? `Send test message to channel ${user.discordChannelId}` : 'Configure Discord in settings first'}</span>
                        <button
                            onClick={testDiscord}
                            disabled={loading || !user?.discordBotToken || !user?.discordChannelId}
                            className="gaming-btn text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Test Discord'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Notification Test */}
            <div className="mb-8">
                <h3 className="text-base font-bold pixel-font mb-4 text-white/90">Test Notifications for Tasks</h3>
                {tasks.length === 0 ? (
                    <p className="text-xs text-white/60">No tasks available for testing</p>
                ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between pixel-border p-3 bg-[#181825]/80">
                                <div className="flex-1 mr-2">
                                    <div className="text-xs font-bold pixel-font text-white/90">{task.title}</div>
                                    <div className="text-xs text-white/60">
                                        {task.type} • Channels: {task.channel.join(', ') || 'None'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => testNotification(task.id)}
                                    disabled={loading || task.channel.length === 0}
                                    className="gaming-btn text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Loading...' : 'Test'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Test Results */}
            {result && (
                <div className="mb-4">
                    <h4 className="text-sm font-bold pixel-font mb-2 text-white/90">Result:</h4>
                    <div className={`pixel-border p-3 text-xs ${
                        result.includes('✅') ? 'bg-green-900/20 border-green-600' : 
                        result.includes('❌') ? 'bg-red-900/20 border-red-600' : 'bg-blue-900/20 border-blue-600'
                    }`}>{result}</div>
                </div>
            )}

            {/* Settings Link */}
            <div className="text-center mt-8">
                <Link href="/bot-config" className="gaming-btn text-xs px-6 py-2">
                    Go to Notification Settings
                </Link>
            </div>
        </div>
    );
};

