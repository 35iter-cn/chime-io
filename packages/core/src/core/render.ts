import type { Notification } from './notification.js';

export type MessageRenderer = (notification: Notification) => string;

export function createMessageRenderer(): MessageRenderer {
  return (notification) =>
    [notification.title, ...notification.lines].join('\n');
}
