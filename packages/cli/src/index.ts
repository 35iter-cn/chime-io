#!/usr/bin/env node

import {
  createAgentRegistry,
  createNotification,
  type AgentDescriptor,
  type Notification,
} from '@chime-io/core';
import { createTelegramChannel } from '@chime-io/channel-telegram';

export interface CliOptions {
  token: string | undefined;
  userId: string | undefined;
  message: string;
  parseMode: 'HTML';
  silent: boolean;
  help: boolean;
}

const cliDescriptor: AgentDescriptor = {
  id: 'cli',
  displayName: 'CLI',
  defaultEmoji: '💬',
};

function getHelpText(): string {
  return `
Usage: chime [options]

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
  pnpm --filter @chime-io/cli exec chime -t <token> -u <user_id> -m "Hello"
  TELEGRAM_BOT_TOKEN=<token> TELEGRAM_USER_ID=<id> pnpm --filter @chime-io/cli exec chime -m "Hello"
`.trim();
}

export function parseArgs(args: string[], env: NodeJS.ProcessEnv): CliOptions {
  const options: CliOptions = {
    token: env.TELEGRAM_BOT_TOKEN,
    userId: env.TELEGRAM_USER_ID,
    message: '',
    parseMode: 'HTML',
    silent: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg) continue;

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-t':
      case '--token':
        options.token = args[index + 1];
        index += 1;
        break;
      case '-u':
      case '--user':
        options.userId = args[index + 1];
        index += 1;
        break;
      case '-m':
      case '--message':
        options.message = (args[index + 1] ?? '').replace(/\\n/g, '\n');
        index += 1;
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

/**
 * Build the notification carried by the CLI's manual message.
 * A single-subject completion notification keeps the pipeline uniform.
 */
export function buildCliNotification(message: string): Notification {
  return createNotification({
    agent: 'cli',
    kind: 'manual.message',
    intent: 'completion',
    severity: 'info',
    requiresAction: false,
    subject: message,
  });
}

export async function main(
  args = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  if (args.length === 0) {
    console.log(getHelpText());
    process.exit(0);
  }

  const options = parseArgs(args, env);

  if (options.help) {
    console.log(getHelpText());
    process.exit(0);
  }

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
    const registry = createAgentRegistry([cliDescriptor]);

    const channel = createTelegramChannel({
      token: options.token,
      userId: options.userId,
      parseMode: options.parseMode,
      silent: options.silent,
      resolveAgent: (id) => registry.lookup(id),
    });

    const result = await channel.send(buildCliNotification(options.message));

    const messageId =
      typeof result === 'object' && result && 'message_id' in result
        ? String((result as { message_id: unknown }).message_id)
        : 'unknown';

    console.log(`Message sent successfully! Message ID: ${messageId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send message: ${message}`);
    process.exit(1);
  }
}

const isEntryPoint =
  process.argv[1]?.includes('cli') || process.argv[1]?.includes('chime');

if (isEntryPoint) {
  void main();
}
