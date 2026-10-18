# Service upgrade and workflow review — October 18, 2026

The coordinated source and runtime model were deployed with the user's explicit
authorization as `dopamine-gemini38-20261018`. The mounted Secret Manager version
3 changes only `GEMINI_MODEL` to `gemini-3.8-live`; readback confirms preserved
resources, provider, VAD, origin, namespace and session limits. A direct model
preflight returned native audio. Production payments remain disabled, and these
checks do not establish faster human voice replies. Existing explicit
`GEMINI_MODEL` settings still override source defaults in other environments.

## Selected package set

| Component | Previous checkpoint | Selected state | Reason |
| --- | --- | --- | --- |
| Gemini Live | 2.5 native audio baseline | `gemini-3.8-live` source/example default; 2.5 rollback and 3.1 comparison supported | Current recommended stable low-latency voice model |
| Python LiveKit Agents + Google/Spatius/Tavus plugins | 1.7.1 | All pinned to 1.8.8 | Coordinated provider support, including current Gemini live context encoding |
| Python dotenv | 1.2.3 | 1.2.4 | Patch update in the tested resolution |
| AvatarKit Web | 1.3.9 | 1.3.10 | Current patch, validated with the real renderer |
| AvatarKit RTC | 1.1.5 | Keep 1.1.5 | Still current; peer range accepts selected AvatarKit/LiveKit client |
| LiveKit browser client | 2.22.3 | 2.23.0 | Current compatible client release |
| LiveKit JS protocol | 1.50.4 | 1.52.1 | Current compatible protocol package |
| LiveKit React components/styles | 2.9.24 / 1.2.0 | Keep | Already current |
| LiveKit Node server SDK | 2.19.1 | Keep | Already current |
| Midtrans | Sandbox Core API | Keep API; add stable charge idempotency header | Retry protection without changing the payment product |
| Cloud Run | Combined web/API/worker, CPU always allocated | Keep topology and limits | Continuous worker needs CPU outside HTTP requests |

Versions were read from the publishers' PyPI/npm registry metadata, not inferred
from a cached tutorial: [Agents 1.8.8](https://pypi.org/project/livekit-agents/1.8.8/),
[Google plugin](https://pypi.org/project/livekit-plugins-google/1.8.8/),
[Spatius plugin](https://pypi.org/project/livekit-plugins-spatius/1.8.8/),
[AvatarKit](https://www.npmjs.com/package/@spatius/avatarkit/v/1.3.10),
[browser client](https://github.com/livekit/client-sdk-js/releases/tag/v2.23.0).
The framework and its plugins use one version cohort; the browser/server packages
have their own version numbers. No React/framework replacement was needed.

## Gemini workflow changes

[Google's 3.8 migration guide](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-live)
changes thinking, tool behavior and proactive-audio semantics. The worker now
chooses setup by model:

- 3.8 Live: omit `thinking_config`; omit removed affective-dialog configuration
  and any explicit proactive-audio disable flag.
- 3.1 Flash Live Preview: use minimal thinking level. It remains a legacy
  comparison option, not the default recommendation.
- 2.5 native audio: retain thinking budget zero for rollback/comparison.
- Unknown model IDs fail with a public configuration error; never silently select
  another model or include raw config values in errors. The `models/` prefix is
  normalized for the supported IDs.

3.8 normally enables non-blocking tools. This integration explicitly declares
all 21 commerce tools **BLOCKING**, preserving the established receipt-dependent
reply flow. Cart/QR creation still needs fresh user consent; a returned receipt
must establish the outcome. Non-blocking read-only tools are a separate future
experiment, not a global switch for mutations. No extra service is required.

The upgraded SDK sends appended background context as model-role turns with
`turn_complete=false`. The offline regression checks that page context reaches
the SDK send path, does not interrupt generation and is not resent unchanged.
This addresses the old plugin's 3.1 context limitation; it does not prove model
compliance. See [LiveKit compatibility and thinking guidance](https://docs.livekit.io/agents/models/realtime/gemini/).

A read-only model-metadata lookup using existing private configuration returned
all three IDs with `bidiGenerateContent` support. It generated no audio/text,
allocated no room and confirms neither session startup nor account quota. The
[current pricing page](https://ai.google.dev/gemini-api/docs/pricing) lists a free
tier for these Live models; actual project limits must be checked in
[AI Studio](https://ai.google.dev/gemini-api/docs/rate-limits). This work keeps the
direct Google plugin; it does not switch billing to LiveKit Inference or Vertex.

## Avatar and transport workflow

Keep the existing room ownership: LiveKit React owns the Room, the Spatius player
attaches to it, `singlePeerConnection=false`, and the host renders remote audio.
The simpler managed-room example is not a reason to create a second Room.
Keep first visible rendering before player setup/allocation, cached asset warming,
parallel microphone permission, stable canvas across Chat/minimize, cancellation
and microphone-track cleanup. These contracts still match the
[Spatius client guide](https://docs.spatius.ai/livekit-agents/client) and
[host-owned RTC flow](https://docs.spatius.ai/sdk-reference/web-sdk/rtc-adapter).

The maintained Python plugin stays in LiveKit Agents and streams Ogg Opus audio.
Do not add whole-sentence buffering or a second independent voice playback path.
Automatic provider/edge routing and the RTC motion jitter buffer remain in place;
the new package versions do not establish a reason to force TCP or change region.
See [Spatius release guidance](https://www.spatius.ai/blog/spatius-sdk-and-service-update-2026-08-22/).

## Checkout and diagnostics workflow

Each sandbox charge now sends the same signed draft's order ID as
`Idempotency-Key`, including retries after service restart. Generated IDs are 45
characters, inside Midtrans's 46-character maximum. The provider key window is
five minutes; status reconciliation and unique `order_id` remain necessary after
that window. HTTP 202/in-process or ambiguous responses remain unconfirmed, never
paid. A regression covers retry with the same payload/key and a new service
instance. [Midtrans's idempotency contract](https://docs.midtrans.com/reference/api-headers).

No BI-SNAP migration, webhook or production-payment activation is introduced.
Current documented Sandbox Core API supports the demo. Browser polling and signed
server receipts remain authoritative. A future commercial deployment can evaluate
notifications for background settlement; this task did not configure a webhook.

Tool timing now includes an allowlisted `receiptCode` for checkout outcomes,
without order IDs, receipt tokens, arguments or visitor data. This helps distinguish
review/status/unknown outcomes in a future trace. The earlier 20-second receipt
wait is still unexplained; logging a code does not fix the missing stage. Model
TTFT and audio-to-playback RPC remain separate from human speech-to-speaker E2E.

## Reproducible install, activation and rollback

`backend/requirements.txt` includes `constraints.txt`, a tested 92-package
resolution generated in an isolated CPython 3.12 Linux environment. Both module
and full-store Dockerfiles copy it before installation. CI keys its dependency
cache on both files. Keep these files together; for a future update, resolve in a
clean environment, regenerate constraints and run the same checks. This is a
version lock, not a claim of exhaustive vulnerability scanning.

The first authorized cloud build exposed a toolchain mismatch: npm 10 bundled
with the Node 22 base rejected the scoped OpenTelemetry override lockfile made
with npm 12. Local clean installs had used Node 26/npm 12. Docker and CI now pin
**Node 22.23.3 + npm 12.2.0**; manifests record the npm version and compatible Node
engines. Dependency package versions were not changed to resolve this issue.
An official Node 22.23.3 distribution was checksum-verified and used task-locally
for a fresh 90-case Node run and clean module install/build. The host runtime and
install-script approval policy were not changed. Keep both Dockerfiles, CI and
package metadata aligned when changing this toolchain.

Fresh checks passed: 3 catalog + 87 module Node, 38 Python unit and 18 offline
SDK cases; production build, pip check and complete npm dependency tree; zero
npm audit findings; worker CLI help; shopping and synthetic checkout at
1440/390/320; seven actual Brave renderer scenarios. The rendered face was
inspected. The standalone export contains 125 source files with no unexpected
runtime paths, and a clean archive install/build also passed. These are local
checks. GitHub CI has not run; the authorized Cloud Build and rollout subsequently
succeeded after the toolchain correction above.
The new SDK setup test serializes all 21 declarations to confirm blocking behavior
and absence of obsolete 3.8 options. Browser tests use actual public avatar assets
but intercept session allocation; payment browser tests use a synthetic provider.

Activation of another existing environment requires its operator to select the model
explicitly, build the coordinated source and run a bounded real provider test.
Preserve the namespace, origin, mounted secrets, scaling/CPU/session limits,
provider and native VAD setting. Do not copy a local env wholesale into cloud.
Compare greeting, no-tool replies, navigation, interruption, cart confirmation,
checkout receipt and disconnect on the same device/network. Record failed starts
as well as timings. No automatic model fallback hides those failures.

For a model comparison/rollback on this upgraded stack, select the documented
2.5 ID in `GEMINI_MODEL` and restart/redeploy deliberately. A failed package/image
rollout needs the previous complete image/configuration; changing only the model
does not roll back dependencies. Source defaults alone do not update an existing
Cloud Run secret or a running process.

## Authorized cloud verification

The rollout built and activated the complete package set above. The active image
is `sha256:7acfb6f6bfe3538fb0637437dddfb4f672fa0f0dfd1317914ae690ca604b4146`,
build `d1f7376e-112b-40b3-abd5-470293b727c1`; public storefront, checkout, health
and config returned 200. The previous complete Midtrans revision and secret
version 2 remain intact for rollback. No repository commit/push was performed.

A direct real Gemini 3.8 text-input preflight returned audio after 536 ms (single
sample; setup 2351 ms). Deployed Brave sessions also displayed the actual face,
joined rooms handled by the new worker and received remote audio. These are
provider calls, unlike the earlier offline SDK/model-metadata checks.

The fresh-browser asset test initially exceeded its 60-second preload deadline
without allocating a room. A longer unmodified network run reached asset readiness about
145 seconds after harness start, then displayed a frame about 2.9 seconds after click. The
SDK's public unified template is 29,289,096 compressed bytes; the application
served an approximately 7.4 MB avatar JS chunk without compression in the observed
network trace. These cold-download observations are separate from model reply
latency. No manual GPU veto, PNG fallback or transport override was added.

The next synthetic microphone run served that exact public template from a
verified task-local cache, and disabled browser microphone DSP for the offline
WAV fixture only. It displayed a frame about 703 ms after click and captured
whole 2.125/3.750-second inputs plus remote audio. Its requested voice filter was
not verified. The first voice harness had fragmented input measurements; the
second input in the corrected run overlapped remote audio. The recorded 581 ms
input-end→remote-audio interval lacks a validated semantic response pairing and
must not be advertised as E2E latency or an improvement over 2.5. The old-version
baseline never allocated a session, so there is no controlled model A/B.

Retain the failed reports and the original uncached startup observation alongside
subsequent checks in `.logs/service-rollout-20261018/`. Cached-asset QA is not a
fix to production downloads. Human voice comprehension, consistent RTC behavior,
spoken checkout and the earlier receipt timeout remain open.

The final independent typed-tool browser session passed on the new revision:
headphone/500k filtering, checkout draft HTTP 200, visible server-priced preview,
same avatar canvas, Chat closed and cart preserved. Worker receipts confirmed
`filter_shopping_catalog: applied` (472 ms) and `prepare_checkout: review_ready`
(585 ms). The latter does not establish the prior intermittent timeout is fixed.
No QR or settlement was initiated. All three allocated browser sessions ended
with explicit Disconnect and session-end HTTP 200; final production/other room
counts were 0/0 and every task browser was closed. Deployed spoken filter
comprehension remains unverified despite the typed tool path passing.

Sanitized new-revision logs contain three ready jobs (worker→ready 3321–4188 ms)
and four first-audio→playback RPC intervals (881–3870 ms). They mix greeting and
synthetic input and have no controlled baseline. 3.8 provider TTFT was missing/
null, not zero. No speed percentage or human E2E latency follows from these data.
