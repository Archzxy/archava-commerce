# DOPAMINE Cloud Run deployment

Initially deployed October 18, 2026, approximately 09:10 Asia/Jakarta; updated
later through the explicitly authorized rollouts below, most recently the
October 19 Asia/Jakarta session-completion rollout.
The user requested handling the remaining GCP setup after billing activation.
No billing account upgrade, GitHub push/visibility change or competition
submission was performed.

## Live deployment

| Item | Verified value |
| --- | --- |
| Public prototype | [DOPAMINE](https://dopamine-656573292283.asia-southeast1.run.app) |
| GCP project | `dopamine-commerce-archzxy` / `656573292283`; billing enabled |
| Region / service | `asia-southeast1` / `dopamine` |
| Ready revision | `dopamine-completion-20261019`, serving 100% of traffic |
| Cloud Build | `93eea172-0169-4885-bb78-3a931a415ad0`, succeeded |
| Image digest | `sha256:a37f1d13f876e9a9f51495cf07722b4b20f0d119a0536314589a2ea660386483` |
| Runtime model / secret | `gemini-3.8-live` / mounted `ava-runtime-env` version 4 |
| Resources | 1 vCPU, 2 GiB, minimum 1 / maximum 1 instance, concurrency 20 |
| Worker namespace / named agent | `dopamine-commerce-prod` / `dopamine-commerce-prod-host` |
| Session limits | No fixed call deadline (`SESSION_SECONDS=0`), 3 active sessions, 3 starts/minute |
| Native Gemini silence duration | `GEMINI_SILENCE_DURATION_MS=300`; milliseconds of silence detection, not overall response latency |

October 19 session change is **deployed** after the user's explicit approval.
The build uses a fixed source snapshot with private runtime files and unrelated
video work excluded. The only environment change is `SESSION_SECONDS:120→0`;
the image adds the tested completion/farewell lifecycle. Readback verifies
identical secret volumes/mounts/version 4, model, origins, resources, service
account, concurrency, timeout, probes and scaling. Zero production/other rooms
preceded and followed rollout. Both public origins return HTTP 200 for `/`,
`/checkout`, `/api/health` and `/api/config`; config reports duration 0 with
sessions enabled and provider configured. No voice session was started: actual
long voice calls and model-driven farewell remain unverified. Evidence is
`.logs/session-rollout-20261019/`; see
[session lifecycle](../archava/docs/SESSION_LIFECYCLE.md).

The immediate rollback is `dopamine-email-20261019`, with secret 4 and the old
120-second setting. Check active calls before changing revision traffic; rollback
selects both that revision's image and its environment.

October 19 Asia/Jakarta / October 18 UTC receipt-email activation: the user
approved one dedicated private GCS bucket and the existing-service rollout,
then selected a recipient for one actual email test. Bucket
`dopamine-commerce-archzxy-checkout-mail` is regional, public access prevented,
uniform access enabled, soft delete disabled and live-object lifecycle expiry
seven days after generation creation. Runtime `roles/storage.objectUser` is
scoped to this bucket; no account key was created. Secret version 4 merges only
the email configuration and preserves all prior values. Readback verifies
unchanged public env, model, resources, account, probes, timeout, concurrency,
scaling and active secret mount path. Unused old secret volumes were ignored:
the mounted version is selected through container.volumeMounts, never the first
same-named secret volume. Previous revision/secret 3 remain for rollback.

Actual public browser UI/API, recipient confirmation, Midtrans sandbox QR image,
official simulator settlement, encrypted runtime GCS outbox, SMTP `accepted` and
same-order accepted status after reload passed. The user confirmed the test
arrived in Gmail **Spam**; Inbox placement is not verified. SPF and the documented
DKIM selector exist; no DMARC record was found, and DNS was not changed. Zero
voice session requests or real funds were used. Final production/other room
counts are 0/0; no ERROR-level logs were observed in the bounded new-revision
query. Browsers and temporary fixtures closed. Evidence is under
`.logs/checkout-email-20261018/cloud/`; see
[email behavior, limits and deliverability](../archava/docs/CHECKOUT_EMAIL.md).

Final email follow-up: a second image removes stale inactive-email knowledge
and makes receipt v2 consistent during a later payment-provider outage, without
altering the accepted mail record or resending it. That follow-up used revision
`dopamine-email-20261019`, build `ce4b9966-0649-48d7-b245-98de651def19`;
the first email image remains historical. Actual persisted
paid/accepted status and unchanged object generation passed after this rollout.

October 18 coordinated service upgrade: the user authorized deployment and bounded
provider testing. Secret version 3 changes only the model; readback verifies the
same public env, origin, resources, probes, service account, session limits and
scaling settings. The first build failed because npm 10 rejected an npm 12
lockfile; Docker/CI now pin Node 22.23.3 + npm 12.2.0, verified by an actual clean
Node 22 install/build. The second build succeeded. A direct real Gemini 3.8
preflight returned native audio 536 ms after text submission (one sample, not
human voice E2E). Browser/provider test results are recorded in the current
handoff and `.logs/service-rollout-20261018/`. No active production room preceded
the rollout. Three real browser sessions reached the new worker. Typed filter
and checkout preview passed; worker receipts were `applied` (472 ms) and
`review_ready` (585 ms). The avatar canvas, closed chat and cart were preserved.
Synthetic voice input/remote audio were observed but the voice filter was not
verified; no human E2E or latency A/B was completed. Two later QA sessions used
an unchanged public template from a local test cache, not a production asset fix.
All three calls ended with HTTP 200 and final room counts 0/0; no QR/payment
was initiated on this revision. The complete previous revision `dopamine-midtrans-20261018` with
secret version 2 remains available for rollback; changing only the model does
not roll back packages. No GitHub push or billing upgrade occurred.

Earlier October 18 Midtrans activation: runtime secret version 2 adds only the privately
saved sandbox Server Key; previous runtime values and all service limits remain
unchanged. Actual deployed UI/API/provider/simulator verification passed:
`preview → pending → paid`, actual QR image loaded, same order ID, cart preserved,
and no real funds/order/fulfillment. A real avatar session opened the preview via
typed input; separate live attempts saw intermittent RTC closures. Full spoken
checkout/success announcement is not established. Detailed evidence is under
`.logs/midtrans-activation-20261018/`; see the current handoff for retained failed
harness attempts and call-reliability limits. The prior working revision is
`dopamine-checkout-20261018`, which mounts secret version 1 and has no Midtrans key.

Earlier October 18 checkout rollout: source adds the optional Midtrans sandbox checkout
card and three tools; the user has no account/key yet. Public `/`, `/checkout`,
`/api/health` and `/api/config` returned 200. Readback confirmed identical env,
resources, volumes/secrets, service account and template annotations to the VAD
revision. One actual headed Brave avatar/Gemini session with typed checkout input
opened a server-priced **unavailable** summary; no QR or Midtrans payment was
created. Chat was closed, the avatar canvas was preserved, and the controls
remained visible. Explicit Disconnect returned 200; browser closed and final
production-room count was zero. This is not human voice checkout or actual
Midtrans verification. See [activation guide](CHECKOUT_SANDBOX.md).

Evidence: `.logs/checkout-rollout-20261018/` (readback, build, HTTP, offline
verification, cloud QA and cleanup); `.logs/checkout-browser/` (synthetic provider
at 1440/390/320 px). Source includes the earlier uncommitted DOPAMINE changes;
there was no GitHub push or billing upgrade. If this checkout release needs
rollback, the immediately preceding working revision is
`dopamine-vad300-20261018`; route 100% traffic to that revision after checking
active calls. The older original-deployment rollback below remains historical.

The platform also exposes
`https://dopamine-m3flq3q5pq-as.a.run.app`. Both exact HTTPS origins are allowed
by the API. Cloud Run's displayed project-number URL differs from `status.url`;
the deployment script reads the platform URL annotation and configures both.

## Runtime and security

The October 18 [service upgrade](../archava/docs/SERVICE_UPGRADE.md) is deployed,
including Gemini 3.8 and the Python dependency constraints. Existing mounted
`GEMINI_MODEL` values still win over source defaults in other environments. Both Dockerfiles now
copy `requirements.txt` and `constraints.txt` before installing the Python stack.

The root Dockerfile packages the complete Node storefront, private Node session
API, built React widget and Python LiveKit worker. The existing standalone
`archava/Dockerfile` remains for that module only. `scripts/start-cloud.mjs`
supervises all three processes, enables sessions only after worker registration,
and restarts the entire instance on an unexpected child exit. `/healthz` is the
internal startup/liveness probe; `/api/health` is the public monitoring endpoint.

Deployment uses instance-based CPU billing. The continuously registered LiveKit worker
needs CPU outside HTTP requests; ordinary request-only CPU with scale-to-zero is
not a reliable worker topology. This uses trial credit while running, including
idle time; it is not a claim of permanent zero-cost hosting. The resource limit
does not replace billing monitoring or guarantee a strict spending cap.

Runtime namespace `dopamine-commerce-prod` intentionally separates cloud rooms
and named dispatch from the local dev worker. Product IDs, storage keys, protocol
topics and module config IDs remain compatible. Credentials are mounted from
Secret Manager and parsed only at runtime. Neither build context nor image
contains a private `.env`. Public browser configuration and short session tokens
retain their existing interfaces. Exact WEB_ORIGIN values are set to the actual
service URLs after the initial session-disabled deployment.

- Runtime service account: `dopamine-runtime`, with Secret Accessor granted only
  on `ava-runtime-env`; the deployed mount now pins secret version 4. Versions 1,
  2 and 3 remain available to their earlier revisions for rollback. Secrets are
  transferred via stdin to Secret Manager and never printed or baked into layers.
- Build service account: `dopamine-build`, project-level `roles/run.builder`.
  No downloadable service-account keys were created.
- `.gcloudignore` / `.dockerignore` exclude private environment, dependencies,
  virtualenv, logs, Git, exports and browser evidence. The final Dockerfile copies
  only the needed runtime sources/assets. Source-upload exclusion was checked.
- The private API listens on 5180; the storefront is the sole ingress on 8080.
  It binds `0.0.0.0` in the container, retaining localhost by default locally.
- `TRUST_PROXY=false` deliberately keeps the conservative shared start-rate
  bucket rather than trusting an attacker-controlled forwarded address.
- Session ownership is in memory. Do not scale this deployment beyond one
  instance without shared ownership/rate-limit state. Restarts can interrupt calls;
  scoped sweeping recovers abandoned rooms; fixed expiry is optional.

## October 18 native-VAD rollout

The user explicitly asked to apply the prepared tuning to the cloud. Deployment
used the existing source build and `--update-env-vars=GEMINI_SILENCE_DURATION_MS=300`;
it retained the model, voice, credentials, namespace, resource limits and working
first-render avatar lifecycle. An initial read found zero production rooms before
deployment. Snapshot/readback artifacts are in `.logs/latency-rollout-20261018/`;
private operational service descriptions stay ignored. `rollout-readback.json`
confirms the ready revision, 100% routing, only the intended environment-key
change, unchanged resources/secret mounts, enabled sessions and public HTTP 200.

Two bounded headed Brave provider sessions used an isolated task profile. A
public synthetic audio fixture was recognized and a reply was generated; the
avatar screenshot was visually inspected. This is not a human Indonesian
microphone/acoustic or comparative performance test. A focused typed filter
request returned worker `outcome: applied` in 1455 ms; the actual browser reached
`/kategori/elektronik?q=headphone&max=500000`. A separate HTTP read verified its
two products (`headphones`, `ritme-lite`) remain within the requested budget.
Final Disconnect returned 200 and restored the launcher. Both task browser
sessions were closed, and the final production-room count was zero.

The first combined voice/shopping harness did not complete its requested filter;
the model applied needs and recommendations instead. The follow-up harness also
reported failure because its assertion allowed only `/produk` and rejected the
valid category route. These original failed reports remain in
`output/playwright/dopamine-vad300-20261018/`. Its future route check was corrected,
but no third provider call was made merely to change the report to green.
`verified-rollout.json` records the actual route/receipt evidence and its limits.
The first session ended before the final disconnect observer attached; its
earlier `/api/session/end` returned 200 in Cloud Logging. Do not present the
original harnesses as clean passes or infer a proven cause for its RTC errors.

New source was validated in the preceding tuning turn (75 Node / 29 Python /
14 offline SDK cases and build); those passing checks were reused here. The
current rollout did not start a local product server or rerun those suites.
Live logs on the new revision prove the candidate reaches real provider sessions.
Five post-rollout audio-frame→playback RPC intervals were 954–1342 ms. No reliable
microphone-end→audible-output comparison was captured, so this is an active
tuning candidate, not a proven percentage improvement or a 300 ms total response.

## Cost controls

Billing remains on the user's trial account; the activation screenshot showed
IDR 5,393,250 credit and 88 days remaining, ending January 15, 2027. That is an
earlier account snapshot, not a fresh post-deployment balance measurement.

A project-scoped **IDR 500,000 monthly usage budget** is configured with
50/90/100% alerts and `EXCLUDE_ALL_CREDITS`, so trial credits do not hide resource
consumption. This budget is a notification threshold, not another deposit or a
hard spending cap. The continuously running instance consumes credit even with
the page closed. Build/storage/network usage is additional. Provider quotas and
credit for LiveKit, Gemini API and Spatius are separate and were not changed.

**Cost estimate checked October 18, 2026:** Singapore is a Tier 2 region. The
[official Cloud Run pricing page](https://cloud.google.com/run/pricing), including
its embedded Singapore instance-based table, lists USD 0.0000216/vCPU-second and
USD 0.0000024/GiB-second. For the current continuously allocated 1 vCPU / 2 GiB,
`86,400 × (0.0000216 + 2 × 0.0000024)` is **USD 2.28096/day**, or
**USD 68.4288 per 30 days**, before free-tier discounts and other charges.
If this billing account has its complete monthly Cloud Run free allowance
available, the Tier 1 spending discount is USD 5.22/month, leaving approximately
**USD 63.21 per 30 days** for this baseline compute allocation. Free allowance is
shared across the billing account; it is not USD 300 promotional credit.
An unchanged 88-day baseline is approximately USD 200.72 before free-tier
discounts, excluding builds, stored images, network, logging and separate AI/media
providers. These are list-price estimates, not measured costs, a fresh credit
balance or a guarantee. IDR accounts use Google's IDR SKU prices. No resource,
billing or availability settings were changed for this cost explanation.

Do not upgrade billing or close/refund the billing account as an incidental
maintenance step. Account closure can stop the public prototype. Recheck actual
costs/credit and judging uptime needs before any later shutdown decision.

## Evidence and limits

Evidence is local/ignored, under `.logs/deploy-gcp/` and
`output/playwright/dopamine-gcp-20261018/`; regenerate on another machine.

| Check | Outcome |
| --- | --- |
| Local source checks | Build, 75 Node tests, 25 Python tests, 13 offline SDK cases passed |
| Supervisor smoke | Real named worker registration, session gating, storefront/API routes, fail-fast on worker exit passed; no voice room allocated in this smoke |
| Remote build | Full image built on Cloud Build with Node 22 / Python 3.12; source tests above used local tooling, not tests inside the final image |
| HTTP | Eight public routes, both exact origins, foreign-origin 403, invalid session body 400, six private paths denied |
| Live Brave | Real avatar/host connected; mic mute, optional chat, typed budget request, two recommendation cards, product-detail navigation with the same canvas, mobile panel and Disconnect passed |
| Mobile | 390 px capture; live panel approximately 410 px high, no horizontal overflow |
| Cleanup | Disconnect returned HTTP 200, launcher restored, zero rooms in the production namespace at final read-only check |

The live request was a synthetic test asking for wireless work headphones under
IDR 500,000. It produced a matching needs brief and two recommendation cards.
The test then clicked a product detail link and retained the avatar canvas.
It does not establish completion of the entire spoken recommendation, automatic
catalog filtering, cart confirmation or all six features in a human voice call.
Browser microphone input was simulated; ASR and acoustic quality with the user's
real microphone remain to be checked. No conversion or comparative latency result
is claimed.

Retained failures: the first lengthy headless harness ended when its browser
closed; a second headless attempt connected but timed out on pointer interactions.
The focused headed Brave run passed without changing application rendering code.
The exact headless pointer failure cause is unconfirmed. Both failed reports and
the passing `live-flow-report.json` are retained.

The initial HTTP script expected public `/healthz` to return 200; the external
URL instead returned a Google HTML 404. Internal Cloud Run probes passed and
public `/api/health` returned 200. Use `/api/health` for external monitoring;
the exact public-edge behavior was not established.

## Operations

Read-only status/logs:

```bash
gcloud run services describe dopamine \
  --project=dopamine-commerce-archzxy --region=asia-southeast1
gcloud run services logs read dopamine \
  --project=dopamine-commerce-archzxy --region=asia-southeast1 --limit=60
```

Treat logs and full service descriptions as operational data; avoid pasting
credentials, tickets or user content into source/docs. The named runtime account
reads the secret mount, and supervisor logs redact known provider secrets.

For a future authorized source update, inspect the diff, active sessions and
relevant checks first. Preserve existing env, origin and secret configuration:

```bash
gcloud run deploy dopamine --source=. \
  --project=dopamine-commerce-archzxy --region=asia-southeast1 \
  --build-service-account=projects/dopamine-commerce-archzxy/serviceAccounts/dopamine-build@dopamine-commerce-archzxy.iam.gserviceaccount.com
```

Do not run this during an active user call without planning the interruption.
After deployment, verify the ready revision, config, actual provider flow and
room cleanup. GitHub updates do not automatically deploy: no repository trigger
was installed. `node scripts/deploy-gcp.mjs prepare` is idempotent setup;
`publish` handles only the first deployment and refuses an existing service.

Rollback to the original verified deployment baseline if the VAD candidate causes
speech cutoffs or another later rollout fails (traffic selects its original env
and code, with native silence left at the provider baseline):

```bash
gcloud run services update-traffic dopamine \
  --project=dopamine-commerce-archzxy --region=asia-southeast1 \
  --to-revisions=dopamine-00003-79x=100
```

Revisions 00001/00002 were intermediate configuration stages; do not choose them
as the verified baseline. This rollback changes routing, not source, secrets or
browser-local state.

## Setup fixes retained in code

- New service accounts briefly failed an IAM binding immediately after creation;
  a later attempt succeeded. Setup now retries that specific visibility error
  with a bounded delay instead of escalating permissions.
- Budget API calls needed explicit `--billing-project` for the quota consumer.
  This was fixed without ADC login or changing global gcloud configuration; a
  project-scoped learning record was saved.

References checked October 18:

- [Cloud Run container contract](https://docs.cloud.google.com/run/docs/container-contract)
- [Instance-based billing](https://docs.cloud.google.com/run/docs/configuring/billing-settings)
- [Minimum instances](https://docs.cloud.google.com/run/docs/configuring/min-instances)
- [Source deployment](https://docs.cloud.google.com/run/docs/deploying-source-code)
- [Secret Manager integration](https://docs.cloud.google.com/run/docs/configuring/services/secrets)
- [Cloud Run pricing](https://cloud.google.com/run/pricing)
