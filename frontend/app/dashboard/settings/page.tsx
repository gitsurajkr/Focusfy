"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { Save, MessageCircle, Mail, Loader2, Upload, X, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from "@/contexts/AuthContext"
import { profileApi, authApi } from "@/lib/api"
import Image from "next/image"

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showTelegramToken, setShowTelegramToken] = useState(false)
  const [showDiscordToken, setShowDiscordToken] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
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
        name: user.name || "",
        email: user.email || "",
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

  // const handleSaveAvatar = async () => {
  //   setIsSubmitting(true)
  //   setError("")
  //   try {
  //     await profileApi.updateProfile({ avatar: avatarPreview || "" })
  //     await refreshUser()
  //     setSavedMessage(true)
  //     setTimeout(() => setSavedMessage(false), 3000)
  //   } catch (err: any) {
  //     setError(err.message || "Failed to save avatar")
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    try {
      await profileApi.updateProfile(profileData)
      await refreshUser()
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
        setError((err as { message: string }).message)
      } else {
        setError("Failed to save profile")
      }
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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
        setError((err as { message: string }).message)
      } else {
        setError("Failed to save profile")
      }
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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err && typeof (err as { message?: string }).message === "string") {
        setError((err as { message: string }).message)
      } else {
        setError("Failed to save profile")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mt-4 bg-secondary/10 border border-secondary/20 text-secondary px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm md:text-base">
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm md:text-base">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 md:gap-2 mt-6 md:mt-8 border-b border-border overflow-x-auto">
        {(["profile", "bot"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 md:px-4 py-2.5 md:py-3 font-medium text-xs md:text-sm transition-smooth capitalize whitespace-nowrap ${
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
      <div className="mt-6 md:mt-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Avatar section */}
            <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Profile Picture</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                <div className="relative group">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
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

                {/* <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    className="w-full sm:w-auto px-3 md:px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-smooth font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <Upload size={14} className="md:w-4 md:h-4" />
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
                      className="w-full sm:w-auto px-3 md:px-4 py-2 bg-linear-to-r from-primary to-secondary text-primary-foreground rounded-lg hover:shadow-lg transition-smooth disabled:opacity-50 flex items-center justify-center gap-2 text-sm md:text-base"
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
                </div> */}
              </div>
            </div>

            {/* Profile info */}
            <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Password section */}
            <form onSubmit={handleChangePassword} className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 pr-10 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-6 text-center">
              <h2 className="text-2xl font-bold text-foreground tracking-wider mb-2">
                BOT CONFIGURATION
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your notification bots and services
              </p>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="px-4 py-2 rounded-lg border border-border bg-linear-to-r from-blue-600 to-purple-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all flex items-center gap-2 mx-auto text-sm font-medium shadow-lg hover:shadow-xl"
              >
                {showHelp ? 'Hide Setup Guide' : '❓ Need Help? Click Here'}
              </button>
            </div>

            {/* Help Section - Collapsible */}
            {showHelp && (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-primary">
                    BOT SETUP GUIDE
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowHelp(false)}
                    className="text-sm text-muted-foreground hover:text-red-400 transition-all"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Telegram Bot Setup */}
                  <div className="border-l-4 border-[#0088cc] pl-4 bg-[#0088cc]/5 py-2">
                    <h3 className="font-bold text-[#0088cc] mb-2">TELEGRAM BOT SETUP</h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                      <li>Open Telegram and search for <code className="bg-muted px-1.5 py-0.5 rounded text-xs">@BotFather</code></li>
                      <li>Send <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/start</code> to begin</li>
                      <li>Send <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/newbot</code> to create a new bot</li>
                      <li>Choose a name for your bot (e.g., &quot;My Focusfy Bot&quot;)</li>
                      <li>Choose a username ending with &quot;bot&quot; (e.g., &quot;focusfy_reminder_bot&quot;)</li>
                      <li>Copy the bot token from BotFather&apos;s message</li>
                      <li>Start a chat with your new bot and send any message</li>
                      <li className="bg-cyan-500/10 p-2 rounded border-l-2 border-cyan-400 text-foreground">
                        <strong className="text-cyan-400">Easy way to get Chat ID:</strong>
                        <br />Search for <code className="bg-muted px-1.5 py-0.5 rounded text-xs">@myidbot</code> and send <code className="bg-muted px-1.5 py-0.5 rounded text-xs">/getid</code>
                      </li>
                      <li className="opacity-60 text-xs">
                        <em>Alternative method:</em> Visit <code className="bg-muted px-1.5 py-0.5 rounded text-xs">https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates</code> and look for the &quot;id&quot; field
                      </li>
                    </ol>
                  </div>

                  {/* Discord Bot Setup */}
                  <div className="border-l-4 border-[#5865F2] pl-4 bg-[#5865F2]/5 py-2">
                    <h3 className="font-bold text-[#5865F2] mb-2">DISCORD BOT SETUP</h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                      <li>Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Discord Developer Portal</a></li>
                      <li>Click &quot;New Application&quot; and give it a name</li>
                      <li>Go to &quot;Bot&quot; section in the left sidebar</li>
                      <li>Click &quot;Add Bot&quot; and confirm</li>
                      <li>Copy the bot token (click &quot;Copy&quot; under Token section)</li>
                      <li>Go to &quot;OAuth2&quot; → &quot;URL Generator&quot;</li>
                      <li>Select &quot;bot&quot; scope and &quot;Send Messages&quot; permission</li>
                      <li>Copy the generated URL and invite the bot to your server</li>
                      <li>Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)</li>
                      <li>Right-click your target channel and select &quot;Copy ID&quot;</li>
                    </ol>
                  </div>

                  {/* Email Setup */}
                  <div className="border-l-4 border-[#ea4335] pl-4 bg-[#ea4335]/5 py-2">
                    <h3 className="font-bold text-[#ea4335] mb-2">EMAIL NOTIFICATIONS</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Simply enter the email address where you want to receive notifications.</p>
                      <p><strong>Supported:</strong> Gmail, Outlook, Yahoo, and other email providers</p>
                      <p className="text-amber-400">⚠️ <strong>Note:</strong> Make sure the email address is correct - no confirmation email will be sent.</p>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-card border border-cyan-400/30 p-4 rounded-xl">
                    <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                      <span>🔒</span> SECURITY TIPS
                    </h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-muted-foreground">
                      <li>Keep your bot tokens private - never share them publicly</li>
                      <li>Only give bots the minimum permissions they need</li>
                      <li>You can revoke and regenerate tokens anytime from the respective platforms</li>
                      <li>Test your configuration using the notification test feature after setup</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bot Configuration Form */}
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
                  <div className="relative">
                    <input
                      type={showTelegramToken ? "text" : "password"}
                      placeholder="Enter your Telegram bot token"
                      value={profileData.telegramBotToken}
                      onChange={(e) => setProfileData({ ...profileData, telegramBotToken: e.target.value })}
                      className="w-full px-4 py-2 pr-10 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showTelegramToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                  <div className="relative">
                    <input
                      type={showDiscordToken ? "text" : "password"}
                      placeholder="Enter your Discord bot token"
                      value={profileData.discordBotToken}
                      onChange={(e) => setProfileData({ ...profileData, discordBotToken: e.target.value })}
                      className="w-full px-4 py-2 pr-10 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDiscordToken(!showDiscordToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showDiscordToken ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
              className="w-full bg-linear-to-r from-primary to-secondary text-primary-foreground font-semibold py-2.5 rounded-lg transition-smooth hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>
        )}
      </div>
    </div>
  )
}
