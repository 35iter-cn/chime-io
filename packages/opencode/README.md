# @chime-io/plugin-opencode

> 🔌 OpenCode plugin for Chime IO — Mobile notifications for AI coding sessions.

Receive instant Telegram notifications when your OpenCode sessions complete, error, or need your attention. Never miss an important AI coding moment again.

---

## Features

- 🔔 **Real-time notifications** — Get notified on session stop, errors, and permission requests
- 📊 **Rich context** — Includes session stats, token usage, and duration
- 🔗 **Git integration** — Shows branch, commit, and repository information
- 🎨 **Customizable format** — Configure detail levels and output format
- 🔕 **Silent mode** — Send notifications without disturbing

---

## Installation

### From NPM (Recommended)

```bash
opencode plugin install @chime-io/plugin-opencode
```

### From Source (Monorepo)

```bash
# Install dependencies
pnpm rush:install

# Build the plugin
pnpm --filter @chime-io/plugin-opencode build

# The plugin entry point is at:
# packages/opencode/dist/plugin.js
```

---

## Configuration

Set environment variables to configure the plugin:

```bash
# Required
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"

# Optional
export TELEGRAM_PARSE_MODE="HTML"     # HTML, Markdown, or MarkdownV2
export TELEGRAM_SILENT="0"             # 1 for silent notifications
```

### Getting Your Credentials

1. **Bot Token**: Message [@BotFather](https://t.me/botfather) and create a new bot
2. **User ID**: Message [@userinfobot](https://t.me/userinfobot) to get your ID

---

## Usage

Once installed and configured, the plugin automatically hooks into OpenCode events:

| Event | Notification |
|-------|-------------|
| Session Stop | ✅ Task completed with summary |
| Session Error | 🚨 Error details and context |
| Permission Request | ⚡ Immediate alert when approval needed |

---

## API

### Plugin Entry Point

```javascript
// Load the plugin
import plugin from '@chime-io/plugin-opencode';

// Plugin is automatically registered with OpenCode
```

### Formatter

```javascript
import { formatNotification } from '@chime-io/plugin-opencode/format';

const message = formatNotification({
  event: 'stop',
  sessionId: 'abc-123',
  duration: 120,
  tokenUsage: 1500
});
```

---

## Development

```bash
# Run tests
pnpm --filter @chime-io/plugin-opencode test

# Type check
pnpm --filter @chime-io/plugin-opencode typecheck

# Build
pnpm --filter @chime-io/plugin-opencode build

# Watch mode
pnpm --filter @chime-io/plugin-opencode build:watch
```

---

## Plugin Architecture

```
src/
├── index.ts           # Main plugin entry
├── formatter.ts       # Message formatting
├── notifier-plugin.ts # Plugin registration
└── test/             # Test files
```

---

## Related Packages

- [@chime-io/core](../core/) — Core notification models
- [@chime-io/channel-telegram](../telegram/) — Telegram transport
- [@chime-io/plugin-claude](../claude/) — Claude Code plugin
- [@chime-io/cli](../cli/) — Standalone CLI tool

---

## Documentation

📖 [Full Documentation](../../README.md)

---

## License

MIT — See [LICENSE](../../LICENSE) for details.
