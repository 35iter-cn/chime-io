import type { ResolveAgent } from './agent.js';
import type { Notification } from './notification.js';

export type ChannelRenderer<T = string> = (
  notification: Notification,
  resolveAgent: ResolveAgent,
) => T;

export interface NotificationChannel {
  id: string;
  send(notification: Notification): Promise<unknown>;
}
