# Show HN: chime-io - Get notified on your phone when Claude Code finishes

**Submitted to:** Hacker News Show HN  
**Project:** chime-io - Real-time Telegram notifications for AI coding tools  
**Target:** AI coding tool users, developers who value productivity

---

## Title Options (Pick one based on timing/vibe)

### Option A: Direct Problem-Solution (Recommended)
> Show HN: Get notified on your phone when Claude Code finishes a long task

### Option B: Story-Driven
> Show HN: I kept missing Claude's responses so I built a notification bridge

### Option C: Technical Hook
> Show HN: chime-io – Telegram notifications for Claude Code hooks

---

## Main Post Body

```
I built chime-io because I kept missing when Claude Code finished tasks while I was away from my desk.

**The Problem:**
Claude Code can run for 10-30 minutes on complex tasks, but I don't want to stare at the terminal. I'd get coffee, take a walk, or work on something else - then completely miss when it finished. Sometimes I wouldn't check for hours.

**The Solution:**
chime-io sends instant Telegram notifications to your phone when Claude finishes, errors, or needs your permission. Works with Claude Code, OpenCode, and any AI coding tool that supports hooks.

**Key Features:**
- Real-time notifications via Telegram (works on all devices)
- Multiple event triggers: Stop, Error, PermissionRequest, UserPromptSubmit
- Clean, formatted messages with session stats and git context
- Works as CLI tool, Claude Code plugin, or OpenCode plugin
- TypeScript monorepo with pluggable architecture

**Quick Start:**
```bash
npm install -g @chime-io/cli
export TELEGRAM_BOT_TOKEN="your_token"
export TELEGRAM_USER_ID="your_id"
chime -m "Hello from chime-io!"
```

**GitHub:** https://github.com/telnotify/chime-io

Built with TypeScript, pnpm, Rush. Would love feedback from fellow Claude Code users!
```

---

## FAQ Presets (Prepare answers for common questions)

### Q1: Why Telegram instead of native notifications?
> **Answer:** Telegram works across all platforms (iOS, Android, Desktop, Web) and doesn't require complex push notification setup. You get the notification on whatever device you're using. It also provides a nice message history you can review later.

### Q2: How is this different from Claude's built-in notifications?
> **Answer:** Claude Code doesn't have built-in mobile notifications. You're either at your desk watching the terminal, or you don't know when it's done. This bridges that gap.

### Q3: Is this secure? Do you see my code?
> **Answer:** No. Everything runs locally on your machine. Your Telegram bot token and messages never leave your system. The plugin only sends notifications - it doesn't read or transmit your actual code.

### Q4: Does it work with other AI tools?
> **Answer:** Yes! The CLI works with any tool. The plugins currently support Claude Code and OpenCode, but the architecture is pluggable. If your AI tool supports hooks, you can integrate it.

### Q5: What about pricing?
> **Answer:** It's completely free and open source. You just need your own Telegram bot (free to create via BotFather).

---

## Posting Strategy

### Best Timing
- **Day:** Tuesday or Wednesday
- **Time:** 9:00-11:00 AM Pacific Time (US West Coast morning)
- **Avoid:** Weekends, Monday mornings, Friday afternoons, US holidays

### Engagement Tactics
1. **First 30 minutes critical** - Reply to every comment quickly
2. **Be humble** - This is HN, not a sales pitch. Acknowledge limitations
3. **Answer technical questions thoroughly** - HN loves implementation details
4. **Accept criticism gracefully** - "That's a fair point, I'll look into that"
5. **Don't argue** - Even if someone is wrong, thank them for the feedback

### Follow-up Comments (if traction is good)
```
Thanks for all the feedback! A few updates:

- Feature request: Discord/Slack support is on the roadmap
- Question about X: Here's the technical detail...
- Bug found: Pushing a fix now
```

---

## Success Metrics

### Good Performance
- 50+ upvotes within 6 hours
- 20+ comments
- 50-100 GitHub stars within 24 hours

### Moderate Performance
- 20-50 upvotes
- 10-20 comments
- 20-50 GitHub stars

### Recovery Strategy (if slow start)
- Wait 2 hours, if <10 upvotes, try reposting with a different title
- Engage more actively in comments to boost visibility
- Cross-post to relevant subreddits same day

---

## Notes

- Keep the tone authentic and problem-focused
- Don't over-promise or use marketing speak
- Be ready to answer "Why not just use X?" questions
- Have a friend upvote and comment early to give it initial visibility
