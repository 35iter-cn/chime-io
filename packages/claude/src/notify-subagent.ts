#!/usr/bin/env node
/**
 * Hook: SubagentStart / SubagentStop - Notify for high-value subagent events
 */

import {
  createApproveResponse,
  formatSubagentNotification,
  sendNotification,
  shouldNotifySubagent,
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

    if (!shouldNotifySubagent(hookInput)) {
      console.log(JSON.stringify(createApproveResponse()));
      return;
    }

    await sendNotification({ text: formatSubagentNotification(hookInput) });
    console.log(JSON.stringify(createApproveResponse()));
  } catch (error) {
    console.error('Error in notify-subagent hook:', error);
    console.log(JSON.stringify(createApproveResponse()));
  }
}

main();
