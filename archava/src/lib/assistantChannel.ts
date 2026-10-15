import { ASSISTANT_ACTION_TOPIC, ASSISTANT_RESULT_TOPIC, ASSISTANT_STATE_TOPIC, assistantSnapshot, executeAssistantCommand, parseAssistantCommand } from './assistant.ts';
import { nextRevision } from './siteAwareness.ts';

export function createAssistantChannel(send: (data: Uint8Array, topic: string) => Promise<unknown>, agentIdentity: string, initialRevision = 0) {
  let revision = initialRevision;
  let disposed = false;
  const snapshot = () => assistantSnapshot(revision = nextRevision(revision));
  return {
    get revision() { return revision; },
    publish: () => disposed ? Promise.resolve() : send(new TextEncoder().encode(JSON.stringify(snapshot())), ASSISTANT_STATE_TOPIC),
    receive: async (data: Uint8Array, identity: string | undefined, topic: string | undefined) => {
      if (disposed || topic !== ASSISTANT_ACTION_TOPIC || identity !== agentIdentity) return false;
      const command = parseAssistantCommand(data);
      if (!command) return false;
      const result = await executeAssistantCommand(command);
      if (disposed) return false;
      await send(new TextEncoder().encode(JSON.stringify({ ...result, state: snapshot() })), ASSISTANT_RESULT_TOPIC);
      return true;
    },
    dispose: () => { disposed = true; },
  };
}
