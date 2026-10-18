import { randomBytes } from "node:crypto";
import { AccessToken } from "livekit-server-sdk";
import { TrackSource } from "@livekit/protocol";

const AGENT_EVICT_GRACE_POLLS = 10;
const AGENT_EVICT_LATE_POLLS = 40;
const AGENT_EVICT_PAUSE_MS = 500;

/** Scoped room lifecycle shared by all anonymous website conversations. */
export function createRoomProvider({ rooms, dispatch, key, secret, config, now = Date.now }) {
  async function deleteRoom(roomName) {
    try { await rooms.deleteRoom(roomName); }
    catch (error) { if (!isMissingRoom(error)) throw error; }
  }
  async function open({ endsAt }) {
    const roomName = `${config.projectId}-${randomBytes(12).toString("hex")}`;
    const guestIdentity = `guest-${randomBytes(8).toString("hex")}`;
    await rooms.createRoom({
      name: roomName, emptyTimeout: 60, departureTimeout: 30, maxParticipants: 4,
      metadata: JSON.stringify({
        product: "archava-template", projectId: config.projectId, guestIdentity, endsAt,
        avatarProvider: config.avatarProvider, sessionSeconds: config.seconds,
      }),
    });
    try {
      await attachHostAgent({ roomName, rooms, dispatch, agentName: config.agentName });
      const ttl = endsAt === null ? 300 : Math.min(300, endsAt - Math.floor(now() / 1000));
      if (ttl <= 0) throw new Error("Session expired while preparing its host");
      const token = new AccessToken(key, secret, { identity: guestIdentity, name: "Website guest", ttl });
      token.addGrant({
        roomJoin: true, room: roomName, canPublish: true,
        canPublishSources: [TrackSource.MICROPHONE], canPublishData: true, canSubscribe: true,
      });
      return { roomName, token: await token.toJwt() };
    } catch (error) {
      await deleteRoom(roomName).catch(() => {});
      throw error;
    }
  }
  async function sweep() {
    const expired = [];
    const liveRooms = new Set();
    const failures = [];
    for (const room of await rooms.listRooms()) {
      let meta;
      try { meta = JSON.parse(room.metadata || "{}"); } catch { continue; }
      if (meta?.product !== "archava-template" || meta.projectId !== config.projectId) continue;
      liveRooms.add(room.name);
      if (Number.isFinite(meta.endsAt) && meta.endsAt <= Math.floor(now() / 1000)) expired.push(room.name);
      // Open-ended calls remain live while their exact guest is present. Give
      // newly allocated rooms a minute to join, including after an API restart.
      else if (meta.endsAt === null && meta.sessionSeconds === 0 && typeof meta.guestIdentity === "string"
        && Number(room.creationTime) > 0 && Number(room.creationTime) + 60 <= Math.floor(now() / 1000)) {
        try {
          const participants = await rooms.listParticipants(room.name);
          if (!participants.some(participant => participant.identity === meta.guestIdentity)) expired.push(room.name);
        } catch (error) {
          if (isMissingRoom(error)) liveRooms.delete(room.name);
          else failures.push(error);
        }
      }
    }
    const results = await Promise.allSettled(expired.map(deleteRoom));
    failures.push(...results.filter((result) => result.status === "rejected").map((result) => result.reason));
    if (failures.length) throw new AggregateError(failures, "Some expired rooms could not close; retry next sweep");
    for (const name of expired) liveRooms.delete(name);
    return liveRooms;
  }
  return { open, deleteRoom, sweep };
}

function isMissingRoom(error) {
  return Boolean(error) && (error.status === 404 || error.code === "not_found");
}

/**
 * Hands a freshly opened room to the named host agent.
 *
 * An agent the operator set to join every room is not ours to manage, so the
 * automatic ones are deleted rather than removed afterwards; anything that is
 * already in the room as one of them is then evicted. A room that cannot get
 * its host is not usable, so the caller rolls it back.
 */
export async function attachHostAgent({ roomName, rooms, dispatch, agentName }) {
  if (typeof agentName !== "string" || !agentName.trim()) {
    throw new Error("ARCHAVA_AGENT_NAME must name the host agent");
  }
  const automaticDispatches = (await dispatch.listDispatch(roomName))
    .filter((dispatchRecord) => !dispatchRecord.agentName);
  for (const automatic of automaticDispatches) {
    await dispatch.deleteDispatch(automatic.id, roomName);
  }
  await dispatch.createDispatch(roomName, agentName);

  await removeAutomaticAgents(roomName, rooms, automaticDispatches);
}

/** A deleted dispatch can still have a job that joins later. Remove that exact
 * agent when it appears, without refusing a room when the cancelled job never
 * joins at all. The extra room slot keeps the guest able to connect meanwhile. */
export async function removeAutomaticAgents(roomName, rooms, dispatches, options = {}) {
  const identities = new Set(dispatches.flatMap((record) =>
    (record.state?.jobs || []).map((job) => `agent-${job.id}`)));
  if (!identities.size) return;

  const pauseMs = options.pauseMs ?? AGENT_EVICT_PAUSE_MS;
  const gracePolls = options.gracePolls ?? AGENT_EVICT_GRACE_POLLS;
  const latePolls = options.latePolls ?? AGENT_EVICT_LATE_POLLS;
  const pause = () => new Promise((resolve) => setTimeout(resolve, pauseMs));
  const removeJoined = async () => {
    const participants = await rooms.listParticipants(roomName);
    for (const participant of participants) {
      if (!identities.has(participant.identity)) continue;
      await rooms.removeParticipant(roomName, participant.identity);
      identities.delete(participant.identity);
    }
  };

  for (let attempt = 0; attempt < gracePolls && identities.size; attempt += 1) {
    await removeJoined();
    if (identities.size) await pause();
  }
  if (!identities.size) return;

  void (async () => {
    for (let attempt = 0; attempt < latePolls && identities.size; attempt += 1) {
      await removeJoined();
      if (identities.size) await pause();
    }
  })().catch((error) => {
    if (!isMissingRoom(error)) console.error("Late automatic-agent cleanup failed:", error);
  });
}
