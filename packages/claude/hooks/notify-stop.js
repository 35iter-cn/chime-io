#!/usr/bin/env node
/**
 * Hook: Stop - Notify when Claude Code session stops
 */

import { sendNotification, formatSessionCompleted } from './lib/notifier.js';

async function main() {
  const stdin = process.stdin;
  let input = '';

  stdin.setEncoding('utf8');

  for await (const chunk of stdin) {
    input += chunk;
  }

  try {
    const hookInput = JSON.parse(input);

    // Skip if this is not a meaningful stop
    if (hookInput.reason === 'user_exit' || hookInput.reason === 'interrupt') {
      process.exit(0);
    }

    const text = formatSessionCompleted(hookInput);
    await sendNotification({ text });

    // Return success response
    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  } catch (error) {
    console.error('Error in notify-stop hook:', error);
    // Always approve even if notification fails
    console.log(JSON.stringify({
      decision: 'approve',
      reason: '',
      systemMessage: ''
    }));
  }
}

main();
