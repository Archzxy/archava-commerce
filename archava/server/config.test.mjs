import assert from "node:assert/strict";
import test from "node:test";
import { project, runtimeConfig } from "./config.mjs";
import { checkProject } from "../scripts/check-config.mjs";

test("a blank template boots offline without provider secrets or old domains", () => {
  const config = runtimeConfig({});
  assert.equal(config.enabled, false);
  assert.equal(config.providerConfigured, false);
  assert.deepEqual(config.origins, ["http://localhost:5174"]);
  assert.equal(config.agentName, `${project.projectId}-host`);
  assert.equal(config.seconds, 0);
  assert.equal(checkProject(), true);
});

test("bad deployment values fail early and do not silently change a safety limit", () => {
  for (const env of [
    { SESSION_SECONDS: "NaN" }, { MAX_ACTIVE_SESSIONS: "0" }, { SESSION_SECONDS: "10" },
    { SESSION_SECONDS: "-1" }, { SESSION_SECONDS: "1801" }, { SESSION_SECONDS: "0.5" },
    { WEB_ORIGIN: "https://site.test/" }, { PROJECT_ID: "../another" },
    { AVATAR_PROVIDER: "unknown" }, { LIVEKIT_URL: "https://room.test" },
  ]) assert.throws(() => runtimeConfig(env));
});

test("session duration accepts completion mode and optional bounded deadlines", () => {
  assert.equal(runtimeConfig({ SESSION_SECONDS: "0" }).seconds, 0);
  for (const seconds of [30, 120, 1800]) assert.equal(runtimeConfig({ SESSION_SECONDS: String(seconds) }).seconds, seconds);
});

test("voice readiness requires LiveKit and Gemini, and dispatch defaults to its own project", () => {
  const config = runtimeConfig({ AVATAR_PROVIDER: "voice", PROJECT_ID: "hotel-demo-prod", LIVEKIT_URL: "wss://test.livekit.cloud", LIVEKIT_API_KEY: "key", LIVEKIT_API_SECRET: "secret", GEMINI_API_KEY: "key" });
  assert.equal(config.providerConfigured, true);
  assert.equal(config.agentName, "hotel-demo-prod-host");
  assert.deepEqual(Object.keys(config.publicFields).sort(), ["avatarProvider", "serverUrl"]);
});
