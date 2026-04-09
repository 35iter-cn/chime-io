export interface Notification {
  agent: string;
  kind: string;
  title: string;
  lines: string[];
  metadata: Record<string, unknown>;
}

export interface NotificationInput {
  agent: string;
  kind: string;
  title: string;
  lines?: string[];
  metadata?: Record<string, unknown>;
}

export function createNotification(input: NotificationInput): Notification {
  return {
    agent: input.agent,
    kind: input.kind,
    title: input.title,
    lines: Array.isArray(input.lines)
      ? input.lines.filter((line): line is string => Boolean(line))
      : [],
    metadata: input.metadata ?? {},
  };
}
