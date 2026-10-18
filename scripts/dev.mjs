import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, openSync, writeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const archava = resolve(root, 'archava');
const python = resolve(archava, '.venv/bin/python');
const logs = resolve(root, '.logs');
mkdirSync(logs, { recursive: true, mode: 0o700 });
if (!existsSync(python) || !existsSync(resolve(archava, '.env'))) throw new Error('Siapkan archava/.env dan archava/.venv dulu; lihat README.');
const runtime = { ...process.env, ...parseEnv((await import('node:fs')).readFileSync(resolve(archava, '.env'), 'utf8')) };
const secrets = Object.entries(runtime).filter(([key, value]) => /KEY|SECRET|TOKEN|PASSWORD/.test(key) && value.length > 5).map(([, value]) => value);
const children = new Set();
let stopping = false;
let api;
let enabled = false;
const redact = text => secrets.reduce((value, secret) => value.replaceAll(secret, '[redacted]'), text).replace(/([?&](?:key|access_token|token)=)[^\s&"']+/gi, '$1[redacted]');

function start(name, command, args, options = {}) {
  const log = openSync(resolve(logs, `${name}.log`), 'w', 0o600);
  const child = spawn(command, args, { cwd: archava, env: process.env, stdio: ['ignore', 'pipe', 'pipe'], ...options });
  children.add(child);
  const capture = chunk => { const text = redact(chunk.toString()); writeSync(log, text); if (name === 'worker' && /registered worker/.test(text) && !enabled && !stopping) { enabled = true; void switchAPI(runtime.ENABLE_SESSIONS === 'true'); } };
  child.stdout.on('data', capture); child.stderr.on('data', capture);
  child.on('error', () => console.error(`[${name}] Tidak berhasil dijalankan; lihat .logs/${name}.log.`));
  child.on('exit', code => { children.delete(child); if (!stopping && code) console.error(`[${name}] Berhenti (${code}); lihat .logs/${name}.log.`); if (name === 'worker' && !stopping) { enabled = false; void switchAPI(false); } });
  return child;
}

async function switchAPI(ready) {
  if (api && api.exitCode === null) { const previous = api; await new Promise(resolveExit => { previous.once('exit', resolveExit); previous.kill('SIGTERM'); }); }
  if (stopping) return;
  api = start('api', process.execPath, ['server/index.mjs'], { env: { ...runtime, ENABLE_SESSIONS: String(ready) } });
  console.log(ready ? 'Archava siap: worker terhubung, sesi avatar bisa dimulai.' : 'Archava API aktif; menunggu worker.');
}

start('web', process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, ARCHAVA_API_PORT: runtime.PORT || '5180' } });
await switchAPI(false);
start('worker', python, ['backend/agent.py', 'dev'], { env: runtime });
console.log(`DOPAMINE + Archava: http://localhost:${process.env.PORT || 5173}`);
function shutdown() { if (stopping) return; stopping = true; for (const child of children) child.kill('SIGTERM'); setTimeout(() => { for (const child of children) child.kill('SIGKILL'); process.exit(); }, 10_000).unref(); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
