#!/usr/bin/env node

const { createNotification, createTelegramChannel } = require('..');

function showHelp() {
  console.log(`
Usage: telme [options]

Options:
  -t, --token <token>      Telegram bot token
  -u, --user <user_id>     Target user ID
  -m, --message <text>     Message text
  --html                   Use HTML parse mode (default: HTML)
  --silent                 Send message silently (no notification)
  -h, --help               Show this help

Environment Variables:
  TELEGRAM_BOT_TOKEN       Bot token (can be used instead of -t)
  TELEGRAM_USER_ID         User ID (can be used instead of -u)

Examples:
  npx telme -t <token> -u <user_id> -m "Hello"
  npx telme -t <token> -u <user_id> -m "*Bold* and _italic_"
  TELEGRAM_BOT_TOKEN=<token> TELEGRAM_USER_ID=<id> npx telme -m "Hello"
`);
}

function parseArgs(args) {
  const options = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    userId: process.env.TELEGRAM_USER_ID,
    message: '',
    parseMode: 'HTML',
    silent: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-h':
      case '--help':
        showHelp();
        process.exit(0);
        break;
      case '-t':
      case '--token':
        options.token = args[++i];
        break;
      case '-u':
      case '--user':
        options.userId = args[++i];
        break;
      case '-m':
      case '--message':
        options.message = args[++i].replace(/\\n/g, '\n');
        break;
      case '--html':
        options.parseMode = 'HTML';
        break;
      case '--silent':
        options.silent = true;
        break;
      default:
        if (!arg.startsWith('-') && !options.message) {
          options.message = arg;
        }
        break;
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const options = parseArgs(args);

  if (!options.token) {
    console.error('Error: Bot token is required. Use -t or set TELEGRAM_BOT_TOKEN');
    process.exit(1);
  }

  if (!options.userId) {
    console.error('Error: User ID is required. Use -u or set TELEGRAM_USER_ID');
    process.exit(1);
  }

  if (!options.message) {
    console.error('Error: Message is required. Use -m');
    process.exit(1);
  }

  try {
    const channel = createTelegramChannel({
      token: options.token,
      userId: options.userId,
      parseMode: options.parseMode,
      silent: options.silent
    });
    const result = await channel.send(createNotification({
      agent: 'cli',
      kind: 'manual.message',
      title: options.message,
      lines: []
    }));
    console.log(`Message sent successfully! Message ID: ${result.message_id}`);
  } catch (err) {
    console.error(`Failed to send message: ${err.message}`);
    process.exit(1);
  }
}

main();
