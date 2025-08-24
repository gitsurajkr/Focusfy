# Telegram & Discord Bot Setup Guide

## 🔧 **Complete Implementation Overview**

Your Productivity Manager now includes a full notification system that can send reminders via Telegram and Discord. Here's how it works:

### **Backend Architecture:**
1. **NotificationService** - Handles sending messages to Telegram/Discord
2. **SchedulerService** - Runs every minute to check for pending notifications
3. **Cron Jobs** - Automatically triggers reminders based on task settings
4. **API Endpoints** - For testing and managing notifications

### **Frontend Features:**
1. **Channel Selection** - Users can choose Telegram/Discord when creating tasks
2. **Notification Testing** - Test component to verify bot setup
3. **Scheduler Status** - Real-time monitoring of notification system

---

## 🤖 **Telegram Bot Setup**

### **Step 1: Create a Bot**
1. Open Telegram and search for `@BotFather`
2. Send `/start` to BotFather
3. Send `/newbot` and follow the prompts:
   - Bot name: `Minecraft Productivity Bot`
   - Username: `minecraft_productivity_bot` (must end with 'bot')
4. Copy the bot token (e.g., `123456789:AAEhBOweik6ad6PsXkMtxtYcbqJBOy8hkw`)

### **Step 2: Get Your Chat ID**
Method 1 - Using @myidbot:
1. Search for `@myidbot` on Telegram
2. Send `/start` - it will show your user ID

Method 2 - Manual method:
1. Send any message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":XXXXXXX}` in the response

### **Step 3: Add to .env file**
```bash
TELEGRAM_BOT_TOKEN=123456789:AAEhBOweik6ad6PsXkMtxtYcbqJBOy8hkw
TELEGRAM_CHAT_ID=123456789
```

---

## 🎮 **Discord Bot Setup**

### **Step 1: Create Discord Application**
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "Minecraft Productivity Bot"
4. Go to "Bot" section in sidebar
5. Click "Add Bot"
6. Copy the bot token
7. Enable "Message Content Intent" if you want the bot to read messages

### **Step 2: Invite Bot to Your Server**
1. In the Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select bot permissions: `Send Messages`, `Read Message History`
4. Copy the generated URL and open it in browser
5. Select your server and authorize

### **Step 3: Get Channel ID**
1. In Discord, go to User Settings → Advanced → Enable "Developer Mode"
2. Right-click on the channel where you want notifications
3. Click "Copy ID"

### **Step 4: Add to .env file**
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=123456789012345678
```

---

## ⚡ **Quick Setup Commands**

### **1. Install Dependencies (already done)**
```bash
cd backend
pnpm add node-telegram-bot-api discord.js node-cron @types/node-telegram-bot-api
```

### **2. Create .env file**
```bash
cd backend
cp .env.example .env
# Edit .env with your actual tokens and IDs
```

### **3. Start the Backend**
```bash
pnpm dev
```

You should see:
```
🏰 Minecraft Productivity Server is running on port 3001
📱 Telegram Bot: Configured
🎮 Discord Bot: Configured
⏰ Scheduler service initialized
```

---

## **Testing Your Setup**

### **1. Create a Test Task**
1. Open frontend at http://localhost:3000
2. Create a new task
3. Select notification channels (telegram/discord)
4. Set reminder intervals

### **2. Use the Test Component**
1. In the frontend, you'll see "🧪 NOTIFICATION TESTING" section
2. Click " Check Scheduler Status" to verify the system is running
3. Click " Test" next to any task with notification channels

### **3. Manual Testing via API**
```bash
# Test notification for a specific task
curl -X POST http://localhost:3001/api/test-notification/YOUR_TASK_ID

# Check scheduler status
curl http://localhost:3001/api/scheduler-status
```

---

## 📋 **How Notifications Work**

### **Event Tasks (🗓️)**
- **Before Reminder**: Notifies X minutes before due date
- **Recurring Reminder**: Sends reminder every Y minutes until event starts
- **Start Notification**: Alerts when event actually starts

Example: "Codeforces Contest" 
- Reminds 30 mins before
- Then every 10 mins until it starts
- Sends "EVENT STARTED" when time arrives

### **Habit Tasks (🔄)**
- **Interval Reminder**: Repeats based on `repeat_interval`
- Example: "Daily workout" every 1440 minutes (24 hours)

### **Normal Tasks (⚒️)**
- **Regular Reminder**: Based on `reminder_every` setting
- Example: "Study ML" every 180 minutes (3 hours)

---

## 🎨 **Notification Message Format**

```
 **MINECRAFT PRODUCTIVITY REMINDER** 🏰

 **Quest:** Study Machine Learning

 Task Reminder: Don't forget about "Study Machine Learning" - Let's get it done! 🚀

 Time: 8/25/2025, 2:30:00 PM
 Keep crafting your productivity!
```

---

## **Troubleshooting**

### **Common Issues:**

**1. "Telegram not configured" message**
- Check if `TELEGRAM_BOT_TOKEN` is in .env
- Verify token is correct (no extra spaces)
- Restart backend server

**2. "Discord not configured" message**  
- Check `DISCORD_BOT_TOKEN` in .env
- Verify bot has permissions in the channel
- Make sure bot is online in Discord

**3. "Test notification failed"**
- Check if task has notification channels selected
- Verify bot tokens are valid
- Check server logs for detailed errors

**4. Bot doesn't respond**
- Make sure you've sent `/start` to your Telegram bot
- Verify Discord bot has proper permissions
- Check if bot is online in Discord server

### **Debug Commands:**
```bash
# Check environment variables
echo $TELEGRAM_BOT_TOKEN
echo $DISCORD_BOT_TOKEN

# View server logs
cd backend
pnpm dev  # Watch for error messages

# Test API directly
curl http://localhost:3001/health
curl http://localhost:3001/api/scheduler-status
```

---

##  **Advanced Features**

### **Custom Message Templates**
Edit `NotificationService.ts` to customize message formats:
- Event countdowns with urgency levels
- Motivational habit reminders
- Personalized task messages

### **Multiple Users (Future)**
- Add user authentication
- Per-user Telegram/Discord settings
- Individual notification preferences

### **Webhook Integration**
- Receive updates when users complete tasks
- Two-way communication with bots
- Interactive buttons in Discord

---

##  **Next Steps**

1. **Set up your bots** using the guides above
2. **Test the system** with a few sample tasks
3. **Customize messages** to your liking
4. **Deploy to production** when ready
5. **Add more features** like user management

Your Productivity Manager is now ready to send epic notifications! 
