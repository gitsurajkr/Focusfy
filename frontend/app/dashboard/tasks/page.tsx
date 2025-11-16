"use client"

import { useState, FormEvent } from "react"
import { Plus, Edit2, Trash2, X, Loader2, Calendar, Bell, Repeat } from 'lucide-react'
import { useTasks } from "@/hooks/useTasks"

export default function TasksPage() {
  const { tasks, loading, error, addTask, updateTask, deleteTask: removeTask } = useTasks()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    type: "NORMAL" as "NORMAL" | "TIMED_EVENT",
    tags: "",
    startDate: "",
    dueDate: "",
    reminderBefore: "",
    reminderEvery: "",
    repeatInterval: "",
    channels: {
      telegram: false,
      discord: false,
      gmail: false,
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const selectedChannels: string[] = []
      if (formData.channels.telegram) selectedChannels.push('telegram')
      if (formData.channels.discord) selectedChannels.push('discord')
      if (formData.channels.gmail) selectedChannels.push('gmail')

      const taskData = {
        title: formData.title,
        type: formData.type,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        reminder_before: formData.reminderBefore ? parseInt(formData.reminderBefore) : undefined,
        reminder_every: formData.reminderEvery ? parseInt(formData.reminderEvery) : undefined,
        repeat_interval: formData.repeatInterval ? parseInt(formData.repeatInterval) : undefined,
        channel: selectedChannels,
        completed: false,
      }

      if (editingTask) {
        await updateTask(editingTask, taskData)
        setEditingTask(null)
      } else {
        await addTask(taskData)
      }
      
      setFormData({
        title: "",
        type: "NORMAL",
        tags: "",
        startDate: "",
        dueDate: "",
        reminderBefore: "",
        reminderEvery: "",
        repeatInterval: "",
        channels: { telegram: false, discord: false, gmail: false },
      })
      setShowTaskForm(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (task: typeof tasks[0]) => {
    setEditingTask(task.id)
    
    // Helper to safely format date for datetime-local input
    const formatDateForInput = (dateValue: Date | null | undefined): string => {
      if (!dateValue) return "";
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
    };
    
    setFormData({
      title: task.title,
      type: task.type,
      tags: task.tags.join(', '),
      startDate: formatDateForInput(task.start_date),
      dueDate: formatDateForInput(task.due_date),
      reminderBefore: task.reminder_before?.toString() || "",
      reminderEvery: task.reminder_every?.toString() || "",
      repeatInterval: task.repeat_interval?.toString() || "",
      channels: {
        telegram: task.channel.includes('telegram'),
        discord: task.channel.includes('discord'),
        gmail: task.channel.includes('gmail'),
      },
    })
    setShowTaskForm(true)
  }

  const handleDeleteClick = (taskId: string) => {
    setDeleteTaskId(taskId)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTaskId) return
    try {
      await removeTask(deleteTaskId)
      setShowDeleteConfirm(false)
      setDeleteTaskId(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleCompleted = async (task: typeof tasks[0]) => {
    try {
      await updateTask(task.id, { completed: !task.completed })
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/10">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">Missions</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base lg:text-lg">Manage your tasks and objectives</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null)
              setFormData({
                title: "",
                type: "NORMAL",
                tags: "",
                startDate: "",
                dueDate: "",
                reminderBefore: "",
                reminderEvery: "",
                repeatInterval: "",
                channels: { telegram: false, discord: false, gmail: false },
              })
              setShowTaskForm(true)
            }}
            className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-linear-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth flex items-center justify-center gap-2 font-semibold text-sm md:text-base"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span className="hidden xs:inline">Create Mission</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-muted-foreground">Loading missions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
            {error}
          </div>
        )}

        {/* Task List */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {(tasks || []).length === 0 ? (
              <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/40">
                <Calendar size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No missions yet</h3>
                <p className="text-muted-foreground">Create your first mission to get started!</p>
              </div>
            ) : (
              (tasks || []).map((task) => (
                <div
                  key={task.id}
                  className="group bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-4 md:p-6 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex items-start gap-2 md:gap-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleCompleted(task)}
                        className="mt-1 w-4 h-4 md:w-5 md:h-5 rounded border-2 border-primary cursor-pointer shrink-0"
                      />
                      <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                        <div>
                          <h3 className={`text-sm md:text-base lg:text-lg font-semibold wrap-break-word ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.type === 'TIMED_EVENT' 
                                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30' 
                                : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                            }`}>
                              {task.type === 'TIMED_EVENT' ? 'Scheduled Event' : 'Standard Task'}
                            </span>
                            {task.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/15 text-secondary border border-secondary/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {task.start_date && (() => {
                            const date = new Date(task.start_date);
                            return !isNaN(date.getTime()) && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Start: {date.toLocaleDateString()}</span>
                              </div>
                            );
                          })()}
                          {task.due_date && (() => {
                            const date = new Date(task.due_date);
                            return !isNaN(date.getTime()) && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Due: {date.toLocaleDateString()}</span>
                              </div>
                            );
                          })()}
                          {task.reminder_before && (
                            <div className="flex items-center gap-1">
                              <Bell size={14} />
                              <span>Remind {task.reminder_before}m before</span>
                            </div>
                          )}
                          {task.reminder_every && (
                            <div className="flex items-center gap-1">
                              <Bell size={14} />
                              <span>Every {task.reminder_every}m</span>
                            </div>
                          )}
                          {task.repeat_interval && (
                            <div className="flex items-center gap-1">
                              <Repeat size={14} />
                              <span>Repeat every {task.repeat_interval} days</span>
                            </div>
                          )}
                        </div>

                        {task.channel.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Notifications:</span>
                            <div className="flex gap-2">
                              {task.channel.map((ch) => (
                                <span
                                  key={ch}
                                  className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                >
                                  {ch.charAt(0).toUpperCase() + ch.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 md:p-2 hover:bg-primary/10 rounded-lg text-primary transition-smooth"
                      >
                        <Edit2 size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="p-1.5 md:p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-smooth"
                      >
                        <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
            <div className="bg-card border border-border rounded-2xl p-4 md:p-6 lg:p-8 w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingTask ? "Edit Mission" : "Create Mission"}
                </h2>
                <button
                  onClick={() => {
                    setShowTaskForm(false)
                    setEditingTask(null)
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-smooth"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quest Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Mission Name:
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter your mission..."
                    className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-smooth"
                    required
                  />
                </div>

                {/* Quest Type */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Mission Type:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "NORMAL" | "TIMED_EVENT" })}
                    className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground focus:border-primary focus:outline-none transition-smooth appearance-none cursor-pointer"
                  >
                    <option value="NORMAL">Standard Task</option>
                    <option value="TIMED_EVENT">Scheduled Event</option>
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Tags (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="work, study, personal..."
                    className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-smooth"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Start Date:
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground focus:border-primary focus:outline-none transition-smooth"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      End Date:
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      min={formData.startDate || new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground focus:border-primary focus:outline-none transition-smooth"
                    />
                  </div>
                </div>

                {/* Reminders */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Remind Every (minutes):
                  </label>
                  <input
                    type="number"
                    value={formData.reminderEvery}
                    onChange={(e) => setFormData({ ...formData, reminderEvery: e.target.value })}
                    placeholder="e.g., 180 for 3 hours"
                    className="w-full px-4 py-3 bg-background border-2 border-primary/40 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-smooth"
                  />
                </div>

                {/* Notification Channels */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Notification Channels:
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.channels.telegram}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, telegram: e.target.checked }
                        })}
                        className="w-5 h-5 rounded border-2 border-primary cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        {/* <div className="w-8 h-8 bg-[#0088cc] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📱</span>
                        </div> */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 640 640"><path fill="#74C0FC" d="M320 72C183 72 72 183 72 320C72 457 183 568 320 568C457 568 568 457 568 320C568 183 457 72 320 72zM435 240.7C431.3 279.9 415.1 375.1 406.9 419C403.4 437.6 396.6 443.8 390 444.4C375.6 445.7 364.7 434.9 350.7 425.7C328.9 411.4 316.5 402.5 295.4 388.5C270.9 372.4 286.8 363.5 300.7 349C304.4 345.2 367.8 287.5 369 282.3C369.2 281.6 369.3 279.2 367.8 277.9C366.3 276.6 364.2 277.1 362.7 277.4C360.5 277.9 325.6 300.9 258.1 346.5C248.2 353.3 239.2 356.6 231.2 356.4C222.3 356.2 205.3 351.4 192.6 347.3C177.1 342.3 164.7 339.6 165.8 331C166.4 326.5 172.5 322 184.2 317.3C256.5 285.8 304.7 265 328.8 255C397.7 226.4 412 221.4 421.3 221.2C423.4 221.2 427.9 221.7 430.9 224.1C432.9 225.8 434.1 228.2 434.4 230.8C434.9 234 435 237.3 434.8 240.6z"/></svg>
                        <span className="text-foreground font-medium group-hover:text-primary transition-smooth">
                          Telegram
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.channels.discord}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, discord: e.target.checked }
                        })}
                        className="w-5 h-5 rounded border-2 border-primary cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        {/* <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">💬</span>
                        </div> */}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="h-6 w-6"><path fill="#74C0FC" d="M524.5 133.8C524.3 133.5 524.1 133.2 523.7 133.1C485.6 115.6 445.3 103.1 404 96C403.6 95.9 403.2 96 402.9 96.1C402.6 96.2 402.3 96.5 402.1 96.9C396.6 106.8 391.6 117.1 387.2 127.5C342.6 120.7 297.3 120.7 252.8 127.5C248.3 117 243.3 106.8 237.7 96.9C237.5 96.6 237.2 96.3 236.9 96.1C236.6 95.9 236.2 95.9 235.8 95.9C194.5 103 154.2 115.5 116.1 133C115.8 133.1 115.5 133.4 115.3 133.7C39.1 247.5 18.2 358.6 28.4 468.2C28.4 468.5 28.5 468.7 28.6 469C28.7 469.3 28.9 469.4 29.1 469.6C73.5 502.5 123.1 527.6 175.9 543.8C176.3 543.9 176.7 543.9 177 543.8C177.3 543.7 177.7 543.4 177.9 543.1C189.2 527.7 199.3 511.3 207.9 494.3C208 494.1 208.1 493.8 208.1 493.5C208.1 493.2 208.1 493 208 492.7C207.9 492.4 207.8 492.2 207.6 492.1C207.4 492 207.2 491.8 206.9 491.7C191.1 485.6 175.7 478.3 161 469.8C160.7 469.6 160.5 469.4 160.3 469.2C160.1 469 160 468.6 160 468.3C160 468 160 467.7 160.2 467.4C160.4 467.1 160.5 466.9 160.8 466.7C163.9 464.4 167 462 169.9 459.6C170.2 459.4 170.5 459.2 170.8 459.2C171.1 459.2 171.5 459.2 171.8 459.3C268 503.2 372.2 503.2 467.3 459.3C467.6 459.2 468 459.1 468.3 459.1C468.6 459.1 469 459.3 469.2 459.5C472.1 461.9 475.2 464.4 478.3 466.7C478.5 466.9 478.7 467.1 478.9 467.4C479.1 467.7 479.1 468 479.1 468.3C479.1 468.6 479 468.9 478.8 469.2C478.6 469.5 478.4 469.7 478.2 469.8C463.5 478.4 448.2 485.7 432.3 491.6C432.1 491.7 431.8 491.8 431.6 492C431.4 492.2 431.3 492.4 431.2 492.7C431.1 493 431.1 493.2 431.1 493.5C431.1 493.8 431.2 494 431.3 494.3C440.1 511.3 450.1 527.6 461.3 543.1C461.5 543.4 461.9 543.7 462.2 543.8C462.5 543.9 463 543.9 463.3 543.8C516.2 527.6 565.9 502.5 610.4 469.6C610.6 469.4 610.8 469.2 610.9 469C611 468.8 611.1 468.5 611.1 468.2C623.4 341.4 590.6 231.3 524.2 133.7zM222.5 401.5C193.5 401.5 169.7 374.9 169.7 342.3C169.7 309.7 193.1 283.1 222.5 283.1C252.2 283.1 275.8 309.9 275.3 342.3C275.3 375 251.9 401.5 222.5 401.5zM417.9 401.5C388.9 401.5 365.1 374.9 365.1 342.3C365.1 309.7 388.5 283.1 417.9 283.1C447.6 283.1 471.2 309.9 470.7 342.3C470.7 375 447.5 401.5 417.9 401.5z"/></svg>                        <span className="text-foreground font-medium group-hover:text-primary transition-smooth">
                          Discord
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.channels.gmail}
                        onChange={(e) => setFormData({
                          ...formData,
                          channels: { ...formData.channels, gmail: e.target.checked }
                        })}
                        className="w-5 h-5 rounded border-2 border-primary cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        {/* <div className="w-8 h-8 bg-[#EA4335] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📧</span>
                        </div> */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 640 640"><path fill="#74C0FC" d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z"/></svg>
                        <span className="text-foreground font-medium group-hover:text-primary transition-smooth">
                          Gmail
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskForm(false)
                      setEditingTask(null)
                    }}
                    className="flex-1 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-linear-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>{editingTask ? "Update Mission" : "Create Mission"}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-foreground mb-4">Delete Mission?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this mission? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTaskId(null)
                  }}
                  className="flex-1 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-smooth font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-smooth font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
