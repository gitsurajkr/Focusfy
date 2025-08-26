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
    const [showHelp, setShowHelp] = useState(false); // Help section toggle

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
                <p className="text-sm pixel-font opacity-80 mb-4">
                    Configure your notification bots and services
                </p>
                <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="px-4 py-2 rounded pixel-border pixel-font text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-2 mx-auto"
                >
                    {showHelp ? 'Hide Setup Guide' : '❓ Need Help? Click Here'}
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
            {/* Help Section - Collapsible */}
            {showHelp && (
                <div className="pixel-border bg-[#181825]/80 p-6 mb-6 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold gaming-accent pixel-font">
                            🤖 BOT SETUP GUIDE
                        </h2>
                        <button
                            onClick={() => setShowHelp(false)}
                            className="text-xs pixel-font opacity-60 hover:opacity-100 hover:text-red-400 transition-all"
                        >
                            ✕ Close
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Telegram Bot Setup */}
                        <div className="border-l-4 border-[#0088cc] pl-4">
                            <h3 className="font-bold text-[#0088cc] pixel-font mb-2">TELEGRAM BOT SETUP</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm pixel-font opacity-90">
                                <li>Open Telegram and search for <code className="bg-[#232946] px-1 rounded">@BotFather</code></li>
                                <li>Send <code className="bg-[#232946] px-1 rounded">/start</code> to begin</li>
                                <li>Send <code className="bg-[#232946] px-1 rounded">/newbot</code> to create a new bot</li>
                                <li>Choose a name for your bot (e.g., "My Focusfy Bot")</li>
                                <li>Choose a username ending with "bot" (e.g., "focusfy_reminder_bot")</li>
                                <li>Copy the bot token from BotFather's message</li>
                                <li>Start a chat with your new bot and send any message</li>
                                <li className="bg-[#232946]/30 p-2 rounded border-l-2 border-cyan-400">
                                    <strong className="text-cyan-400">Easy way to get Chat ID:</strong>
                                    <br />Search for <code className="bg-[#232946] px-1 rounded">@myidbot</code> and send <code className="bg-[#232946] px-1 rounded">/getid</code>
                                </li>
                                <li className="opacity-60">
                                    <em>Alternative method:</em> Visit <code className="bg-[#232946] px-1 rounded text-xs">https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates</code> and look for the "id" field in the "chat" object
                                </li>
                            </ol>
                        </div>

                        {/* Discord Bot Setup */}
                        <div className="border-l-4 border-[#5865F2] pl-4">
                            <h3 className="font-bold text-[#5865F2] pixel-font mb-2">DISCORD BOT SETUP</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm pixel-font opacity-90">
                                <li>Go to <a href="https://discord.com/developers/applications" target="_blank" className="text-cyan-400 hover:underline">Discord Developer Portal</a></li>
                                <li>Click "New Application" and give it a name</li>
                                <li>Go to "Bot" section in the left sidebar</li>
                                <li>Click "Add Bot" and confirm</li>
                                <li>Copy the bot token (click "Copy" under Token section)</li>
                                <li>Go to "OAuth2" → "URL Generator"</li>
                                <li>Select "bot" scope and "Send Messages" permission</li>
                                <li>Copy the generated URL and invite the bot to your server</li>
                                <li>Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)</li>
                                <li>Right-click your target channel and select "Copy ID"</li>
                            </ol>
                        </div>

                        {/* Email Setup */}
                        <div className="border-l-4 border-[#ea4335] pl-4">
                            <h3 className="font-bold text-[#ea4335] pixel-font mb-2">EMAIL NOTIFICATIONS</h3>
                            <div className="text-sm pixel-font opacity-90">
                                <p className="mb-2">Simply enter the email address where you want to receive notifications.</p>
                                <p className="mb-2"><strong>Supported:</strong> Gmail, Outlook, Yahoo, and other email providers</p>
                                <p className="text-amber-400">⚠️ <strong>Note:</strong> Make sure the email address is correct - no confirmation email will be sent.</p>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-[#232946] p-4 rounded border border-cyan-400/30">
                            <h4 className="font-bold text-cyan-400 pixel-font mb-2">SECURITY TIPS</h4>
                            <ul className="list-disc list-inside space-y-1 text-xs pixel-font opacity-80">
                                <li>Keep your bot tokens private - never share them publicly</li>
                                <li>Only give bots the minimum permissions they need</li>
                                <li>You can revoke and regenerate tokens anytime from the respective platforms</li>
                                <li>Test your configuration using the notification test feature after setup</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            
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
