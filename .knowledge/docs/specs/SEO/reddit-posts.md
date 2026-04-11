# Reddit Posts - Community-Specific Versions

**Project:** chime-io - Real-time Telegram notifications for AI coding tools  
**Goal:** Tailored posts for different Reddit communities

---

## r/ClaudeAI (23k+ members)

**Best time to post:** Tuesday-Thursday, 10 AM - 2 PM EST  
**Post type:** Tool showcase + problem discussion

### Title
> [Tool] I built a notification bridge so I don't miss when Claude finishes long tasks

### Body
```
Like many of you, I often start complex refactoring or debugging sessions in Claude Code and then step away to grab coffee or take a walk. The problem? I'd completely miss when Claude finished, sometimes not checking for hours.

So I built **chime-io** - it sends Telegram notifications to my phone when Claude Code finishes, hits an error, or needs my input.

**What it does:**
- Sends instant notifications to your phone via Telegram
- Triggers on: session completion, errors, permission requests
- Includes session stats and optional git context
- Works as both a CLI tool and Claude Code plugin

**Setup is simple:**
```bash
npm install -g @chime-io/cli
# Set your Telegram bot token and user ID
chime -m "Test notification"
```

**GitHub:** https://github.com/telnotify/chime-io

Anyone else have this "missed notification" problem? What workarounds have you tried?

Would love feedback from the Claude community!
```

### Posting Tips
- Flair: Use "Tool" or "Showcase" if available
- Engage with every comment within the first 2 hours
- Don't just drop the link - ask a question to encourage discussion
- Check subreddit rules first (some have self-promo restrictions)

---

## r/OpenCode (smaller but highly targeted)

**Best time to post:** Any weekday, community is active  
**Post type:** Direct integration showcase

### Title
> Built a Telegram notification plugin for OpenCode users

### Body
```
Hey OpenCode community!

I created **chime-io** - a notification plugin that sends Telegram messages when your AI coding sessions complete.

**Why I built it:**
OpenCode sessions can run for a while, and I kept missing completions when I stepped away from my desk. This solves that.

**Integration:**
- Native OpenCode plugin support
- Sends notifications on: Stop, Error, PermissionRequest
- Configurable detail levels and message formatting
- TypeScript, clean architecture

**Quick start:**
```bash
npm install -g @chime-io/cli
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_USER_ID="your_id"
```

**GitHub:** https://github.com/telnotify/chime-io

The OpenCode formatter is in `packages/opencode/` if you want to check the implementation. Feedback welcome!
```

### Posting Tips
- This community is smaller but very technical - emphasize implementation details
- Mention you're open to contributions
- Check if there's a specific channel for tools/plugins

---

## r/programmingtools (500k+ members)

**Best time to post:** Wednesday, 11 AM - 3 PM EST  
**Post type:** General developer tool showcase

### Title
> chime-io: Get phone notifications when your terminal AI finishes tasks

### Body
```
**The Problem:**
I use Claude Code for complex refactoring and debugging. Sessions take 10-30 minutes, but I don't want to babysit the terminal. I'd step away, miss the completion, and only realize hours later.

**The Solution:**
chime-io bridges the gap. It sends Telegram notifications to your phone when AI coding tools finish, error, or need input.

**Works with:**
- Claude Code (official plugin)
- OpenCode (official plugin)
- Any AI tool via CLI integration

**Features:**
- Real-time Telegram notifications
- Multiple triggers: completion, errors, permission requests
- Session stats and git context in messages
- Clean TypeScript architecture, pluggable design

**Try it:**
```bash
npm install -g @chime-io/cli
```

**GitHub:** https://github.com/telnotify/chime-io

Perfect for developers who multitask while AI tools work in the background.

Anyone using similar notification setups for their dev workflow?
```

### Posting Tips
- Focus on the general productivity angle, not just Claude
- Ask an open question at the end to drive engagement
- This subreddit is strict about self-promotion - read rules carefully

---

## r/webdev (1M+ members)

**Best time to post:** Tuesday or Thursday, 12 PM - 4 PM EST  
**Post type:** Developer productivity tool

### Title
> Stop babysitting your AI coding assistant - get notified when it finishes

### Body
```
If you're using Claude Code, Cursor, or similar AI tools for web development, you know the drill: start a complex task, wait 10-20 minutes, keep checking the terminal.

I got tired of that workflow, so I built **chime-io**.

**What it does:**
Sends Telegram notifications to your phone when your AI coding assistant:
- ✅ Completes a task
- ❌ Hits an error
- ⚠️ Needs your permission
- 💬 Has a response ready

**Why Telegram?**
- Works on iOS, Android, Web, Desktop
- No complex push notification setup
- Message history you can reference
- Completely free

**Tech stack:**
TypeScript monorepo with pluggable architecture. CLI + plugins for Claude Code and OpenCode.

**GitHub:** https://github.com/telnotify/chime-io

```bash
npm install -g @chime-io/cli
```

Would love to hear how other web devs are handling AI tool notifications. Is this a problem you've solved differently?
```

### Posting Tips
- This is a large subreddit - expect both positive and critical comments
- Be ready to explain technical choices
- Emphasize the web developer use case
- Weekend posts tend to get buried - stick to weekdays

---

## General Reddit Posting Guidelines

### DO:
- ✅ Read subreddit rules before posting
- ✅ Use appropriate flair/tags
- ✅ Write unique content for each community (don't copy-paste)
- ✅ Engage genuinely with comments
- ✅ Be transparent about it being your project
- ✅ Respond to criticism gracefully
- ✅ Post at optimal times for each community

### DON'T:
- ❌ Post the same content to multiple subs simultaneously (spread them out)
- ❌ Use clickbait titles
- ❌ Spam or post too frequently
- ❌ Ignore comments or questions
- ❌ Get defensive about criticism
- ❌ Delete posts that don't perform well (looks suspicious)

### Timing Strategy
1. **Day 1:** Post to r/ClaudeAI (primary target)
2. **Day 2-3:** If good engagement, post to r/programmingtools
3. **Day 4-5:** Post to r/webdev
4. **Day 6-7:** Post to r/OpenCode (smaller but targeted)

### Engagement Tracking
Keep a simple log:
```
Date | Subreddit | Upvotes | Comments | Stars Gained | Notes
-----|-----------|---------|----------|--------------|-------
```

---

## Response Templates

### For "Why not just use pushover/pushbullet/...?"
> Good question! Those are great services. I chose Telegram because it's free, requires no additional app installation (most devs already have it), and has a nice message history. But the architecture is pluggable - adding other channels would be straightforward.

### For "This seems unnecessary"
> Fair point! It definitely depends on your workflow. I find it useful when I'm running long refactoring tasks or tests and want to step away. Not everyone will need it, and that's okay.

### For "Self-promo spam"
> I understand the concern. I'm a developer who built this to solve my own problem, and I'm sharing it with communities where I think it provides value. Happy to answer any technical questions about the implementation.
