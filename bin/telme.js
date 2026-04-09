#!/usr/bin/env node

const https = require('https');

function showHelp() {
  console.log(`
Usage: telme [options]

Options:
  -t, --token <token>      Telegram bot token
  -u, --user <user_id>     Target user ID
  -m, --message <text>     Message text
  --html                   Use HTML parse mode (default: MarkdownV2)
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
    parseMode: 'MarkdownV2',
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

function sendMessage(token, userId, message, parseMode, silent) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: userId,
      text: message,
      parse_mode: parseMode,
      disable_notification: silent
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            resolve(result.result);
          } else {
            reject(new Error(`Telegram API Error: ${result.description}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });

    req.write(payload);
    req.end();
  });
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
    const result = await sendMessage(
      options.token,
      options.userId,
      options.message,
      options.parseMode,
      options.silent
    );
    console.log(`Message sent successfully! Message ID: ${result.message_id}`);
  } catch (err) {
    console.error(`Failed to send message: ${err.message}`);
    process.exit(1);
  }
}

main();
