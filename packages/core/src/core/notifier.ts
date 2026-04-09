import type { Notification } from './notification.js';

export interface NotificationChannel {
  id: string;
  send(notification: Notification): Promise<unknown>;
}

export interface Notifier {
  notify(notification: Notification): Promise<void>;
}

export interface CreateNotifierOptions {
  channels?: NotificationChannel[];
}

export function createNotifier({ channels }: CreateNotifierOptions): Notifier {
  const resolvedChannels = Array.isArray(channels)
    ? channels.filter(
        (channel): channel is NotificationChannel => Boolean(channel),
      )
    : [];

  return {
    async notify(notification) {
      for (const channel of resolvedChannels) {
        await channel.send(notification);
      }
    },
  };
}
