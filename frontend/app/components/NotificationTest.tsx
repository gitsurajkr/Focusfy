'use client';

import { useState } from 'react';

interface NotificationTestProps {
    tasks: any[];
}

export default function NotificationTest({ tasks }: NotificationTestProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [schedulerStatus, setSchedulerStatus] = useState<any>(null);

    const testNotification = async (taskId: string) => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`http://localhost:3001/api/test-notification/${taskId}`, {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setResult(`✅ ${data.message}`);
            } else {
                setResult(`❌ ${data.error}`);
            }
        } catch (error: any) {
            setResult(`❌ Error: ${error?.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const checkSchedulerStatus = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/scheduler-status');
            const data = await response.json();
            setSchedulerStatus(data);
        } catch (error) {
            console.error('Error checking scheduler status:', error);
        }
    };

    return (
        <div className="minecraft-card mb-6">
            <h3 className="text-sm mb-4 text-center">🧪 NOTIFICATION TESTING</h3>

            {/* Scheduler Status */}
            <div className="mb-4">
                <button
                    onClick={checkSchedulerStatus}
                    className="minecraft-btn task-normal mb-2"
                >
                    Check Scheduler Status
                </button>

                {schedulerStatus && (
                    <div className="minecraft-container p-3 text-xs">
                        <div>⏰ Status: {schedulerStatus.isRunning ? 'Running' : 'Stopped'}</div>
                        <div>🔄 Active Jobs: {schedulerStatus.activeJobs}</div>
                        <div>💾 Cache Size: {schedulerStatus.cacheSize}</div>
                        <div>🕐 Last Check: {new Date(schedulerStatus.lastCheck).toLocaleString()}</div>
                    </div>
                )}
            </div>

            {/* Test Notifications */}
            <div className="mb-4">
                <p className="text-xs mb-2">Select a task to test notifications:</p>

                {tasks.length === 0 ? (
                    <p className="text-xs opacity-60">No tasks available for testing</p>
                ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 minecraft-container">
                                <div className="flex-1 mr-2">
                                    <div className="text-xs font-bold">{task.title}</div>
                                    <div className="text-xs opacity-60">
                                        {task.type} • Channels: {task.channel.join(', ') || 'None'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => testNotification(task.id)}
                                    disabled={loading || task.channel.length === 0}
                                    className={`minecraft-btn text-xs ${task.type === 'EVENT' ? 'task-event' :
                                            task.type === 'HABIT' ? 'task-habit' : 'task-normal'
                                        } ${(loading || task.channel.length === 0) ? 'opacity-50' : ''}`}
                                >
                                    {loading ? '⏳' : '🧪 Test'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Result Display */}
            {result && (
                <div className="minecraft-container p-3 text-xs">
                    <strong>Result:</strong> {result}
                </div>
            )}

            {/* Configuration Help */}
            {/* <div className="mt-4 p-3 minecraft-container bg-yellow-100">
                <p className="text-xs font-bold mb-2">🔧 Setup Required:</p>
                <div className="text-xs space-y-1">
                    <div>1. Create Telegram bot with @BotFather</div>
                    <div>2. Add bot token to backend .env file</div>
                    <div>3. Get your chat ID and add to .env</div>
                    <div>4. Create Discord bot and invite to server</div>
                    <div>5. Add Discord bot token and channel ID to .env</div>
                    <div>6. Restart backend server</div>
                </div>
            </div> */}
        </div>
    );
}
