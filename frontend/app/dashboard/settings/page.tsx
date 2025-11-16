"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { Save, MessageCircle, Mail, Loader2, Upload, X, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from "@/contexts/AuthContext"
import { profileApi, authApi } from "@/lib/api"

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"profile" | "bot">("profile")
  const [savedMessage, setSavedMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [testingBot, setTestingBot] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{
    telegram?: 'success' | 'error' | null
    discord?: 'success' | 'error' | null
    gmail?: 'success' | 'error' | null
  }>({})

  const [profileData, setProfileData] = useState({
    telegramBotToken: "",
    telegramChatId: "",
    discordBotToken: "",
    discordChannelId: "",
    gmailTo: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        telegramBotToken: user.telegramBotToken || "",
        telegramChatId: user.telegramChatId || "",
        discordBotToken: user.discordBotToken || "",
        discordChannelId: user.discordChannelId || "",
        gmailTo: user.gmailTo || "",
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveAvatar = async () => {
    setIsSubmitting(true)
    setError("")
    try {
      await profileApi.updateProfile({ avatar: avatarPreview || "" })
      await refreshUser()
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save avatar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      await profileApi.updateProfile(profileData)
      await refreshUser()
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setError("Both fields are required")
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      await authApi.changePassword(passwordData)
      setPasswordData({ currentPassword: "", newPassword: "" })
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestBot = async (botType: 'telegram' | 'discord' | 'gmail') => {
    setTestingBot(botType)
    setTestResults({ ...testResults, [botType]: null })
    
    try {
      let response: { message: string }
      
      if (botType === 'telegram') {
        response = await profileApi.testTelegram()
      } else if (botType === 'discord') {
        response = await profileApi.testDiscord()
      } else {
        response = await profileApi.testGmail()
      }
      
      setTestResults({ ...testResults, [botType]: 'success' })
    } catch (err: any) {
      setTestResults({ ...testResults, [botType]: 'error' })
      setError(err.message || `Failed to test ${botType}`)
    } finally {
      setTestingBot(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mt-4 bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mt-8 border-b border-border">
        {(["profile", "bot"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-smooth capitalize ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "bot" ? "Bot Configuration" : "Profile"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Avatar section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  {avatarPreview && (
                    <button
                      onClick={handleRemoveAvatar}
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth font-medium flex items-center gap-2"
                  >
                    <Upload size={16} />
                    {avatarPreview ? "Change Avatar" : "Upload Avatar"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  {avatarPreview && avatarPreview !== user?.avatar && (
                    <button
                      onClick={handleSaveAvatar}
                      disabled={isSubmitting}
                      type="button"
                      className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Avatar
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Profile info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Name cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Password section */}
            <form onSubmit={handleChangePassword} className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bot Configuration Tab */}
        {activeTab === "bot" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Telegram Bot */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Telegram Bot</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestBot('telegram')}
                  disabled={testingBot === 'telegram'}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-smooth disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {testingBot === 'telegram' ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Testing...
                    </>
                  ) : testResults.telegram === 'success' ? (
                    <>
                      <CheckCircle size={14} />
                      Configured
                    </>
                  ) : testResults.telegram === 'error' ? (
                    <>
                      <XCircle size={14} />
                      Not Configured
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bot Token</label>
                  <input
                    type="password"
                    placeholder="Enter your Telegram bot token"
                    value={profileData.telegramBotToken}
                    onChange={(e) => setProfileData({ ...profileData, telegramBotToken: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Chat ID</label>
                  <input
                    type="text"
                    placeholder="Your Telegram chat ID"
                    value={profileData.telegramChatId}
                    onChange={(e) => setProfileData({ ...profileData, telegramChatId: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
              </div>
            </div>

            {/* Discord Bot */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Discord Bot</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestBot('discord')}
                  disabled={testingBot === 'discord'}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-smooth disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {testingBot === 'discord' ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Testing...
                    </>
                  ) : testResults.discord === 'success' ? (
                    <>
                      <CheckCircle size={14} />
                      Configured
                    </>
                  ) : testResults.discord === 'error' ? (
                    <>
                      <XCircle size={14} />
                      Not Configured
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bot Token</label>
                  <input
                    type="password"
                    placeholder="Enter your Discord bot token"
                    value={profileData.discordBotToken}
                    onChange={(e) => setProfileData({ ...profileData, discordBotToken: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Channel ID</label>
                  <input
                    type="text"
                    placeholder="Your Discord channel ID"
                    value={profileData.discordChannelId}
                    onChange={(e) => setProfileData({ ...profileData, discordChannelId: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
              </div>
            </div>

            {/* Gmail */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Gmail Notifications</h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleTestBot('gmail')}
                  disabled={testingBot === 'gmail'}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-smooth disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                >
                  {testingBot === 'gmail' ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Testing...
                    </>
                  ) : testResults.gmail === 'success' ? (
                    <>
                      <CheckCircle size={14} />
                      Configured
                    </>
                  ) : testResults.gmail === 'error' ? (
                    <>
                      <XCircle size={14} />
                      Not Configured
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={profileData.gmailTo}
                    onChange={(e) => setProfileData({ ...profileData, gmailTo: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Bot Configuration
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
