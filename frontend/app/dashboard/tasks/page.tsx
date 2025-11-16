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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-muted/10">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">Missions</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your tasks and objectives</p>
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
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth flex items-center gap-2 font-semibold"
          >
            <Plus size={20} />
            Create Mission
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
                  className="group bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl p-6 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleCompleted(task)}
                        className="mt-1 w-5 h-5 rounded border-2 border-primary cursor-pointer"
                      />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
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

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-smooth"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-smooth"
                      >
                        <Trash2 size={18} />
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <div className="w-8 h-8 bg-[#0088cc] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📱</span>
                        </div>
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
                        <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">💬</span>
                        </div>
                        <span className="text-foreground font-medium group-hover:text-primary transition-smooth">
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
                        <div className="w-8 h-8 bg-[#EA4335] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📧</span>
                        </div>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
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
