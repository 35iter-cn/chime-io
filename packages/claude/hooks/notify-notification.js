#!/usr/bin/env node
/**
 * Hook: Notification - Notify for general Claude Code notifications
 */

import { sendNotification, formatNotification } from './lib/notifier.js';

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);

    // Skip low-priority notifications
    const priority = hookInput.priority || hookInput.notification?.priority;
    if (priority === 'low' || priority === 'info') {
      process.exit(0);
    }

    const text = formatNotification(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  } catch (error) {
    console.error('Error in notify-notification hook:', error);
    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  }
}

main();
