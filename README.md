# Archava Commerse

**Archava Commerse** is a voice/avatar commerce assistant product, demonstrated
through **DOPAMINE**, an Indonesian demo store with **Ava** as its shopping
assistant. Browse 80 demo products, compare suitable alternatives, review a cart
and test QRIS checkout through the official Midtrans sandbox simulator.

**[Open the Cloud Run prototype](https://dopamine-656573292283.asia-southeast1.run.app)**

The product adapts the Archava template into a commerce experience. The storefront
was previously called KALA; compatible internal IDs and browser storage names
are intentionally preserved. See [sources and notices](THIRD_PARTY_NOTICES.md).

## What is verified

Checkpoint: **October 19, 2026 (Asia/Jakarta)**. Implementation, offline tests, actual provider
calls and deployment are different forms of evidence.

| Journey | Status |
| --- | --- |
| Browse, search, filter, compare, favorites and demo cart | Implemented; catalog/protocol and browser checks pass |
| Assistant needs, shortlist, highlight and confirmed cart actions | Implemented; offline browser checks pass; selected live actions verified |
| Avatar render before voice-session allocation; optional Chat; persistent canvas | Regression checks cover rendering, cancellation and retry; live sessions have worked |
| QRIS sandbox preview → QR → simulated settlement | Verified against Midtrans and its official simulator on the deployed prototype |
| Optional receipt email after verified sandbox settlement | Deployed and tested through actual simulator settlement and Spacemail; user confirmed Gmail received the test in Spam; Inbox placement remains open |
| Entire shopping/checkout journey through human speech | **Not fully verified** |
| Consistent response latency and reconnect reliability | **Open work**; intermittent RTC failures and a checkout receipt timeout were observed |
| Real payment, orders, shipping, accounts or inventory integration | **Not implemented**; all commerce data and fulfillment are demo-only |

The prototype now runs Gemini 3.8 Live with the coordinated SDK upgrade and
model-specific setup, retained in the current `dopamine-completion-20261019` revision. Runtime readback
and public HTTP checks pass; a direct model preflight returned audio. These
checks do not establish faster human voice replies. Deployed typed filter and
checkout-preview tests pass; the synthetic voice filter test did not pass. See the
[service upgrade review](archava/docs/SERVICE_UPGRADE.md).

The pre-push audit's dependency/export safeguards are included in this image.
CI is prepared locally and has not run on GitHub. See the [repository audit](docs/REPO_AUDIT.md),
[latency audit](archava/docs/LATENCY.md) and [checkout evidence](docs/CHECKOUT_SANDBOX.md).
The deployed [receipt email workflow](archava/docs/CHECKOUT_EMAIL.md)
adds a confirmed recipient and background SMTP delivery without putting contact
data into Ava's conversation. A private regional bucket retains encrypted state
for duplicate suppression; SMTP acceptance and Inbox placement remain distinct.

## Run locally

Build toolchain: **Node 22.23.3 + npm 12.2.0**, **Python 3.12**, and provider access for live
conversations. Catalog browsing and offline tests do not require a paid call.
The root server has no npm dependencies; install the standalone module using its
lockfile:

```bash
npm ci --prefix archava
python3.12 -m venv archava/.venv
archava/.venv/bin/python -m pip install -r archava/backend/requirements.txt
npm run setup --prefix archava
```

Setup preserves the included DOPAMINE identity and creates an ignored
`archava/.env` with blank credentials. For the combined local app, set:

```dotenv
PORT=5180
WEB_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
ENABLE_SESSIONS=true
```

Fill the server-only LiveKit, Gemini and Spatius settings privately. Start live
sessions only after credentials and the named worker are ready. Optional
`MIDTRANS_SERVER_KEY` enables **sandbox** QRIS, never production payments.

```bash
npm run build
npm run dev
```

Open `http://localhost:5173`. For another storefront port, set `PORT` on the dev
command and update `WEB_ORIGIN` in the private env. This workspace has also used
5193 to avoid other projects. `npm run dev:web` runs only the storefront; the
assistant API/worker are not started by that command.

Do not commit `.env`, personal profiles, provider keys, session tickets, browser
state, logs or generated exports. Never place secrets in `VITE_*` variables.
Detailed setup: [module README](archava/README.md),
[environment profiles](archava/docs/ENV_PROFILES.md).

## Explore the demo

| Route | Purpose |
| --- | --- |
| `/` | DOPAMINE homepage |
| `/produk` | Searchable catalog, 12 items per page |
| `/kategori`, `/kategori/elektronik` | Seven category pages |
| `/produk/headphones` | Product details and Ava entry point |
| `/promo` | Illustrative product discounts |
| `/bandingkan?produk=headphones,audia-focus-one,ritme-lite` | Shareable comparison |
| `/favorit`, `/keranjang` | Browser-local favorites and cart |
| `/checkout` | Local recipient preview and separate sandbox checkout card |
| `/akun`, `/bantuan` | Demo account summary and help |

Ava uses Gemini native audio, LiveKit rooms and Spatius rendering. One click on
**Tanya Ava** prepares the face before allocating a voice session. Microphone,
Chat and Disconnect controls sit below the avatar; Chat starts closed. Navigation
and opening/closing Chat preserve an active call and its canvas.

The deployed prototype now uses `SESSION_SECONDS=0`: Ava can keep helping past
two minutes and use `end_call` to say goodbye and disconnect when the visitor is
done. Deployment/config checks and offline lifecycle tests pass; an actual long
voice call and model-driven farewell remain unverified. See
[session lifecycle](archava/docs/SESSION_LIFECYCLE.md).

Ava receives validated route, product and shopping-state snapshots. She does not
see arbitrary screen pixels or recipient-form contents. Catalog tools use the
same facts as the storefront. Cart changes require preview, fresh confirmation
and a browser receipt; a timeout is not success.

QRIS uses server-calculated demo prices, signed receipts and the same order ID
on retries. Test only with the **official Midtrans simulator**; do not scan a
sandbox QR with a real banking/wallet app. Simulated settlement creates no real
order, shipping, inventory reservation or cart clearing.

## Architecture and data

- Root Node server: multipage storefront, assets and same-origin API proxy.
- `archava/src/`: embedded React widget and browser-action bridges.
- `archava/server/`: Node session and sandbox checkout API.
- `archava/backend/`: Python voice agent and bounded shopping tools.
- `data/`: source catalog, product knowledge and four comparison groups.
- `archava/config/catalog.json`: standalone snapshot of the same catalog.

After editing catalog/knowledge source, run `npm run build` to sync the snapshot.
Restart the worker after changing its source, prompt or knowledge. The standalone
module must not import files from this repository's parent directories.

Product prices, stock, ratings, discounts and comparison specifications are demo
scenarios. Initial photos come from Unsplash, additional sample data/photos from
DummyJSON, and campaign photos were generated for the project. Font licenses and
source references are retained in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Checks

```bash
npm test
archava/.venv/bin/python -m unittest discover -s archava/backend -p 'test_*.py' -v
archava/.venv/bin/python -m unittest discover -s archava/backend -p 'integration_*.py' -v
npm run build
npm audit --prefix archava --audit-level=moderate
npm run export --prefix archava
```

SDK integration tests use mocks and do not start provider calls. CI runs these
checks without application credentials and does not deploy. Browser QA uses a
separately installed Playwright module and Chromium/Brave:

```bash
npm run test:browser
npm run test:checkout
```

Set `PLAYWRIGHT_MODULE_PATH` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if needed.
These two browser runners own and close their fixture servers/browsers and use
synthetic transport/payment providers. `npm run test:avatar` additionally needs a
running test host, public avatar configuration and a graphical display; it
intercepts session allocation and tests rendering without creating provider rooms.
Provider evaluation scripts require an explicit `--live` and consume provider
usage; they are excluded from CI.

## Deployment and project context

The root `Dockerfile` packages the complete storefront, API and Python worker for
Cloud Run. Runtime secrets are mounted from Secret Manager. A continuously
allocated worker consumes cloud resources even without visitors; budget alerts
are not a hard spending cap. Follow [the deployment runbook](docs/GCP_DEPLOYMENT.md)
for updates and rollback. The bootstrap script refuses to replace an existing
service. GitHub CI does not publish or deploy the app.

`archava/Dockerfile`, Compose and `npm run export --prefix archava` cover only the
standalone assistant module. Keep these for module consumers; they do not package
the complete marketplace.

- [Agent entrypoint](AGENTS.md) and [canonical handoff](docs/AGENT_HANDOFF.md)
- [Repository audit and remaining work](docs/REPO_AUDIT.md)
- [Archava reference comparison and startup improvements](docs/ARCHAVA_REFERENCE_COMPARISON.md)
- [Service versions, workflow upgrade and activation](archava/docs/SERVICE_UPGRADE.md)
- [Prototype submission package and video plan](docs/SUBMISSION_PREP.md)
- [Assistant capabilities](archava/docs/ASSISTANT_FEATURES.md)
- [Prompting and verification limits](archava/docs/PROMPTING.md)
- [DOPAMINE design direction](docs/DOPAMINE_DESIGN.md)
- [Dated event research and unresolved rules](HACKATHON_RULES.md)

The repository has no selected top-level source license yet. Preserve upstream
provenance and third-party notices when deciding how to publish or license it.
