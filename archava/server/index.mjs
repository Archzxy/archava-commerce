import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { AgentDispatchClient, RoomServiceClient } from "livekit-server-sdk";
import { runtimeConfig } from "./config.mjs";
import { createRoomProvider } from "./livekit-rooms.mjs";
import { createSessions } from "./sessions.mjs";
import { createApp } from "./app.mjs";
import { checkoutSigningKey, createCheckout, midtransSandbox } from './checkout.mjs';
import { configuredReceiptMail } from './receipt-mail.mjs';

const root = fileURLToPath(new URL("../", import.meta.url));
if (existsSync(resolve(root, ".env"))) process.loadEnvFile(resolve(root, ".env"));
const config = runtimeConfig();
const livekitHttp = (process.env.LIVEKIT_URL || "").replace(/^wss:/, "https:").replace(/^ws:/, "http:");
const rooms = config.livekitConfigured ? createRoomProvider({
  rooms: new RoomServiceClient(livekitHttp, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET),
  dispatch: new AgentDispatchClient(livekitHttp, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET),
  key: process.env.LIVEKIT_API_KEY, secret: process.env.LIVEKIT_API_SECRET,
  config,
}) : null;
const sessions = createSessions({ rooms, config });
const signingKey = checkoutSigningKey(process.env);
const mail = configuredReceiptMail(process.env, signingKey, draft => checkout.paymentStatus(draft));
const checkout = createCheckout({ projectId: config.projectId, signingKey, provider: midtransSandbox(process.env.MIDTRANS_SERVER_KEY), mail });
mail.start();
const app = createApp({ config, sessions, checkout, distDir: resolve(root, "dist") });
const server = createServer(app.handle);
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
let sweeping = false;
const sweep = async () => {
  if (sweeping) return;
  sweeping = true;
  try { app.pruneRateBuckets(); await sessions.sweep(); }
  catch { console.error("[archava] room lifecycle sweep failed; retrying on next tick"); }
  finally { sweeping = false; }
};
await sweep();
server.listen(config.port, "0.0.0.0", () => console.log(`[archava] API :${config.port}; project=${config.projectId}; agent=${config.agentName}`));
const timer = setInterval(sweep, 10_000).unref();
let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  clearInterval(timer);
  const forceExit = setTimeout(() => process.exit(1), 10_000).unref();
  server.close();
  await mail.close();
  await sessions.shutdown();
  clearTimeout(forceExit);
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
