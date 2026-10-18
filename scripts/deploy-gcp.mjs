// Explicit phases only. Uses the existing authenticated gcloud account; never upgrades billing.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const phase = process.argv[2];
if (!['prepare', 'publish'].includes(phase)) throw new Error('Usage: node scripts/deploy-gcp.mjs prepare|publish');
const project = process.env.DOPAMINE_GCP_PROJECT || 'dopamine-commerce-archzxy';
const region = 'asia-southeast1';
const service = 'dopamine';
const runtimeAccount = `dopamine-runtime@${project}.iam.gserviceaccount.com`;
const buildAccount = `dopamine-build@${project}.iam.gserviceaccount.com`;
const output = resolve(root, '.logs/deploy-gcp');
mkdirSync(output, { recursive: true, mode: 0o700 });

function gcloud(args, { input, allowFailure = false } = {}) {
  const result = spawnSync('gcloud', [...args, '--quiet', '--format=json'], {
    cwd: root, encoding: 'utf8', input, maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: '1' },
  });
  if (result.status !== 0) {
    if (allowFailure) return null;
    throw new Error(`gcloud ${args.slice(0, 3).join(' ')} failed: ${result.stderr.slice(-4000)}`);
  }
  if (result.stderr) process.stderr.write(result.stderr);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}
const scoped = args => gcloud([...args, `--project=${project}`]);
const save = (name, data) => writeFileSync(resolve(output, name), JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
async function bindNewAccount(args) {
  // IAM may not see a newly created service account immediately.
  for (let attempt = 0; ; attempt++) {
    try { return scoped(args); }
    catch (error) {
      if (attempt === 5 || !/Service account .* does not exist/.test(error.message)) throw error;
      console.log('[deploy] waiting for new service-account visibility in IAM');
      await new Promise(done => setTimeout(done, 1000 * 2 ** attempt));
    }
  }
}

if (phase === 'prepare') {
  const accounts = gcloud(['billing', 'accounts', 'list']).filter(account => account.open);
  if (accounts.length !== 1) throw new Error('Select an unambiguous open billing account before provisioning');
  const billing = accounts[0].name.split('/').pop();
  let info = gcloud(['projects', 'describe', project], { allowFailure: true });
  if (!info) {
    console.log(`[deploy] creating dedicated project ${project}`);
    info = gcloud(['projects', 'create', project, '--name=DOPAMINE Commerce']);
  }
  scoped(['billing', 'projects', 'link', project, `--billing-account=${billing}`]);
  console.log('[deploy] enabling build, runtime, secrets and budget APIs');
  scoped(['services', 'enable', 'run.googleapis.com', 'cloudbuild.googleapis.com',
    'artifactregistry.googleapis.com', 'secretmanager.googleapis.com', 'iam.googleapis.com',
    'cloudbilling.googleapis.com', 'billingbudgets.googleapis.com']);
  for (const [id, name] of [['dopamine-runtime', 'DOPAMINE runtime'], ['dopamine-build', 'DOPAMINE builds']]) {
    const email = `${id}@${project}.iam.gserviceaccount.com`;
    if (!gcloud(['iam', 'service-accounts', 'describe', email, `--project=${project}`], { allowFailure: true })) {
      scoped(['iam', 'service-accounts', 'create', id, `--display-name=${name}`]);
    }
  }
  await bindNewAccount(['projects', 'add-iam-policy-binding', project, `--member=serviceAccount:${buildAccount}`, '--role=roles/run.builder', '--condition=None']);
  const budgets = gcloud(['billing', 'budgets', 'list', `--billing-account=${billing}`, `--billing-project=${project}`]);
  if (!budgets.some(budget => budget.displayName === 'DOPAMINE monthly usage before credits')) {
    scoped(['billing', 'budgets', 'create', `--billing-account=${billing}`, `--billing-project=${project}`,
      '--display-name=DOPAMINE monthly usage before credits', '--budget-amount=500000IDR',
      `--filter-projects=projects/${project}`, '--credit-types-treatment=exclude-all-credits',
      '--threshold-rule=percent=0.5', '--threshold-rule=percent=0.9', '--threshold-rule=percent=1.0']);
  }
  info = scoped(['projects', 'describe', project]);
  save('project.json', { project, number: info.projectNumber, region, service, runtimeAccount, buildAccount });
  console.log(`[deploy] project prepared; budget alerts configured (not a spending cap)`);
  process.exit();
}

const billing = scoped(['billing', 'projects', 'describe', project]);
if (!billing.billingEnabled) throw new Error('Project billing is not enabled');
const existing = gcloud(['run', 'services', 'describe', service, `--region=${region}`, `--project=${project}`], { allowFailure: true });
if (existing) throw new Error('A service already exists. Review its current revision and use the documented update/rollback flow.');
const local = parseEnv(readFileSync(resolve(root, 'archava/.env'), 'utf8'));
const names = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'GEMINI_API_KEY',
  'GEMINI_MODEL', 'GEMINI_VOICE', 'AVATAR_PROVIDER', 'SPATIUS_API_KEY', 'SPATIUS_APP_ID', 'SPATIUS_AVATAR_ID',
  'MIDTRANS_SERVER_KEY', 'CHECKOUT_SIGNING_KEY', 'CHECKOUT_EMAIL_ENABLED', 'CHECKOUT_EMAIL_BUCKET',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'SMTP_USE_SSL'];
for (const name of ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET', 'GEMINI_API_KEY',
  'SPATIUS_API_KEY', 'SPATIUS_APP_ID', 'SPATIUS_AVATAR_ID']) {
  if (!local[name] || /^your[-_]/i.test(local[name])) throw new Error(`Runtime ${name} is not configured`);
}
const secretName = 'ava-runtime-env';
if (!gcloud(['secrets', 'describe', secretName, `--project=${project}`], { allowFailure: true })) {
  scoped(['secrets', 'create', secretName, '--replication-policy=automatic']);
}
const secretContent = names.filter(name => local[name]).map(name => `${name}=${JSON.stringify(local[name])}`).join('\n') + '\n';
const version = gcloud(['secrets', 'versions', 'add', secretName, '--data-file=-', `--project=${project}`], { input: secretContent });
const secretVersion = version.name.split('/').pop();
scoped(['secrets', 'add-iam-policy-binding', secretName, `--member=serviceAccount:${runtimeAccount}`, '--role=roles/secretmanager.secretAccessor']);
const env = {
  DOPAMINE_RUNTIME_ENV: '/run/secrets/ava.env', ARCHAVA_API_PORT: '5180',
  PROJECT_ID: 'dopamine-commerce-prod', WEB_ORIGIN: 'https://deployment-pending.invalid',
  ENABLE_SESSIONS: 'false', SESSION_SECONDS: '0', MAX_ACTIVE_SESSIONS: '3',
  SESSION_STARTS_PER_MINUTE: '3', TRUST_PROXY: 'false',
};
save('env.public.json', env);
console.log('[deploy] building complete storefront and assistant image; credentials are runtime-only');
scoped(['run', 'deploy', service, '--source=.', `--region=${region}`,
  `--service-account=${runtimeAccount}`, `--build-service-account=projects/${project}/serviceAccounts/${buildAccount}`,
  `--set-secrets=/run/secrets/ava.env=${secretName}:${secretVersion}`, `--env-vars-file=${resolve(output, 'env.public.json')}`,
  '--allow-unauthenticated', '--ingress=all', '--execution-environment=gen2', '--port=8080',
  '--cpu=1', '--memory=2Gi', '--min=1', '--max=1', '--concurrency=20', '--timeout=60s',
  '--no-cpu-throttling', '--no-cpu-boost',
  '--startup-probe=httpGet.path=/healthz,httpGet.port=8080,periodSeconds=5,timeoutSeconds=2,failureThreshold=24',
  '--liveness-probe=httpGet.path=/healthz,httpGet.port=8080,periodSeconds=30,timeoutSeconds=2,failureThreshold=3']);
const deployed = scoped(['run', 'services', 'describe', service, `--region=${region}`]);
const serviceUrls = [...new Set([
  ...JSON.parse(deployed.metadata.annotations['run.googleapis.com/urls'] || '[]'),
  deployed.status.url,
].map(value => new URL(value).origin))];
const url = serviceUrls[0];
env.WEB_ORIGIN = serviceUrls.join(',');
env.ENABLE_SESSIONS = 'true';
save('env.public.json', env);
console.log('[deploy] setting the verified public origin and enabling worker-gated sessions');
scoped(['run', 'services', 'update', service, `--region=${region}`, `--env-vars-file=${resolve(output, 'env.public.json')}`]);
const final = scoped(['run', 'services', 'describe', service, `--region=${region}`]);
save('deployment.json', { project, region, service, url, serviceUrls, revision: final.status.latestReadyRevisionName, secretVersion, deployedAt: new Date().toISOString() });
console.log(`[deploy] live URL: ${url}`);
