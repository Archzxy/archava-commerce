// Cloud Run supervisor: one storefront, private API and named LiveKit worker.
// Credentials arrive through a Secret Manager file, never through the image.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const archava = resolve(root, 'archava');
const secretsPath = process.env.DOPAMINE_RUNTIME_ENV || '/run/secrets/ava.env';
const runtime = { ...parseEnv(readFileSync(secretsPath, 'utf8')), ...process.env };
if (!runtime.WEB_ORIGIN || !runtime.PROJECT_ID) throw new Error('WEB_ORIGIN and PROJECT_ID are required');
const apiPort = runtime.ARCHAVA_API_PORT || '5180';
if (apiPort === (runtime.PORT || '8080')) throw new Error('The private API needs a separate port');
const python = runtime.PYTHON_EXECUTABLE || (existsSync(resolve(archava, '.venv/bin/python'))
  ? resolve(archava, '.venv/bin/python') : 'python3');
const secretValues = Object.entries(runtime)
  .filter(([name, value]) => /KEY|SECRET|TOKEN|PASSWORD|SMTP_PASS/.test(name) && value.length > 5)
  .map(([, value]) => value);
const redact = text => secretValues.reduce((value, secret) => value.replaceAll(secret, '[redacted]'), text)
  .replace(/([?&](?:key|token|access_token)=)[^\s&"']+/gi, '$1[redacted]');
const children = new Set();
let stopping = false;
let workerReady = false;
let api;
let apiSwitch = Promise.resolve();

function signal(child, name) {
  if (!child.pid) return;
  try { process.kill(process.platform === 'win32' ? child.pid : -child.pid, name); }
  catch (error) { if (error.code !== 'ESRCH') throw error; }
}

function stop(code) {
  if (stopping) return;
  stopping = true;
  clearTimeout(registrationDeadline);
  for (const child of children) signal(child, 'SIGTERM');
  const force = setTimeout(() => {
    for (const child of children) signal(child, 'SIGKILL');
    process.exit(code);
  }, 8_000);
  Promise.all([...children].map(child => new Promise(done => {
    if (child.exitCode !== null || child.signalCode !== null) done();
    else child.once('exit', done);
  }))).then(() => { clearTimeout(force); process.exit(code); });
}

function start(name, command, args, env, cwd = archava) {
  const child = spawn(command, args, { cwd, env, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  children.add(child);
  let pending = '';
  const capture = chunk => {
    pending += chunk.toString();
    const lines = pending.split('\n');
    pending = lines.pop();
    for (const line of lines) {
      process.stdout.write(`[${name}] ${redact(line)}\n`);
      if (name === 'worker' && /registered worker/.test(line) && !workerReady && !stopping) {
        workerReady = true;
        clearTimeout(registrationDeadline);
        console.log('[cloud] named worker registered');
        if (runtime.ENABLE_SESSIONS === 'true') switchAPI(true);
      }
    }
    if (pending.length > 64_000) pending = pending.slice(-64_000);
  };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  child.once('error', () => { console.error(`[cloud] ${name} failed to start`); stop(1); });
  child.once('exit', () => {
    children.delete(child);
    if (pending) process.stdout.write(`[${name}] ${redact(pending)}\n`);
    if (!stopping && !child.expectedExit) {
      console.error(`[cloud] ${name} exited; restarting the complete instance`);
      stop(1);
    }
  });
  return child;
}

function switchAPI(enabled) {
  apiSwitch = apiSwitch.then(async () => {
    if (stopping) return;
    if (api && api.exitCode === null && api.signalCode === null) {
      api.expectedExit = true;
      await new Promise(done => { api.once('exit', done); signal(api, 'SIGTERM'); });
    }
    if (stopping) return;
    api = start('api', process.execPath, ['server/index.mjs'], {
      ...runtime, PORT: apiPort, ENABLE_SESSIONS: String(enabled),
    });
    console.log(`[cloud] sessions ${enabled ? 'enabled after registration' : 'disabled while preparing'}`);
  }).catch(() => { console.error('[cloud] API transition failed'); stop(1); });
  return apiSwitch;
}

const registrationDeadline = setTimeout(() => {
  console.error('[cloud] worker registration deadline exceeded');
  stop(1);
}, 90_000);
process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));
start('web', process.execPath, ['server.mjs'], {
  ...runtime, PORT: runtime.PORT || '8080', HOST: runtime.HOST || '0.0.0.0', ARCHAVA_API_PORT: apiPort,
}, root);
await switchAPI(false);
start('worker', python, ['backend/agent.py', 'start'], runtime);
