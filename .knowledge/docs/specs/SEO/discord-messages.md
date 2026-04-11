# Discord Community Messages

**Project:** chime-io - Real-time Telegram notifications for AI coding tools  
**Goal:** Community-driven discovery and feedback

---

## Claude Code Official Discord (#showcase Channel)

**Channel:** `#showcase` (check for similar channels if structure changed)  
**Tone:** Community member sharing a tool, not corporate marketing

### Message

```
**chime-io - Telegram Notifications for Claude Code**

Hey everyone! I built a small utility that sends Telegram notifications when Claude Code finishes tasks, and thought it might be useful for others here.

**The problem I had:**
I'd start a complex refactoring task in Claude, step away to grab coffee or take a walk, and completely miss when it finished. Sometimes wouldn't check for hours.

**What it does:**
📱 Sends instant Telegram notifications to your phone
✅ Triggers on: task completion, errors, permission requests
📊 Includes session stats and optional git context
🔌 Works as Claude Code plugin or standalone CLI

**Quick start:**
```bash
npm install -g @chime-io/cli
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_USER_ID="your_id"
```

**GitHub:** https://github.com/telnotify/chime-io

Built with TypeScript, uses Claude Code hooks (Stop, Error, PermissionRequest). Would love feedback from this community!

Anyone else solved this "missed notification" problem differently?
```

### Posting Tips
- Read channel rules first (some have specific formatting requirements)
- Wait for engagement before posting additional messages
- Respond to all questions/comments
- Don't cross-post to multiple channels

---

## OpenCode Discord

**Channel:** General or showcase channel (check server structure)  
**Tone:** Technical, implementation-focused

### Message

```
**chime-io - Notification Plugin for OpenCode**

Hi OpenCode community! 👋

I created chime-io, a notification plugin that bridges OpenCode sessions to Telegram. Perfect for when you want to step away while AI tools work.

**Features:**
- Native OpenCode formatter support
- Real-time Telegram notifications
- Multiple event hooks: Stop, Error, PermissionRequest
- Configurable message detail levels
- Clean TypeScript implementation

**Installation:**
```bash
npm install -g @chime-io/cli
```

Set environment variables:
```
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_USER_ID=your_id
```

**Repository:** https://github.com/telnotify/chime-io

The OpenCode integration is in `packages/opencode/` - would appreciate any code review or suggestions from the community!

Has anyone else built notification integrations? Would love to compare approaches.
```

### Posting Tips
- This community is smaller but highly technical
- Emphasize the code quality and architecture
- Ask technical questions to drive discussion
- Be open to architectural feedback

---

## AI Coding Discord (Chinese Community Example)

**Channel:** 工具分享 / showcase channel  
**Tone:** Bilingual friendly, accessible to Chinese developers

### Message (Chinese)

```
**chime-io - Claude Code 实时通知工具**

大家好！我开发了一个小工具，可以在 Claude Code 完成工作时发送 Telegram 通知到手机。

**解决的问题：**
经常让 Claude 跑一个 10-30 分钟的任务，然后自己去喝咖啡或者散步，结果完全错过了完成时间，有时候几小时后才想起来看。

**功能：**
📱 手机实时接收 Telegram 通知
✅ 任务完成、出错、需要确认时都会提醒
📊 包含会话统计信息
🔌 支持 Claude Code 插件和命令行

**快速开始：**
```bash
npm install -g @chime-io/cli
export TELEGRAM_BOT_TOKEN="你的机器人Token"
export TELEGRAM_USER_ID="你的用户ID"
```

**GitHub:** https://github.com/telnotify/chime-io

支持 Claude Code 和 OpenCode，TypeScript 开发。

大家有没有类似的需求？都是怎么解决的？欢迎试用和反馈！
```

### Posting Tips
- Many Chinese developers are bilingual - English link is fine
- Emphasize it works with international services
- Be ready to answer questions about Telegram setup
- Share in both 工具分享 and general channels if allowed

---

## TypeScript/JavaScript Discord Communities

**Channels:** #showcase, #share-your-work, or similar  
**Examples:** TypeScript Community, Node.js, etc.

### Message

```
**Showcase: chime-io - TypeScript notification bridge**

Built a developer tool in TypeScript and wanted to share with the community!

**What it is:**
A notification system that bridges AI coding tools (Claude Code, OpenCode) to Telegram.

**Technical highlights:**
⚡ TypeScript monorepo with pnpm + Rush
🔌 Pluggable architecture for notification channels
🧪 Node native test runner
📦 CLI + plugin distribution
📝 Clean separation: core, channels, formatters

**Monorepo structure:**
```
packages/
├── core/          # Notification models & interfaces
├── channel-telegram/  # Telegram transport
├── opencode/      # OpenCode formatter
├── claude/        # Claude Code hooks
└── cli/           # Command-line interface
```

**GitHub:** https://github.com/telnotify/chime-io

Would appreciate any TypeScript/Node feedback! Particularly interested in:
- Monorepo setup opinions
- Hook architecture design
- Testing strategies

Thanks for checking it out! 🙏
```

### Posting Tips
- Lead with technical architecture (this audience cares)
- Ask specific technical questions
- Be ready for code review-style feedback
- Share package.json, tsconfig.json if asked

---

## General Discord Posting Guidelines

### DO:
- ✅ Read channel rules and pinned messages
- ✅ Use appropriate formatting (code blocks, emojis)
- ✅ Introduce yourself if required by server rules
- ✅ Engage in existing conversations before self-promoting
- ✅ Respond to every comment/question
- ✅ Be transparent about it being your project
- ✅ Offer to help with setup issues

### DON'T:
- ❌ Post in #general when there's a #showcase channel
- ❌ Use @everyone or @here
- ❌ Post the same message to multiple channels
- ❌ Delete your message if it doesn't get engagement
- ❌ Argue with negative feedback
- ❌ Spam DMs to server members

### Response Templates

#### For "How do I set up the Telegram bot?"
> You'll need to message @BotFather on Telegram to create a bot. He'll give you a token. Then you can get your user ID by messaging @userinfobot. I should probably add this to the README - thanks for the reminder!

#### For "Can you add X feature?"
> Great suggestion! Could you open an issue on GitHub so I can track it? PRs are also welcome if you want to take a stab at it.

#### For "It doesn't work for me"
> Happy to help debug! Can you share:
> 1. Your OS and Node version
> 2. Any error messages you're seeing
> 3. How you installed it
>
> Feel free to DM me or open a GitHub issue.

#### For "Why Telegram specifically?"
> Good question! Telegram is free, works on all platforms, and most devs already have it. But the architecture supports adding other channels (Slack, Discord webhooks, etc.). Telegram was just the easiest to start with.

---

## Server List (Communities to Consider)

### High Priority
- [ ] Claude Code Official Discord
- [ ] OpenCode Discord
- [ ] TypeScript Community

### Medium Priority
- [ ] Node.js Community
- [ ] AI Coding Tools (various)
- [ ] Developer Productivity

### Lower Priority (but worth trying)
- [ ] Telegram Bot Developers
- [ ] Indie Hackers
- [ ] Dev.to Discord

### Chinese Communities
- [ ] AI 实验室
- [ ] 独立开发者社区
- [ ] Telegram 中文开发者

---

## Tracking Engagement

Keep a simple record:

```
Server | Channel | Date | Engagement | Stars Gained | Notes
-------|---------|------|------------|--------------|-------
Claude | showcase|      |            |              |
OpenCode| general|      |            |              |
```

This helps you understand which communities drive the most valuable traffic.
