# @chime-io/plugin-claude

> 🔔 Claude Code plugin for Chime IO — Mobile notifications for your AI coding assistant.

Get instant Telegram notifications when Claude Code finishes tasks, encounters errors, or needs your approval. Stay connected to your development workflow from anywhere.

---

## Features

- 🛑 **Stop Notifications** — Know when Claude finishes a session
- ❌ **Error Alerts** — Get notified immediately on failures
- ⚡ **Permission Requests** — Never miss when Claude needs approval
- 📊 **Session Statistics** — See token usage, duration, and cost
- 🔗 **Git Context** — Branch, commit, and repository information
- 🔧 **Tool Filtering** — Filter notifications by tool type (Bash, Edit, etc.)
- 🔕 **Silent Mode** — Send without sound when you prefer quiet

---

## Installation

### Method 1: Copy to Plugins Directory

```bash
# 1. Build the plugin (from monorepo root)
pnpm rush:install
pnpm --filter @chime-io/plugin-claude build

# 2. Copy to Claude Code plugins
cp -r packages/claude ~/.claude/plugins/chime-io-notifier

# 3. Enable the plugin
claude config set enabledPlugins '["chime-io-notifier"]'
```

### Method 2: Local Marketplace (Development)

```bash
# 1. Ensure running as non-root user
# 2. Add local marketplace
claude /plugin marketplace add /path/to/this/repo

# 3. Install from /plugin interface
# Look for "chime-io-notifier" from "telnotify-dev"
```

### Verify Installation

```bash
# Check installed plugins
claude /plugin

# The plugin should appear in the list
```

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | ✅ | - | Your bot token from [@BotFather](https://t.me/botfather) |
| `TELEGRAM_USER_ID` | ✅ | - | Your user ID from [@userinfobot](https://t.me/userinfobot) |
| `TELEGRAM_PARSE_MODE` | ❌ | `HTML` | Message format: `HTML`, `Markdown`, `MarkdownV2` |
| `TELEGRAM_SILENT` | ❌ | `0` | `1` for silent notifications |
| `CLAUDE_NOTIFY_DETAIL_LEVEL` | ❌ | `medium` | Detail level: `low`, `medium`, `high` |
| `CLAUDE_NOTIFY_INCLUDE_STATS` | ❌ | `true` | Include session statistics |
| `CLAUDE_NOTIFY_INCLUDE_GIT` | ❌ | `true` | Include git context |
| `CLAUDE_NOTIFY_TOOL_FILTER` | ❌ | - | Filter by tool (e.g., `Bash\|Edit`) |

### Setup Example

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.claude/settings.json env
export TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
export TELEGRAM_USER_ID="123456789"
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
```

---

## Supported Hooks

This plugin registers the following Claude Code hooks:

| Hook | Event | Description |
|------|-------|-------------|
| `Stop` | ✅ Session complete | Notifies when Claude finishes successfully |
| `StopFailure` | ❌ Session failed | Notifies on errors and failures |
| `PermissionRequest` | ⚡ Needs approval | Alerts when user action required |
| `PostToolUseFailure` | 🔧 Tool failed | Notifies when tool execution fails |
| `SubagentStart` | 🤖 Subagent start | Registered, silent by default |
| `SubagentStop` | ✅ Subagent done | Registered, silent by default |

---

## Notification Examples

### Session Complete
```
✅ Claude Session Complete

Duration: 5m 32s
Tokens: 2,450 input / 890 output
Git: main@a1b2c3d

Task completed successfully!
```

### Error Alert
```
❌ Claude Session Error

Error: Tool execution failed
Tool: Bash
Duration: 2m 15s

Details: Command returned non-zero exit code
```

### Permission Request
```
⚡ Permission Required

Claude needs approval to:
- Edit: src/config.ts

Waiting for your response...
```

---

## Development

```bash
# Install dependencies
pnpm rush:install

# Build
pnpm --filter @chime-io/plugin-claude build

# Run tests
pnpm --filter @chime-io/plugin-claude test

# Type check
pnpm --filter @chime-io/plugin-claude typecheck

# Watch mode
pnpm --filter @chime-io/plugin-claude build:watch
```

---

## Plugin Structure

```
packages/claude/
├── src/
│   ├── hooks/
│   │   ├── notify-stop.ts       # Stop event handler
│   │   ├── notify-error.ts      # Error event handler
│   │   ├── notify-permission.ts # Permission request handler
│   │   ├── notify-question.ts   # User question handler
│   │   └── notify-tool-failure.ts # Tool failure handler
│   ├── test/
│   │   └── *.test.ts           # Test files
│   └── index.ts                # Plugin entry
├── .claude-plugin/
│   └── manifest.json           # Plugin manifest
└── README.md
```

---

## Troubleshooting

### Plugin Not Appearing

1. Ensure running `claude` CLI as non-root user
2. Check `~/.claude/plugins/` for the plugin directory
3. Verify `claude config get enabledPlugins` includes `"chime-io-notifier"`

### Notifications Not Sending

1. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_USER_ID` are set
2. Ensure you've started the bot: `https://t.me/your_bot_username`
3. Check Claude Code logs for errors

### Build Issues

```bash
# Clean and rebuild
pnpm --filter @chime-io/plugin-claude clean
pnpm --filter @chime-io/plugin-claude build
```

---

## Related Packages

- [@chime-io/core](../core/) — Core notification models
- [@chime-io/channel-telegram](../telegram/) — Telegram transport
- [@chime-io/plugin-opencode](../opencode/) — OpenCode plugin
- [@chime-io/cli](../cli/) — Standalone CLI tool

---

## Documentation

📖 [Full Documentation](../../README.md)

---

## License

MIT — See [LICENSE](../../LICENSE) for details.
