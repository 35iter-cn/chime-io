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
export CLAUDE_NOTIFY_DETAIL_LEVEL="medium"
export CLAUDE_NOTIFY_INCLUDE_STATS="true"
export CLAUDE_NOTIFY_INCLUDE_GIT="true"
export CLAUDE_NOTIFY_TOOL_FILTER="Bash|Edit"
```

## Hooks

This plugin registers the following Claude Code hooks:

| Hook | Description |
|------|-------------|
| `Stop` | Notifies when a Claude Code session stops/completes |
| `PermissionRequest` | Notifies when user permission is required |
| `Notification` | Notifies for important notifications |
| `UserPromptSubmit` | Notifies when user asks a question |
| `PostToolUseFailure` | Notifies when a tool execution fails |
| `SubagentStart` | Registered, but silent by default |
| `SubagentStop` | Notifies for high-signal subagent summaries |

## Building

Run these commands from the monorepo root:

```bash
node common/scripts/install-run-rush.js install
pnpm --filter @chime-io/plugin-claude build
pnpm --filter @chime-io/plugin-claude test
pnpm --filter @chime-io/plugin-claude typecheck
```

## Installation

1. Build the plugin first (see Building above)

2. Copy the entire plugin directory to Claude Code plugins:

```bash
cp -r packages/claude ~/.claude/plugins/chime-io-notifier
```

3. Enable the plugin in Claude Code settings:

```bash
claude config set enabledPlugins '["chime-io-notifier"]'
```

## License

MIT
