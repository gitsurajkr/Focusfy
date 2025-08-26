'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../../lib/api';
import { showToast } from '../../lib/toast';

export default function BotConfigPage() {
    const { user, token, logout, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        telegramBotToken: '',
        telegramChatId: '',
        discordBotToken: '',
        discordChannelId: '',
        gmailTo: ''
    });
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(0); // Force re-render trigger
    const [currentUser, setCurrentUser] = useState(user); // Local user state for immediate updates

    useEffect(() => {
        setCurrentUser(user); // Update local user state when context user changes
        if (user) {
            setFormData({
            telegramBotToken: user.telegramBotToken || '',
            telegramChatId: user.telegramChatId || '',
            discordBotToken: user.discordBotToken || '',
            discordChannelId: user.discordChannelId || '',
            gmailTo: user.gmailTo || ''
        });
    }
}, [user]);

    // Debug user state changes
    useEffect(() => {
        // console.log('BotConfig: User state changed:', user);
    }, [user]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // console.log('BotConfig: Submitting form with data:', formData);
    // console.log('BotConfig: Current user before update:', user);

    setLoading(true);
    const loadingToastId = showToast.loading('Updating bot configuration...');

    try {
        // First, update the profile with the form data
        const updateRes = await api.put('/api/update-profile', formData);
        
        // Then fetch the latest user data
        const meRes = await api.get('/api/user/me');
        
        updateUser(meRes.data.user);
        
        setCurrentUser(meRes.data.user);
        
        setLastUpdate(Date.now());
        
        showToast.update(loadingToastId, 'Bot configuration updated successfully!', 'success');
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401) {
            logout();
        } else {
            console.error('Error updating profile:', error);
            showToast.update(
            loadingToastId,
            typeof error === 'object' && error !== null && 'response' in error
                ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update configuration'
                : 'Failed to update configuration',
            'error'
            );
        }
    } finally {
        setLoading(false);
    }
};

if (!user) {
    return (
        <div className="min-h-screen p-4 bg-gradient-to-br from-[#181825] via-[#232946] to-[#0f1021] flex items-center justify-center">
            <div className="pixel-border bg-[#181825]/80 p-6 text-center">
                <p className="pixel-font">Please sign in to configure bots.</p>
            </div>
        </div>
    );
}


const getServiceStatus = (service: 'telegram' | 'discord' | 'gmail') => {
    // Using currentUser for immediate updates and lastUpdate to ensure fresh evaluation
    const userToCheck = currentUser || user;
  
    // console.log(`BotConfig: Checking ${service} status for user:`, userToCheck);
    if (service === 'telegram') {
        const status = userToCheck?.telegramBotToken && userToCheck?.telegramChatId ? ' Configured' : ' Not Configured';
        // console.log(`BotConfig: Telegram status: ${status}, token: ${!!userToCheck?.telegramBotToken}, chatId: ${!!userToCheck?.telegramChatId}`);
        return status;
    } else if (service === 'discord') {
        const status = userToCheck?.discordBotToken && userToCheck?.discordChannelId ? ' Configured' : 'Not Configured';
        return status;
    } else if (service === 'gmail') {
        const status = userToCheck?.gmailTo ? 'Configured' : ' Not Configured';
        // console.log(`BotConfig: Gmail status: ${status}, gmailTo: ${userToCheck?.gmailTo}`);
        return status;
    }
    return ' Not Configured';
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
                    BOT CONFIGURATION
                </h1>
                <p className="text-sm pixel-font opacity-80">
                    Configure your notification bots and services
                </p>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Telegram Configuration */}
                <div className="pixel-border bg-[#181825]/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold gaming-accent pixel-font">
                            TELEGRAM BOT
                        </h2>
                        <span className="text-xs pixel-font">{getServiceStatus('telegram')}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs mb-2 pixel-font">Bot Token:</label>
                            <input
                                type="password"
                                value={formData.telegramBotToken}
                                onChange={(e) => setFormData(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                                className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                                placeholder="Enter Telegram Bot Token"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-2 pixel-font">Chat ID:</label>
                            <input
                                type="text"
                                value={formData.telegramChatId}
                                onChange={(e) => setFormData(prev => ({ ...prev, telegramChatId: e.target.value }))}
                                className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                                placeholder="Enter Telegram Chat ID"
                            />
                        </div>
                    </div>
                </div>

                {/* Discord Configuration */}
                <div className="pixel-border bg-[#181825]/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold gaming-accent pixel-font">
                            DISCORD BOT
                        </h2>
                        <span className="text-xs pixel-font">{getServiceStatus('discord')}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs mb-2 pixel-font">Bot Token:</label>
                            <input
                                type="password"
                                value={formData.discordBotToken}
                                onChange={(e) => setFormData(prev => ({ ...prev, discordBotToken: e.target.value }))}
                                className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                                placeholder="Enter Discord Bot Token"
                            />
                        </div>
                        <div>
                            <label className="block text-xs mb-2 pixel-font">Channel ID:</label>
                            <input
                                type="text"
                                value={formData.discordChannelId}
                                onChange={(e) => setFormData(prev => ({ ...prev, discordChannelId: e.target.value }))}
                                className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                                placeholder="Enter Discord Channel ID"
                            />
                        </div>
                    </div>
                </div>

                {/* Gmail Configuration */}
                <div className="pixel-border bg-[#181825]/80 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold gaming-accent pixel-font">
                            EMAIL NOTIFICATIONS
                        </h2>
                        <span className="text-xs pixel-font">{getServiceStatus('gmail')}</span>
                    </div>
                    <div>
                        <label className="block text-xs mb-2 pixel-font">Email Address:</label>
                        <input
                            type="email"
                            value={formData.gmailTo}
                            onChange={(e) => setFormData(prev => ({ ...prev, gmailTo: e.target.value }))}
                            className="w-full pixel-border pixel-font bg-[#232946] text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-400"
                            placeholder="Enter email address for notifications"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded pixel-border pixel-font bg-gradient-to-r from-green-500 to-emerald-500 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'SAVING...' : 'SAVE CONFIGURATION'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
}
