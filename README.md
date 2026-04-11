# Chime IO — Claude Code Notification & Mobile Alerts

<p align="center">
  <a href="README.md">English</a> | <a href="README_CN.md">中文</a>
</p>

<p align="center">
  <img src="public/mnu4qk6ktuxlsl.jpeg" alt="Chime IO - AI Coding Notification Tool" width="500">
</p>

<p align="center">
  <strong>Get instant mobile notifications when Claude Code finishes, errors, or needs your attention.</strong><br>
  Never miss an AI coding milestone. Stay connected to your development workflow from anywhere.
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick Start</strong></a> •
  <a href="#installation"><strong>Installation</strong></a> •
  <a href="#configuration"><strong>Configuration</strong></a> •
  <a href="#features"><strong>Features</strong></a>
</p>

---

## 🎯 Problem: You're Missing Critical AI Coding Moments

When using **Claude Code** or **OpenCode** for development:

- 🕐 **Long-running sessions** — AI takes 10+ minutes to complete a task, you keep checking back
- ❌ **Silent failures** — Errors happen, but you're away from your desk
- 🔧 **Permission requests** — AI needs your approval, but you're AFK
- 📱 **Mobile blindspot** — No way to know what's happening without staying glued to your screen

**The cost?** Lost time, missed deadlines, and constant context-switching.

---

## ✨ Solution: Chime IO — The Developer Notification Tool for AI Coding

**Chime IO** bridges your AI coding assistant to Telegram, delivering **real-time mobile notifications** for:

- ✅ Task completion alerts
- 🚨 Error and failure notifications
- ⚡ Permission request pings
- 📊 Session statistics and git context

Built for developers who want to **stay productive while AFK**.

---

## 🚀 Quick Start (3-30-3 Rule)

### ⚡ 3 Seconds: Understand
> *"Get Telegram notifications from Claude Code and OpenCode"*

### ⚙️ 30 Seconds: Install

**Option A: OpenCode Plugin** (Recommended)
```bash
# Install the plugin
opencode plugin install @chime-io/plugin-opencode

# Set your Telegram credentials
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
```

**Option B: Claude Code Plugin**
```bash
# Copy plugin to Claude Code
cp -r packages/claude ~/.claude/plugins/chime-io-notifier
claude config set enabledPlugins '["chime-io-notifier"]'
```

**Option C: CLI**
```bash
# Install CLI
npm install -g @chime-io/cli

# Send test notification
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "Hello from Chime IO!"
```

### 🎓 3 Minutes: Configure

Set environment variables in your `~/.bashrc`, `~/.zshrc`, or session:

```bash
# Required
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
export TELEGRAM_USER_ID="123456789"

# Optional - Customize behavior
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
```

See the [Configuration](#configuration) section for all options.

---

## 🔥 Features

| Feature | Description | Claude Code | OpenCode | CLI |
|---------|-------------|:-----------:|:--------:|:---:|
| **Stop Notifications** | Get notified when AI finishes | ✅ | ✅ | ✅ |
| **Error Alerts** | Instant error and failure pings | ✅ | ✅ | ✅ |
| **Permission Requests** | Know when approval is needed | ✅ | ✅ | ✅ |
| **Session Statistics** | Token usage, duration, cost | ✅ | ✅ | ❌ |
| **Git Context** | Branch, commit, repository info | ✅ | ✅ | ❌ |
| **Custom Filters** | Filter notifications by tool type | ✅ | ❌ | ❌ |
| **Silent Mode** | Send without sound | ✅ | ✅ | ✅ |

### Why Chime IO?

- 🔌 **Plug-and-play** — Works out of the box with Claude Code and OpenCode
- 📱 **Mobile-first** — Designed for Telegram, works on all devices
- 🛠️ **Developer-focused** — Rich technical context in every notification
- 🔒 **Privacy-conscious** — No data leaves your machine except to Telegram
- ⚡ **Zero-latency** — Direct webhook delivery, no middleware

---

## 📦 Installation

### Method 1: OpenCode Plugin (Recommended)

The **OpenCode plugin** is the easiest way to get started with AI coding notification.

```bash
# Build from source (monorepo)
pnpm rush:install
pnpm rush:build

# Or install from npm (when published)
opencode plugin install @chime-io/plugin-opencode
```

**Entry Point:** `packages/opencode/dist/plugin.js`

### Method 2: Claude Code Plugin

Install the **Claude Code Telegram** notifier for rich mobile notifications.

```bash
# 1. Build the plugin
pnpm --filter @chime-io/plugin-claude build

# 2. Copy to Claude Code plugins
cp -r packages/claude ~/.claude/plugins/chime-io-notifier

# 3. Enable the plugin
claude config set enabledPlugins '["chime-io-notifier"]'
```

**Alternative: Local Marketplace (Dev Mode)**
```bash
# Add local marketplace (non-root user only)
claude /plugin marketplace add /path/to/this/repo

# Install from /plugin interface
```

### Method 3: CLI Tool

Use the standalone **developer notification tool** for custom integrations.

```bash
# Install globally
npm install -g @chime-io/cli

# Or use npx
npx @chime-io/cli -t <token> -u <user_id> -m "Your message"
```

**Build from source:**
```bash
pnpm --filter @chime-io/cli build
pnpm --filter @chime-io/cli exec chime -t <token> -u <user_id> -m "Hello"
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | - | Your Telegram bot token (get from [@BotFather](https://t.me/botfather)) |
| `TELEGRAM_USER_ID` | ✅ | - | Your Telegram user ID (get from [@userinfobot](https://t.me/userinfobot)) |
| `TELEGRAM_PARSE_MODE` | ❌ | `HTML` | Message format: `HTML`, `Markdown`, or `MarkdownV2` |
| `TELEGRAM_SILENT` | ❌ | `0` | `1` to send notifications without sound |
| `CLAUDE_NOTIFY_DETAIL_LEVEL` | ❌ | `medium` | Detail level: `low`, `medium`, `high` |
| `CLAUDE_NOTIFY_INCLUDE_STATS` | ❌ | `true` | Include session statistics |
| `CLAUDE_NOTIFY_INCLUDE_GIT` | ❌ | `true` | Include git context |
| `CLAUDE_NOTIFY_TOOL_FILTER` | ❌ | - | Filter by tool: `Bash\|Edit` |

### Telegram Bot Setup

1. **Create a bot** with [@BotFather](https://t.me/botfather):
   - Send `/newbot`
   - Choose a name and username
   - Save the token

2. **Get your User ID** from [@userinfobot](https://t.me/userinfobot):
   - Start the bot
   - Your ID will be displayed

3. **Start your bot**:
   - Open `https://t.me/your_bot_username`
   - Click "Start"

### Persistent Configuration

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.config/fish/config.fish`):

```bash
# Chime IO Configuration
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
export TELEGRAM_USER_ID="123456789"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
```

---

## 💡 Use Cases

### 1. Long-Running Refactoring
```bash
# Start a complex refactoring session
claude refactor the entire codebase to TypeScript

# Walk away — you'll get notified when it's done!
```

### 2. CI/CD Integration
```bash
# In your deployment script
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "🚀 Deployment started: $PROJECT_NAME"
./deploy.sh
chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "✅ Deployment complete: $PROJECT_NAME"
```

### 3. Batch Processing
```bash
# Process thousands of files
for file in data/*.csv; do
  python process.py "$file"
  chime -t $TELEGRAM_BOT_TOKEN -u $TELEGRAM_USER_ID -m "📊 Processed: $file"
done
```

### 4. Remote Server Monitoring
```bash
# On your VPS
export TELEGRAM_BOT_TOKEN="xxx"
export TELEGRAM_USER_ID="xxx"

# Set up cron job
echo "0 */6 * * * chime -m 'Server check-in: $(date)'" | crontab -
```

---

## 🏗️ Architecture

Chime IO is a **modular monorepo** built for extensibility:

```
packages/
├── core/          # Notification models, renderers, and loggers
├── telegram/      # Telegram channel and HTTP transport
├── claude/        # Claude Code hooks implementation
├── opencode/      # OpenCode plugin with formatter
└── cli/           # Standalone CLI tool
```

Each package can be used independently or together for maximum flexibility.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Setup development environment
pnpm rush:install
pnpm rush:build

# Run tests
pnpm rush:test

# Verify changes
pnpm rush:change:verify
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Related

- [Claude Code](https://claude.ai/code) — AI-powered coding assistant
- [OpenCode](https://opencode.ai) — Open AI coding platform
- [Telegram Bot API](https://core.telegram.org/bots/api) — Telegram bot documentation

---

<p align="center">
  <strong>Never miss a moment in your AI coding journey.</strong><br>
  <sub>Made with ❤️ for developers who value their time.</sub>
</p>
