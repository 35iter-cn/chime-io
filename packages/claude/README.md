# @chime-io/plugin-claude

Chime IO Notifier plugin for Claude Code.

## Installation

1. Install the plugin to Claude Code plugins directory:

```bash
# Copy plugin to Claude Code plugins directory
cp -r packages/claude ~/.claude/plugins/chime-io-notifier
```

2. Enable the plugin in Claude Code settings:

```bash
# Edit settings.json
claude config set enabledPlugins '["chime-io-notifier"]'
```

Or manually edit `~/.claude/settings.json`:

```json
{
  "enabledPlugins": ["chime-io-notifier"]
}
```

## Configuration

Set environment variables:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"  # Optional: HTML, Markdown, or MarkdownV2
export TELEGRAM_SILENT="0"         # Optional: 1 for silent notifications
```

## Hooks

This plugin registers the following Claude Code hooks:

| Hook | Description |
|------|-------------|
| `Stop` | Notifies when a Claude Code session stops/completes |
| `PermissionRequest` | Notifies when user permission is required |
| `Notification` | Notifies for important notifications |
| `UserPromptSubmit` | Notifies when user asks a question |

## Building

```bash
pnpm install
pnpm build
```

## License

MIT
