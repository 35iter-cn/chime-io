# @chime-io/channel-telegram

> 📱 Telegram transport layer for Chime IO — Send notifications to your phone.

The official Telegram integration for Chime IO. Provides HTTP transport, message formatting, and bot API integration for mobile notifications.

---

## Features

- 🚀 **HTTP Transport** — Direct Telegram Bot API integration
- 📝 **Format Support** — HTML, Markdown, and MarkdownV2 message formats
- 🔕 **Silent Mode** — Send notifications without sound
- 🛡️ **Error Handling** — Robust retry and error management
- ⚡ **Async Delivery** — Non-blocking notification sending
- 🔐 **Secure** — Token-based authentication

---

## Installation

### As a Dependency

This package is typically used by other Chime IO packages:

```json
{
  "dependencies": {
    "@chime-io/channel-telegram": "workspace:*"
  }
}
```

### Standalone Install

```bash
npm install @chime-io/channel-telegram
```

---

## Usage

### Basic Send

```typescript
import { TelegramChannel } from '@chime-io/channel-telegram';

const channel = new TelegramChannel({
  botToken: '123456789:ABCdefGHIjklMNOpqrSTUvwxyz',
  userId: '123456789'
});

await channel.send({
  message: 'Hello from Chime IO! 🚀',
  parseMode: 'HTML'
});
```

### With Options

```typescript
await channel.send({
  message: '<b>Task Complete!</b>\n\nYour AI session finished.',
  parseMode: 'HTML',
  silent: false
});
```

### Silent Notifications

```typescript
await channel.send({
  message: 'Background job complete',
  silent: true  // No notification sound
});
```

---

## Configuration

### Constructor Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `botToken` | `string` | ✅ | Telegram bot token |
| `userId` | `string` | ✅ | Target user ID |
| `defaultParseMode` | `ParseMode` | ❌ | Default: `'HTML'` |

### Send Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `message` | `string` | ✅ | Message text |
| `parseMode` | `ParseMode` | ❌ | `'HTML'`, `'Markdown'`, `'MarkdownV2'` |
| `silent` | `boolean` | ❌ | Send without notification sound |

---

## Getting Telegram Credentials

### 1. Create a Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name and username
4. Save the token (e.g., `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)

### 2. Get Your User ID

1. Message [@userinfobot](https://t.me/userinfobot)
2. Your user ID will be displayed (e.g., `123456789`)

### 3. Start Your Bot

1. Open `https://t.me/your_bot_username`
2. Click "Start" button
3. Now your bot can send you messages

---

## Development

```bash
# Install dependencies
pnpm rush:install

# Build
pnpm --filter @chime-io/channel-telegram build

# Run tests
pnpm --filter @chime-io/channel-telegram test

# Type check
pnpm --filter @chime-io/channel-telegram typecheck

# Watch mode
pnpm --filter @chime-io/channel-telegram build:watch
```

---

## Package Structure

```
packages/telegram/
├── src/
│   ├── channel.ts        # TelegramChannel class
│   ├── transport.ts      # HTTP transport layer
│   ├── types.ts          # TypeScript definitions
│   ├── test/
│   │   └── *.test.ts    # Test files
│   └── index.ts          # Main exports
└── README.md
```

---

## Related Packages

- [@chime-io/core](../core/) — Core notification models
- [@chime-io/plugin-opencode](../opencode/) — OpenCode plugin
- [@chime-io/plugin-claude](../claude/) — Claude Code plugin
- [@chime-io/cli](../cli/) — Standalone CLI tool

---

## Documentation

📖 [Full Documentation](../../README.md)

---

## License

MIT — See [LICENSE](../../LICENSE) for details.
