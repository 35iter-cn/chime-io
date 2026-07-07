export interface AgentDescriptor {
  /** Matches Notification.agent. */
  id: string;
  /** Human-readable brand name used by channel headers. */
  displayName: string;
  /** Fallback emoji when a channel has no intent-specific icon. */
  defaultEmoji: string;
  /** Optional deep link builder derived from Notification.metadata. */
  deepLinkTemplate?: (metadata: Record<string, unknown>) => string | undefined;
}

export type ResolveAgent = (agentId: string) => AgentDescriptor | undefined;

export interface AgentRegistry {
  register(descriptor: AgentDescriptor): void;
  lookup(agentId: string): AgentDescriptor | undefined;
}

/**
 * Create an in-memory agent descriptor registry.
 * Channels can call {@link AgentRegistry.lookup} to resolve descriptors when
 * rendering.
 */
export function createAgentRegistry(
  initial?: readonly AgentDescriptor[],
): AgentRegistry {
  const descriptors = new Map<string, AgentDescriptor>();
  for (const descriptor of initial ?? []) {
    descriptors.set(descriptor.id, descriptor);
  }
  return {
    register(descriptor) {
      descriptors.set(descriptor.id, descriptor);
    },
    lookup(agentId) {
      return descriptors.get(agentId);
    },
  };
}
