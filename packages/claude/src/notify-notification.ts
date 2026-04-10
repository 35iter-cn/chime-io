#!/usr/bin/env node
/**
 * Hook: Notification - Notify for general Claude Code notifications
 */

import {
  createApproveResponse,
  formatNotification,
  sendNotification,
  shouldNotifyNotification,
} from './notifier.js';

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);

    if (!shouldNotifyNotification(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    const text = formatNotification(hookInput);
    await sendNotification({ text });

    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-notification hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
