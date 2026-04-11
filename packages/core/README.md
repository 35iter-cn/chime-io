# @chime-io/core

> 🧱 Core library for Chime IO — Notification models, renderers, and utilities.

The foundational package that powers all Chime IO notification tools. Provides shared models, formatting utilities, and logging infrastructure.

---

## Features

- 📦 **Notification Models** — Type-safe notification data structures
- 🎨 **Renderers** — Flexible message formatting for multiple platforms
- 📝 **Logging** — Structured logging for debugging and monitoring
- 🔧 **Utilities** — Shared helper functions across all packages
- 📘 **TypeScript** — Full type support out of the box

---

## Installation

### As a Dependency

This package is typically used as a dependency by other Chime IO packages:

```json
{
  "dependencies": {
    "@chime-io/core": "workspace:*"
  }
}
```

### Standalone Install

```bash
npm install @chime-io/core
```

---

## Usage

### Notification Models

```typescript
import { Notification, NotificationLevel } from '@chime-io/core';

const notification: Notification = {
  id: 'notif-123',
  level: NotificationLevel.INFO,
  title: 'Task Complete',
  message: 'Your AI session finished successfully',
  metadata: {
    duration: 300,
    tokenUsage: 1500
  }
};
```

### Message Rendering

```typescript
import { renderNotification } from '@chime-io/core';

const htmlMessage = renderNotification(notification, {
  format: 'html',
  includeStats: true
});
```

### Logging

```typescript
import { createLogger } from '@chime-io/core';

const logger = createLogger('my-module');

logger.info('Processing notification');
logger.error('Failed to send', { error: err.message });
```

---

## API Reference

### Types

```typescript
// Notification levels
enum NotificationLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Core notification interface
interface Notification {
  id: string;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp?: Date;
  metadata?: Record<string, unknown>;
}

// Render options
interface RenderOptions {
  format: 'html' | 'markdown' | 'plaintext';
  includeStats?: boolean;
  detailLevel?: 'low' | 'medium' | 'high';
}
```

### Functions

- `renderNotification(notification, options)` — Format notification for display
- `createLogger(namespace)` — Create a namespaced logger
- `sanitizeMessage(text)` — Clean and escape message content
- `truncate(text, maxLength)` — Truncate text with ellipsis

---

## Development

```bash
# Install dependencies
pnpm rush:install

# Build
pnpm --filter @chime-io/core build

# Run tests
pnpm --filter @chime-io/core test

# Type check
pnpm --filter @chime-io/core typecheck

# Watch mode
pnpm --filter @chime-io/core build:watch
```

---

## Package Structure

```
packages/core/
├── src/
│   ├── models/
│   │   ├── notification.ts    # Notification data models
│   │   └── index.ts           # Model exports
│   ├── renderers/
│   │   ├── html-renderer.ts   # HTML message renderer
│   │   ├── md-renderer.ts     # Markdown renderer
│   │   └── index.ts           # Renderer exports
│   ├── logger.ts              # Logging utilities
│   ├── utils.ts               # Helper functions
│   ├── test/
│   │   └── *.test.ts         # Test files
│   └── index.ts               # Main exports
└── README.md
```

---

## Related Packages

- [@chime-io/channel-telegram](../telegram/) — Telegram transport layer
- [@chime-io/plugin-opencode](../opencode/) — OpenCode plugin
- [@chime-io/plugin-claude](../claude/) — Claude Code plugin
- [@chime-io/cli](../cli/) — Standalone CLI tool

---

## Documentation

📖 [Full Documentation](../../README.md)

---

## License

MIT — See [LICENSE](../../LICENSE) for details.
