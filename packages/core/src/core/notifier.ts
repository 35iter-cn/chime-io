import type { NotificationChannel } from './channel.js';
import type { Notification } from './notification.js';

export interface ChannelResult {
  channelId: string;
  status: 'fulfilled' | 'rejected';
  value?: unknown;
  reason?: unknown;
}

export interface Notifier {
  notify(notification: Notification): Promise<ChannelResult[]>;
}

export interface CreateNotifierOptions {
  channels?: NotificationChannel[];
}

/**
 * Create a Notifier that fans out a notification to every channel
 * independently. A failure in one channel never blocks another; each
 * outcome is captured in {@link ChannelResult}.
 */
export function createNotifier({ channels }: CreateNotifierOptions): Notifier {
  const resolvedChannels = Array.isArray(channels)
    ? channels.filter(
        (channel): channel is NotificationChannel => Boolean(channel),
      )
    : [];

  return {
    async notify(notification) {
      const results = await Promise.all(
        resolvedChannels.map(
          async (channel): Promise<ChannelResult> => {
            try {
              const value = await channel.send(notification);
              return { channelId: channel.id, status: 'fulfilled', value };
            } catch (reason) {
              return { channelId: channel.id, status: 'rejected', reason };
            }
          },
        ),
      );
      return results;
    },
  };
}
