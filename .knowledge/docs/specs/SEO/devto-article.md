# Dev.to Article: chime-io Tutorial

**Article Type:** Tutorial / Show & Tell  
**Target Audience:** Developers using AI coding tools  
**Reading Time:** 5-7 minutes  
**Tone:** Conversational, helpful, technically accurate

---

## Title Options (SEO-Optimized)

### Primary Recommendation
> **Stop Babysitting Your AI Coding Assistant: Get Notified When Claude Code Finishes**

### Alternatives
- How to Get Mobile Notifications When Claude Code Completes Tasks
- Building a Notification Bridge for Claude Code (And Why You Might Need One)
- From Frustration to Solution: Real-Time Notifications for AI Coding Sessions
- chime-io: Never Miss When Your AI Coding Assistant Finishes

---

## Article Content

```markdown
# Stop Babysitting Your AI Coding Assistant: Get Notified When Claude Code Finishes

*How I solved the "missed notification" problem with a simple Telegram bridge*

---

## The Problem

I love using Claude Code for complex development tasks. Need to refactor a large module? Claude can handle it. Want to generate a comprehensive test suite? Claude's got you covered. The issue? These tasks often take 10-30 minutes to complete.

Here's what used to happen to me:

1. Start a complex refactoring task
2. Claude begins working (spinning indicator appears)
3. I think "This will take a while, let me grab coffee"
4. 45 minutes later: "Oh right, I was running Claude!"

Sound familiar?

I'd either babysit the terminal (wasting time) or completely miss when Claude finished (wasting more time). There had to be a better way.

---

## The Solution: chime-io

I built **chime-io** - a lightweight notification bridge that sends Telegram messages to your phone when Claude Code (or any AI coding tool) finishes, errors, or needs your input.

### What You Get

📱 **Instant notifications on your phone**
- Task completed successfully
- Errors with details
- Permission requests requiring your input
- Session statistics included

⚡ **Multiple integration options**
- CLI tool for any workflow
- Native Claude Code plugin
- OpenCode plugin support

🔒 **Privacy-first**
- Everything runs locally
- Your code never leaves your machine
- You control your own Telegram bot

---

## Quick Start Guide

### Step 1: Install

```bash
npm install -g @chime-io/cli
```

### Step 2: Set Up Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Message [@userinfobot](https://t.me/userinfobot) to get your user ID

### Step 3: Configure Environment

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export TELEGRAM_USER_ID="your_user_id_here"
```

Add these to your `.bashrc`, `.zshrc`, or shell profile to make them permanent.

### Step 4: Test It

```bash
chime -m "Hello from chime-io! 🎉"
```

You should receive a Telegram message instantly.

---

## Claude Code Integration

### As a Plugin (Recommended)

Clone and install the plugin:

```bash
git clone https://github.com/telnotify/chime-io.git
cp -r chime-io/packages/claude ~/.claude/plugins/chime-io-notifier
claude config set enabledPlugins '["chime-io-notifier"]'
```

Configure additional options:

```bash
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"  # low, medium, high
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
```

Now whenever Claude finishes a task, you'll get a notification like:

```
✅ Claude completed: Refactored auth module

Session: 2024-01-15-abc123
Duration: 12m 34s
Tools used: Bash, Edit, Read
```

### Via CLI Hook

If you prefer using the CLI directly:

```bash
# Run your task
claude "refactor the auth module" && chime -m "✅ Task complete" || chime -m "❌ Task failed"
```

---

## How It Works

chime-io uses a clean, modular architecture:

```
┌─────────────────┐
│   Claude Code   │ ──┐
└─────────────────┘   │
┌─────────────────┐   │    ┌──────────────┐    ┌──────────┐
│    OpenCode     │ ──┼───▶│  chime-io    │───▶│ Telegram │
└─────────────────┘   │    │   Bridge     │    │   Bot    │
┌─────────────────┐   │    └──────────────┘    └──────────┘
│   CLI Tool      │ ──┘
└─────────────────┘
```

**Key components:**
- **Core:** Notification models and interfaces
- **Channel-Telegram:** Handles Telegram Bot API communication
- **Formatters:** Tool-specific message formatting (Claude, OpenCode)
- **CLI:** Command-line interface for manual notifications

The project is built with TypeScript in a monorepo structure using pnpm and Rush. Everything is open source and contributions are welcome.

---

## Real-World Use Cases

### Long Refactoring Sessions
Start a complex refactor, go for a walk, get notified when it's done. No more hovering around your desk.

### Test Suite Runs
Run comprehensive tests that take 15+ minutes. Get pinged immediately if they fail so you can fix issues faster.

### Code Generation
Use Claude to generate boilerplate or documentation. Do other work while it runs - you'll know the moment it's ready.

### CI/CD Integration
Hook into your deployment pipeline. Get notified when deployments complete or if they need approval.

---

## Advanced Configuration

### Custom Message Formatting

```bash
# Include git branch and commit info
export CLAUDE_NOTIFY_INCLUDE_GIT="true"

# Filter which tools trigger notifications
export CLAUDE_NOTIFY_TOOL_FILTER="Bash|Edit"
```

### Silent Mode

```bash
# Send notifications without sound
export TELEGRAM_SILENT="1"
```

### HTML Formatting

```bash
# Use HTML for rich formatting
export TELEGRAM_PARSE_MODE="HTML"
```

---

## Troubleshooting

### "No notifications received"
- Verify your bot token is correct
- Check that you've started a conversation with your bot on Telegram
- Ensure your user ID is correct (use @userinfobot)

### "Permission denied" errors
- Make sure your bot has permission to send messages
- Verify the bot isn't blocked

### "Environment variables not found"
- Check that variables are exported (use `export`)
- Verify they're loaded in your current shell session
- Try adding them to your shell profile

---

## Why Telegram?

You might wonder: why Telegram specifically?

1. **Universal:** Works on iOS, Android, Web, Desktop - whatever device you're using
2. **Free:** No paid tier required
3. **No setup friction:** Most developers already have Telegram
4. **History:** Message history you can reference later
5. **API:** Simple, well-documented Bot API

That said, the architecture supports adding other channels. Slack, Discord webhooks, and email are all possible future additions.

---

## The Code

chime-io is completely open source:

**GitHub:** [github.com/telnotify/chime-io](https://github.com/telnotify/chime-io)

**Key files to explore:**
- `packages/core/` - Notification interfaces and models
- `packages/claude/` - Claude Code hooks implementation
- `packages/opencode/` - OpenCode integration
- `packages/cli/` - Command-line tool

Built with:
- TypeScript
- pnpm workspaces + Rush
- Node.js native test runner
- Telegram Bot API

---

## What's Next?

I'm actively working on:

- [ ] Slack integration
- [ ] Discord webhook support
- [ ] More granular notification controls
- [ ] Session analytics dashboard

Have a feature request? Open an issue on GitHub or drop a comment below.

---

## Conclusion

If you're tired of babysitting your terminal while Claude Code works, give chime-io a try. It takes 5 minutes to set up and could save you hours of waiting and wondering.

```bash
npm install -g @chime-io/cli
```

**Questions?** Drop them in the comments - I read and respond to every single one.

**Found this useful?** Give it a ⭐ on GitHub and share with fellow Claude Code users.

---

*Happy coding! May your notifications be timely and your coffee breaks uninterrupted.* ☕
```

---

## Cover Image Description

**For Designer/Canva Creation:**

### Concept
Split-screen concept showing the problem and solution:
- Left side: Terminal with Claude Code "Working..." spinner
- Right side: Phone showing Telegram notification
- Central connecting element: chime-io logo/icon

### Visual Elements
- **Background:** Dark terminal aesthetic (#1e1e1e) fading to lighter gray
- **Terminal:** VS Code style with monospace font showing Claude Code interface
- **Phone:** Modern smartphone mockup with Telegram notification visible
- **Icon:** Simple bell or notification icon with Claude/Code branding colors
- **Text Overlay:** "Never Miss When Claude Finishes" in bold, readable font

### Colors
- Primary: Anthropic Claude purple (#d4a5a5 or similar)
- Secondary: Telegram blue (#0088cc)
- Background: Dark mode terminal colors
- Text: White/light gray for contrast

### Dimensions
- Dev.to recommended: 1000x420 pixels (2.38:1 ratio)
- Alternative: 1920x1080 (16:9) for social sharing

### Style
- Modern, minimalist
- Developer-focused aesthetic
- Clean typography (Inter, JetBrains Mono, or similar)
- Subtle shadows and depth

---

## Tag Suggestions

### Primary Tags (Use all 5)
1. `claudecode`
2. `productivity`
3. `telegram`
4. `typescript`
5. `devtools`

### Secondary Tags (if more available)
- `ai`
- `chatgpt`
- `coding`
- `javascript`
- `cli`
- `opensource`

---

## SEO Elements

### Meta Description (for social sharing)
> Learn how to get mobile notifications when Claude Code finishes tasks. Step-by-step tutorial for setting up chime-io, a free Telegram notification bridge for AI coding tools.

### Canonical URL
Point to: `https://github.com/telnotify/chime-io`

### Series (if Dev.to supports)
Consider making this part of a "AI Coding Workflow" series:
- Part 1: Notifications (this article)
- Part 2: Advanced Claude Code configurations
- Part 3: Building custom Claude Code plugins

---

## Call-to-Actions (CTAs)

### Primary CTA
> ⭐ Star chime-io on GitHub: github.com/telnotify/chime-io

### Secondary CTAs
1. Try the installation and comment with your experience
2. Share your own Claude Code workflow tips
3. Suggest features you'd like to see
4. Follow for more AI coding tool tutorials

---

## Engagement Strategy

### First 24 Hours
- Respond to every comment within 1 hour
- Pin a comment with installation quick-start
- Thank users who share their use cases

### Ongoing
- Check comments daily for first week
- Update article based on common questions
- Share article on social media with different angles

### Cross-Promotion
- Link to this article from GitHub README
- Share on Twitter with article link
- Post in relevant Discord communities

---

## Success Metrics

### Article Performance
- **Good:** 1,000+ views, 50+ reactions, 10+ comments
- **Great:** 5,000+ views, 200+ reactions, 30+ comments
- **Viral:** 10,000+ views, 500+ reactions, 50+ comments

### Business Metrics
- GitHub stars from article traffic
- Issue/PR activity
- User testimonials/comments

### Long-term
- Sustained traffic from search
- Featured in Dev.to newsletters
- Author follower growth
