# @chime-io/cli

> 🔔 Command-line interface for Chime IO — the ultimate developer notification tool for AI coding workflows.

Send mobile notifications from your terminal to Telegram. Perfect for CI/CD pipelines, background jobs, and custom integrations.

---

## Features

- ⚡ **Instant delivery** — Direct Telegram API integration
- 🔧 **Flexible messaging** — Support for HTML, Markdown, and MarkdownV2 formats
- 🔕 **Silent mode** — Send notifications without sound
- 🛠️ **CLI-first** — Designed for scripts and automation
- 📱 **Mobile notifications** — Reach your phone from anywhere

---

## Installation

### Global Install

```bash
npm install -g @chime-io/cli
```

### One-time Use

```bash
npx @chime-io/cli -t <token> -u <user_id> -m "Your message"
```

### From Source (Monorepo)

```bash
pnpm rush:install
pnpm --filter @chime-io/cli build
```

---

## Usage

### Basic Command

```bash
chime -t <telegram_bot_token> -u <telegram_user_id> -m "Your message"
```

### With All Options

```bash
chime \
  -t "123456789:ABCdefGHIjklMNOpqrSTUvwxyz" \
  -u "123456789" \
  -m "Deployment complete! 🚀" \
  --parse-mode HTML \
  --silent
```

### Environment Variables

Instead of passing flags, you can set environment variables:

```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_USER_ID="your_user_id"
export TELEGRAM_PARSE_MODE="HTML"
export TELEGRAM_SILENT="0"

# Now you can use shorter commands
chime -m "Hello from environment!"
```

---

## CLI Options

| Option | Short | Required | Description |
|--------|-------|----------|-------------|
| `--token` | `-t` | Yes* | Telegram bot token |
| `--user` | `-u` | Yes* | Telegram user ID |
| `--message` | `-m` | Yes | Message to send |
| `--parse-mode` | - | No | Format: `HTML`, `Markdown`, `MarkdownV2` |
| `--silent` | - | No | Send without notification sound |
| `--help` | `-h` | No | Show help |

*Can be provided via environment variables instead.

---

## Use Cases

### CI/CD Pipeline Notifications

```bash
# In your deploy script
chime -m "🚀 Starting deployment..."

# Deploy your app
./deploy.sh

if [ $? -eq 0 ]; then
  chime -m "✅ Deployment successful!"
else
  chime -m "❌ Deployment failed!"
fi
```

### Background Job Monitoring

```bash
# process_data.sh
chime -m "📊 Starting data processing..."

python process_large_dataset.py

chime -m "✅ Data processing complete!"
```

### System Monitoring

```bash
# Add to crontab
echo "0 */6 * * * chime -m 'Server check-in: $(date)'" | crontab -
```

---

## Development

```bash
# Run tests
pnpm --filter @chime-io/cli test

# Type check
pnpm --filter @chime-io/cli typecheck

# Build
pnpm --filter @chime-io/cli build
```

---

## Related Packages

- [@chime-io/core](../core/) — Core notification models and utilities
- [@chime-io/channel-telegram](../telegram/) — Telegram transport layer
- [@chime-io/plugin-opencode](../opencode/) — OpenCode plugin
- [@chime-io/plugin-claude](../claude/) — Claude Code plugin

---

## Documentation

📖 [Full Documentation](../../README.md)

---

## License

MIT — See [LICENSE](../../LICENSE) for details.
