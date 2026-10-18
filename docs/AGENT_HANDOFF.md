# DOPAMINE — current project and hackathon handoff

**Latest name correction, October 19: Muhammad Afif Alfawwaz.**
The user corrected the member's surname to **Alfawwaz** (double w). The latest
October 19 PPTX/PDF, source generator and team documentation now use
**Muhammad Afif Alfawwaz**. Only page 1 PDF text changed, exactly by that surname;
all other page text is preserved, the 13-page PDF remains under 5 MB and the
PPTX archive validates. Prior artifacts are backed up under ignored
`.logs/name-fix-20261019/`; October 18 outputs remain historical. No portal
upload or submission was performed by this correction.

**Latest repository checkpoint, October 19: latest source pushed and repository made public.**
The user explicitly requested pushing to the existing Archzxy repository,
making it public and replacing its old snapshot with the latest local overhaul.
Commit **`015f123d837ff708e321425702ff60a17c0788e7`** updates `main` in
**[Archzxy/archava-commerce](https://github.com/Archzxy/archava-commerce)**:
141 changed files, with 365 source files in the index. It includes the current
DOPAMINE storefront, standalone assistant, task-completion sessions, checkout/
receipt email, coordinated service upgrade, cloud packaging, docs, CI and
editable launch-video source. The initial KALA commit/history is preserved;
no force push or repo replacement occurred. README and repository metadata now
identify **Archava Commerse** as the product and **DOPAMINE** as its demo store,
with the live prototype as the repository homepage. This is documentation/
metadata alignment, not a code/framework/storefront rebrand.

The existing owner credential was scoped to the publishing commands; neither
stored GitHub account was removed, the active login was not switched, and the
existing Git author identity was retained. Fresh anonymous GitHub API reads
return 200 for both repository and `commits/main`, report **public**, and match
the pushed commit. GitHub Actions **Repository checks passed**, run
**`39152730006`**, on that source commit: clean dependency installation,
Node/Python/SDK tests, production build, npm advisory check and export all passed.

Fresh local verification: **3 catalog + 112 module Node, 45 Python unit and
20 offline SDK cases pass**, production build and standalone export pass,
**zero npm audit findings**. All three official action commit pins resolve.
Redacted Gitleaks candidate/index/reachable-history scans found no leaks;
in-memory comparison against nine private runtime fields found zero matches
in publishable source or history. Runtime env, keys, logs, encrypted mail state,
exports, build output, browser state and final submission/video artifacts remain
ignored. Public launch stills were visually checked for private data. Imported
font-license whitespace and one workflow/document EOF were normalized without
changing license text; staged whitespace checks pass. Evidence stays ignored at
`.logs/github-publish-20261019/`.

No provider conversation, payment, email, Cloud Run rollout or submission was
performed in this publishing task. Existing cloud/live-voice limitations below
remain. The generated pitch PDF/PPTX still contain their earlier private-access
wording; making the repository public does not regenerate those artifacts.
Earlier statements below about private/unpushed source are historical.

**Latest recording support, October 19: desktop recording shortcut repaired.**
The user reported damaged video/audio and desktop lag when recording with
`SUPER+R`. The Hyprland Lua bindings were present with no config errors. The old
`~/.config/hypr/scripts/screen-record.sh` used uncapped software libx264 and
1 ms audio loopbacks; both existing approximately nine-second recordings had
only 0.021 seconds of AAC audio. A GPU capture preflight worked. The shortcut
script now uses the already-installed GPU Screen Recorder with display-GPU
VAAPI, H.264 at 30 fps and directly mixed desktop/microphone AAC. Child-only
environment cleanup avoids the session's forced NVIDIA VAAPI selection on the
Intel-driven display. No global GPU/browser/Hyprland settings changed.

The same full/area shortcuts and `~/Videos/recording_*.mp4` output remain.
Per-user runtime state, a lock and exact recorder/output ownership replace
global recorder killing. The original is retained beside the script as
`screen-record.sh.bak.pre-gpu-20261019_010309`. Syntax, start/stop, cancelled
selection, actual full capture (about 11 seconds), cropped capture with the
display's 1.5 scale, 30 fps, matching audio duration and complete decoding pass.
The current GSR/FFmpeg combination still logs one duplicate AAC timestamp at
finalization; these tested MP4s have complete audio tracks and decode cleanly.
Full human workflow/subjective audio and longer-run smoothness remain untested.
Task test recordings/processes/audio modules were cleaned up. This was local
desktop support, with no provider session, workflow demo recording or deployment.

**Latest artifact checkpoint, October 19: narrated product-launch motion ready.**
The user explicitly selected local `motion`, then narrowed scope to product-launch
style only: **they will record the workflow themselves**. Do not resume automated
workflow capture unless requested. The user clarified that narration and music
are required; the final MP4 includes both. Output:
`output/video/dopamine-2026-10-19/DOPAMINE_Product_Launch_1080p.mp4` — 30.000 seconds,
1920×1080, 30 fps / 900 frames, H.264 + AAC stereo 48 kHz, 2,698,502 bytes.
This is a launch introduction using the selected palette, kinetic typography,
existing product photos and labelled actual prototype stills. It is not a
workflow test recording or the complete hackathon demonstration video.

Editable source lives in `video/dopamine-launch/` (`index.html`, assets, README,
`build_audio.py`). The output directory also contains
`DOPAMINE_Launch_Editable_Source.zip`, `Launch_Preview.png`, and separate music
and narration WAV stems. An embedded JSON timeline owns visual boundaries,
narration copy and music tempo. English stock narration uses locally cached
Kokoro-82M (`af_heart`), not voice cloning or an Ava-session recording. The
instrumental is original procedural music with voice ducking and transition
accents. Measured master: −14.37 LUFS / −1.20 dBTP. No paid speech/media API,
provider session, external upload or submission occurred for this artifact.

Contact sheets, key full-resolution compositions and encoded transition frames
were inspected. Deterministic seeking passed. Final ffprobe confirms picture
and audio; decoded playback sampled zero dropped frames. Preview play/pause and
audio scrub passed after loading audio as a local Blob to avoid dependence on
HTTP Range support. The agent's audio-input tool cannot provide subjective
listening; technical stream/mix/cue/loudness checks do not claim it. All task
browsers and fixture servers closed. Evidence: `.logs/video-demo-20261019/` and
the output `DELIVERY_REPORT.json`. The user's preview service was inactive and
left unchanged. Concurrent completion-based-call work and its newer cloud
checkpoint below were preserved; this film did not change that deployment.

The user will add their actual workflow recording after the launch's “See it
in action” card. Public video/repository access and the complete submission
remain separate actions; the 30-second introduction alone is not the required
full demonstration.

**Latest cloud checkpoint, October 19 Asia/Jakarta: completion-based calls deployed.**
The user explicitly approved "gas deploy" after reviewing the local change.
Cloud Build **`93eea172-0169-4885-bb78-3a931a415ad0`** succeeded; ready revision
**`dopamine-completion-20261019`** receives 100% traffic, image
`sha256:a37f1d13f876e9a9f51495cf07722b4b20f0d119a0536314589a2ea660386483`.
Only public **`SESSION_SECONDS` changed from 120 to 0** in runtime configuration;
the image contains the locally tested completion/farewell lifecycle described
below. Readback deep-compares the runtime spec, preserving all other env,
resources, service account, origins, concurrency, timeout, probes, scaling and
secret volumes/mounts. The active mounted runtime secret remains **version 4**
and Gemini remains **3.8 Live**. No secret version or IAM grant was created.

Actual fresh room reads found **0 production / 0 other rooms** before build,
immediately before rollout and after rollout. Both public platform origins
returned **200** for `/`, `/checkout`, `/api/health` and `/api/config`; config
reports `sessionSeconds:0`, sessions enabled and provider configured. The bounded
28-row startup log read confirms named worker registration, session enablement
after registration and the private API listening, with zero ERROR-or-higher
entries in that query. These are runtime/HTTP checks, not live model behavior.
**No voice/avatar session, payment or email was started in this deployment.**
Actual beyond-two-minute human voice, pending-task behavior and complete
model-driven farewell remain unverified. Earlier live provider evidence belongs
to its stated revisions and is not a rerun on this image.

The existing preceding **3 catalog + 112 module Node, 45 Python unit, 20 offline
SDK cases and production build** were reused; the cloud image also rebuilt the
frontend successfully. A fixed snapshot uploads 314 files, no private runtime
paths, and excludes the user's unrelated video work. Source fingerprints and
operational evidence are `.logs/session-rollout-20261019/`; the standalone export
is refreshed after the deployment documentation update. No browser, fixture
server or idle analysis engine was started; unrelated local previews and work
were preserved. No GitHub operation or competition submission occurred.

Immediate rollback is **`dopamine-email-20261019`**, secret 4, with the old
120-second setting; check active calls before rerouting. Source and prior work
remain uncommitted. The earlier local-only statements below are historical;
the public prototype now has the no-countdown setting and end-call tool.

**Latest product-identity correction, October 19: Archava Commerse is the product.**
The user explicitly corrected the submission brief: **Archava Commerse** is the
product name as supplied; **DOPAMINE is only the example/demo store**, not the
overall product. Submission copy must present the commerce assistant product
and identify DOPAMINE as its demonstration storefront. Earlier DOPAMINE-as-product
wording below is superseded by this clarification. This correction does not
authorize a source rebrand, deployment, deck regeneration or portal submission.

**Latest submission follow-up, October 19: demo link added to PDF and brief prepared.**
The user asked whether the PDF exists, then supplied the submission-form image.
The original PDF is present: 13 pages, 685,538 bytes, with editable PPTX. A fresh
authenticated GitHub read confirms `Archzxy/archava-commerce` is still PRIVATE.
The user then supplied the exact Drive folder URL as text, superseding older
"no video URL supplied" statements. The correct URL is in `docs/PITCH_DECK.md`
and slide 12; an anonymous request returned 200, title `Demo Video - Google Drive`
and video MIME metadata without sign-in redirect. Earlier OCR/visual variants
returned 404 because the screenshot transcription was ambiguous, not because the
actual folder was proved inaccessible. Video playback/duration remain unverified.
New PDF/PPTX files are in `output/submission/dopamine-2026-10-19/`; the PDF is
13 pages / 686,911 bytes, under 5 MB. Checks confirm the exact Drive hyperlink
in both formats, archive integrity and changed PDF text only on page 12, whose
rendering was visually inspected. Existing evidence dates/claims remain October
18; no full demo or new performance test was run. Original October 18 PDF/PPTX
are preserved. Logs are `.logs/pitch-pdf-20261019/`; task LibreOffice exited and
no browser/provider session was started. The refreshed 841-character English brief
includes Gemini Live, Cloud Run, Secret Manager, private Cloud Storage receipt
records and truthful sandbox/consent boundaries; see `docs/SUBMISSION_PREP.md`
and ignored `output/submission/dopamine-2026-10-19/BRIEF_DESCRIPTION.txt`.
No publication, repository visibility change, cloud change or submission occurred.

**Latest local checkpoint, October 19: remove Ava's fixed two-minute deadline.**
The user asked for calls to last until Ava finishes the task and closes herself.
Source, both blank env examples, ignored local `SESSION_SECONDS` and the cloud
bootstrap default now use **0**; existing optional 30–1800-second mode remains.
The API/room contract uses `sessionSeconds:0` and `endsAt:null`, with strict
project/provider/exact-guest validation and short microphone-only join grants
preserved. Browser countdown/expiry and worker duration timer are omitted in
this mode. Avatar first-frame allocation, optional Chat/minimize, explicit
Disconnect and commerce confirmations/receipts are preserved.

The pinned SDK's `EndCallTool` adds `end_call` (22 tools total), with a brief
Indonesian goodbye before session/job/room shutdown, including Gemini's separate
spoken tool reply. Server metadata marks `archavaSession.status=ending` so the
browser treats deliberate departure normally. Prompt and approved assistant
knowledge now direct closing after a resolved task and clear visitor completion
or an explicit stop request; if unclear, ask once whether more help is needed.
An intermediate thanks, recommendation, cart addition, QR, silence or minimized
panel must not end a call. Pending/unknown outcomes remain unconfirmed. This is
source prompting and mocked SDK evidence, not verified live model compliance.

RoomIO binds the exact guest and deletes the room when the session closes.
Failed avatar startup gets a 60-second error/cleanup grace in completion mode.
The ten-second scoped API sweep keeps active guests, recovers abandoned rooms
after 60 seconds, releases missing-room tickets and counts recovered live rooms
toward capacity after restart. Initial recovery precedes HTTP listening; failed
provider operations retry on the next sweep. Gemini context compression is now
enabled; the installed plugin already supplies resumption handles/reconnection.
Provider/network/credit availability is still separate from application timers.

Fresh checks: **3 catalog + 112 module Node, 45 Python unit and 20 offline SDK
integration cases pass**, production build and `git diff --check` pass. Added
regressions cover calls past their old deadline, optional timed mode, failed
startup cleanup, abandoned/active/foreign-room recovery, capacity across recovery
and concurrent openings, metadata validation, serialized compression/resumption
and farewell-before-delete in both SDK speech modes. Standalone export has
**133 source files / zero unexpected runtime paths** and includes the new
[lifecycle guide](../archava/docs/SESSION_LIFECYCLE.md). Logs are ignored
`.logs/session-completion-{node,agent,sdk,build,export}.log`.

**No cloud environment/image/secret was changed, and no provider session was
started.** The deployed 120-second setting below is still current. The local
preview service was inactive and left inactive; no task browser or persistent
analysis service was started. This change remains local/uncommitted. Next
external action needs the deployment decision: roll out the tested image and
change only public `SESSION_SECONDS` to 0 while preserving all other runtime
settings and checking active rooms first. Actual beyond-two-minute human voice,
pending-task and automatic farewell acceptance remain unverified until an
authorized live test. Do not claim the public site already has this behavior.

**Latest cloud checkpoint, October 19 Asia/Jakarta (October 18 UTC): email activated and received in Spam.**
After reviewing the completed implementation, the user explicitly approved the
dedicated private GCS bucket and existing Cloud Run rollout. They then explicitly
selected a Gmail recipient for one receipt test. Do not copy the sender,
recipient or SMTP credentials into source/docs. The cloud bucket is
`dopamine-commerce-archzxy-checkout-mail`, `asia-southeast1`, uniform access,
public access prevention enforced, soft delete disabled, Delete lifecycle age 7
days per object generation. The existing runtime account received
`roles/storage.objectUser` on this bucket only. Real GCS encrypted round-trip,
listing and conditional conflict/update passed; its synthetic fixture was deleted.

Secret version 4 merges only SMTP/email settings into the **active mounted**
version 3, with equality checks/readback preserving all unrelated values and
Gemini 3.8. An initial read-only preflight accidentally selected an unmounted
old version-2 volume; this was caught and corrected before any mutation. Always
resolve the secret through the container's `/run/secrets` volumeMount name;
unused older volumes remain in the service spec and are not runtime evidence.

The first email image build `48ee107f-0705-46bf-b9f1-3c984f443bf5` and revision
`dopamine-email-20261018` deployed successfully. Model, public env, resources,
account, session limits, concurrency, timeout, probes, scaling and secret path
were preserved; zero active production/other rooms preceded and followed it.
Public `/`, `/checkout`, `/api/health` and `/api/config` returned 200. One actual
browser test passed: confirmed receipt recipient → actual Midtrans sandbox QR
image → official simulator settlement → backend paid/queued → SMTP accepted →
reload with the same paid/accepted order. Cart stayed intact, no recipient in
browser storage/API receipts, zero voice session requests and browser closed.
Real encrypted runtime-bucket readback confirms one accepted record for the
selected recipient without exposing it. The user confirmed the email arrived
in **Gmail Spam**, not Inbox. No real funds/fulfillment occurred, and no message
was automatically resent. No ERROR-level logs were observed in the bounded query.

Passive Google DNS-over-HTTPS lookup found one SPF record authorizing Spacemail
and the provider's documented DKIM selector key; `_dmarc` returned NXDOMAIN.
Ordinary local DNS timed out, so do not confuse that failed attempt with the
successful DoH evidence. Missing DMARC is an improvement to prepare, not proven
cause of this message's Spam placement. Received-message authentication headers
were not inspected and DNS was not changed. A monitoring-only DMARC record
`v=DMARC1; p=none` at `_dmarc` is documented; Inbox placement remains open.

A final source correction removes static “cloud email not active” knowledge in
favor of the current signed emailStatus. A newly added regression also keeps
v2 receipt statuses consistent when Midtrans becomes unavailable after SMTP
acceptance: show unknown temporarily, retain the accepted outbox state, restore
paid/accepted on recovery and never resend. Fresh checks after this correction:
**3 catalog + 105 module Node, 44 Python unit, 18 SDK integration and build pass**.
Final correction build `ce4b9966-0649-48d7-b245-98de651def19` and revision
`dopamine-email-20261019` now serve 100% traffic with the same secret version 4.
Image digest: `sha256:da86087b512e115de5bd61199c5de0af3455b33af3ff668e61720d6a188bda60`.
Final readback passes all preserved-service checks. Actual status recheck of the
previous paid order remains paid/accepted after the rollout; the encrypted GCS
record generation is unchanged, so the new worker did not resend it. Operational evidence is `.logs/checkout-email-20261018/cloud/`.

The local checkpoint below predates the approved cloud activation. Its statements
that email is disabled or cloud testing is pending are historical, not current.

**Latest local checkpoint, October 18: paid-simulation email and cashier flow implemented.**
The user explicitly authorized execution of the WhiteRock-inspired adaptation,
selected a domain mailbox, supplied its provider name, and privately filled the
SMTP password. Nonsecret provider settings were entered in ignored runtime
configuration according to Spacemail's official documentation. Real TLS SMTP
authentication passed; no message was submitted and no mailbox address/password
is recorded here. `CHECKOUT_EMAIL_ENABLED` remains false, with no cloud storage
configured. The existing public image, mounted secret and service are unchanged.

New source adds a dedicated optional email/consent form in the compact checkout
card, exact signed-draft recipient registration, paid-only background outbox,
encrypted durable records and a bounded Python SMTP child outside the voice
worker. Concurrent polls/workers and restart use CAS claims before sending.
Accepted means SMTP accepted DATA, not Gmail inbox delivery; failed/uncertain
submissions do not alter payment or retry automatically. The browser/model/
Midtrans never receive the recipient from this path. The separate storefront
shipping-preview form now explains where actual receipt-email consent lives.
Receipt v2 adds only allowlisted emailStatus; Python still accepts legacy v1.
The cashier prompt now reviews item quantities, example shipping and totals,
requires fresh QR consent, stops upselling at payment, offers optional email
only when configured, and uses verified mail outcomes in its wording. Prompt
and knowledge changes remain local until the image rollout.

Local storage is ignored `.state`; Cloud Run deliberately requires a private
GCS bucket because its filesystem is ephemeral. The GCS adapter uses encrypted
bodies, hashed identifiers and generation conditions. Only fake GCS requests
were tested; no actual bucket, IAM grant or cloud mail queue was created.
See [CHECKOUT_EMAIL.md](../archava/docs/CHECKOUT_EMAIL.md) for source/config,
capacity/retention, conservative crash behavior and the concrete activation
plan. One dedicated private regional bucket, a new mounted secret version and
an image rollout remain the external step. It consumes GCP credit and requires
the scoped resource/rollout decision. A real mail test also needs the user's
explicit recipient; the supplied sender is not assumed to be a test recipient.

Fresh verification: **3 catalog + 104 module Node, 44 Python unit and 18 offline
SDK integration tests pass**, production build passes, standalone export has
**132 source files / zero unexpected runtime paths**, and a fresh archive
install/build passes. Full HTTP → simulated settlement → actual Python helper
→ certificate-verified local TLS SMTP submits one fixture letter across restart.
Browser tests at **1440/390/320** pass recipient consent, no pre-payment send,
paid/accepted states, duplicate suppression, reload/order reuse, privacy,
overflow and JavaScript-error checks. Form/mobile and success/desktop captures
were visually inspected. The first export-canary check incorrectly matched
its own literal in exported test source; a random per-run canary fixed the test,
then the full suite passed. Keep both logs as evidence. A shell cleanup form
was rejected by the tool; safe task-owned TemporaryDirectory cleanup completed
the archive check instead. Evidence: `.logs/checkout-email-20261018/` and
`.logs/checkout-browser/`. No external mail, new Midtrans/provider voice session,
deployment, GitHub operation or submission occurred. Task browsers, fixture
servers and temporary state closed; `dopamine-dev.service` was inactive and
left unchanged. Real inbox delivery and full human voice checkout remain open.

The earlier checkpoints below describe their earlier source and cloud state.

**Latest reference checkpoint, October 18: WhiteRock email workflow inspected.**
The user reports Ava feels substantially more responsive after the upgrade, but
their observed journey stopped at cart; this is user feedback, not a latency
benchmark or a verified checkout fault. We explained the implemented checkout
review/new-confirmation/QR sandbox path and proposed professional-cashier wording;
that wording has not been applied. The user then requested reading WhiteRock's
email implementation. Source confirms `send_booking_email` → `send_actual_email`
→ generic server-configured SMTP, with an HTML reservation-request summary.
It has no Midtrans paid prerequisite. Email source exists; no live SMTP delivery
was tested or credentials inspected. DOPAMINE email delivery remains unimplemented.

The reference's SMTP/template pattern can inform a future paid-simulation receipt,
with confirmed recipient, background delivery, per-order duplicate suppression
and accurate accepted/failed/unknown status. Avoid its blocking SMTP in an async
worker, unconditional prompt success wording, silent domain rewrites and personal
data in navigation URLs. Preserve the commerce consent/signed-payment-receipt
contracts. Details are in [ARCHAVA_REFERENCE_COMPARISON.md](ARCHAVA_REFERENCE_COMPARISON.md).
Only project documentation changed: reference source, runtime secrets, deployed
prompt/image, provider sessions and mail were untouched. The email adaptation
and real sender/test remain future implementation work.

**Latest artifact checkpoint, October 18: pitch PDF and editable deck prepared.**
The user requested the PDF following the event rules. A downloaded copy of the
prescribed organizer PPTX was populated locally, retaining its required sections
and official header/footer/cover/closing. Outputs are
`output/submission/dopamine-2026-10-18/DOPAMINE_AI_Builder_Cup_2026.pdf` and `.pptx`:
13 slides, English authored copy, approximately 0.69 MB PDF (under 5 MB), actual
reviewed demo captures, native diagrams, qualified performance evidence and
Archava attribution. Optional wireframe/cost, download instructions and unused
blank pages were omitted. See [PITCH_DECK.md](PITCH_DECK.md) for mapping, inputs,
regeneration and checks; source generator is `scripts/create-pitch-deck.py`.

User supplied registered team **Archzxy**, leader **Muhammad Fikri Haikal**, member
**Muhammad Afif Alfawwaz**. The deck lists leader/member without inventing prior
contributions. Fikri leads product engineering; QA/demo support was proposed as
Afif's next responsibility, not completed coding. Two link fields remain:
GitHub CLI readback reports the real repository PRIVATE (labelled access pending)
and no public demo video exists/supplied (labelled pending). Replace those statuses
after actual publication/recording before treating the package as complete.
No organizer master edit, upload, message, submission, repo visibility change,
push, cloud change or provider session occurred. The cloud state and open voice/
latency gaps below remain unchanged. All generated output and rendering evidence
stay ignored; source/docs can be reviewed separately. Video-duration conflict and
reuse eligibility are not resolved by producing the deck.

**Current cloud checkpoint, October 18: coordinated upgrade deployed and checked.**
The user authorized activation and bounded provider testing. Current ready revision
is `dopamine-gemini38-20261018`, 100% traffic, image
`sha256:7acfb6f6bfe3538fb0637437dddfb4f672fa0f0dfd1317914ae690ca604b4146`,
build `d1f7376e-112b-40b3-abd5-470293b727c1`. Runtime secret version **3** changes
only `GEMINI_MODEL` to `gemini-3.8-live`; other secret values round-trip unchanged.
Readback verified same public env, resources, account, scaling, probes, concurrency
and timeout. Public HTTP/config endpoints return 200 with sessions enabled.
No active production room preceded the rollout. Previous verified complete
revision `dopamine-midtrans-20261018` and secret version 2 remain for rollback.

First cloud build `1394122c-b1fb-40ba-831e-59e1f061b269` failed before deployment:
npm 10 rejected the npm 12 scoped-override lockfile. Docker/CI now pin Node 22.23.3
and npm 12.2.0; manifests/installation docs agree. An official checksum-verified
task-local Node binary passed **3 catalog + 87 module Node cases** and a clean
install/build on Node 22. Dependency package versions and host toolchain were
unchanged by this fix. Reused Python/SDK/render checks below cover the same agent
source and selected package cohort; no new agent behavior was edited in rollout.

A direct real Gemini 3.8 preflight with text input produced native audio (536 ms
text-submit→first audio, one sample; no Spatius room). Three bounded real deployed
browser sessions reached the new worker. Actual face/controls were inspected.
The final **typed** tool session applied the headphone/500k filter, opened the
server-priced checkout preview (`/api/checkout/draft` 200), kept the canvas/cart,
and closed Chat. Worker receipts confirm `filter_shopping_catalog: applied`
(472 ms) and `prepare_checkout: review_ready` (585 ms). This is not QR creation,
settlement, full spoken checkout or proof the earlier receipt timeout is fixed.
No payment was initiated in these tests. Previous Midtrans simulator settlement
proof belongs to the earlier Midtrans revision, not a rerun on this image.

Voice validation remains partial: native offline Indonesian WAV input and remote
audio were observed, but its requested voice filter did not pass. The old-version
baseline never allocated a room. A first voice harness fragmented inputs; its
corrected run captured full 2.125/3.750-second inputs but one overlapped remote
audio, and the isolated 581 ms detection lacks verified semantic reply pairing.
Exclude it from performance comparisons. No human voice E2E or controlled A/B
was completed; RTC reliability and voice tool comprehension remain open.

A fresh browser initially hit the 60-second public-asset preload deadline without
allocating a room. An extended unmodified network run reached asset readiness about 145 s after
harness start;
click→first frame then took about 2.9 s. Trace: approximately 7.4 MB avatar JS plus
Spatius's 29,289,096-byte compressed public template. Subsequent QA served that
exact verified public template from a task-local cache; one frame appeared 703 ms
after click. This fixture is not a production-download fix or cold-start promise.
No GPU hard gate, image fallback or transport override was introduced.

New-revision sanitized logs show three ready jobs, worker→ready 3321–4188 ms and
four audio-first-frame→Spatius playback intervals 881–3870 ms. These mixed small
samples are not human speech→speaker E2E. Provider TTFT is missing/null in these
3.8 traces, not zero. All three allocated browser tests explicitly disconnected
and `/api/session/end` returned 200; browsers closed and final production/other
room counts were **0/0**. Task diagnostics also closed. The user's dev preview
was inactive and left untouched. No local private env change, GitHub commit/push,
billing upgrade or submission occurred. Evidence and failed attempts are retained
under `.logs/service-rollout-20261018/`; version/workflow and cold-load details
are in [SERVICE_UPGRADE.md](../archava/docs/SERVICE_UPGRADE.md).

Next: human voice checks for comprehension/interruption/commerce and repeatable
latency; reduce actual cold asset transfer before claiming fast first startup.
Keep the existing consent/receipt contracts and rollback image/secret together.

The checkpoint records below describe earlier work. Their statements about no
rollout/provider call apply to those earlier tasks; the active release is above.

**Latest local checkpoint, October 18: coordinated service upgrade prepared.**
The user requested proceeding with the model upgrade and researching workflow
updates for the other services. Source/example default is now `gemini-3.8-live`;
the model factory omits its thinking override/obsolete flags, supports 3.1 minimal
thinking and the existing 2.5 budget-zero rollback, and rejects unknown model IDs
without echoing env data. All 21 tools explicitly remain BLOCKING despite 3.8's
non-blocking default, preserving receipt-dependent commerce replies. The SDK
regression verifies serialized 3.8 setup, preserved native VAD 300 ms, all tool
declarations, and append-only model-role context updates without interrupting
generation or resending unchanged context. No prompt/catalog claims changed.

Python Agents + Google/Spatius/Tavus plugins are now pinned together at **1.8.8**;
dotenv is **1.2.4**. An isolated Python 3.12 Linux resolution produced 92 pinned
constraints; `requirements.txt` includes them, both Dockerfiles copy them and CI
caches against both files. The project's venv was upgraded/checked against that
resolution. Browser pins: AvatarKit **1.3.10**, LiveKit client **2.23.0**, protocol
**1.52.1**; RTC 1.1.5, React components/styles and Node server SDK were already
current and remain. Renderer contracts, prewarm, room ownership, controls and
canvas lifecycle remain unchanged. Cloud Run CPU/min-instance topology, resource
limits and automatic RTC/provider routing still fit the current demo; no service
split, new Firebase/Firestore or new voice provider was introduced.

Midtrans sandbox charge now reuses its signed draft order ID as a provider
idempotency header (45 characters, within the documented 46-character maximum).
The restart/202 regression retains the same order/payload/key and never infers paid.
The provider's five-minute key window does not replace status reconciliation or
unique order IDs. Tool latency logs now include allowlisted checkout `receiptCode`
without payment/visitor details. This does not solve the earlier missing receipt
stage. See [service versions, workflow decisions and activation](../archava/docs/SERVICE_UPGRADE.md).

Fresh checks passed: **3 catalog + 87 module Node, 38 Python unit, 18 SDK cases**,
production build, pip check, full npm dependency tree, zero npm audit findings,
worker CLI help, shopping 17 scenarios at each of 1440/390/320, sandbox checkout
UI at all three widths, and seven actual Brave renderer scenarios. The upgraded
face screenshot was inspected. Session requests were intercepted and a separate
fixture denied all other API POSTs (two denied POSTs in this run): zero provider
rooms/RTC sockets. Checkout used a synthetic provider. Export (125 source files,
no unexpected runtime paths), clean archive install and standalone build passed.
The new thinking-level test initially expected a lower-case string; the SDK
normalizes it to its MINIMAL enum. That assertion was corrected; retain the first
failed report alongside the passing run. An initial CLI-help command used the
wrong working directory; the corrected module command passed, without starting
the worker. No install-script approval policy was changed.

A read-only Google model-metadata lookup returned all three IDs with
`bidiGenerateContent`. It generated no content, consumed no voice session and
does not verify quota, full conversation behavior or voice latency. **Private env,
cloud secrets/model, deployed image and other reference repositories are unchanged.**
No inference/voice/payment provider session, cloud rollout, commit or push occurred.
Evidence: `.logs/service-upgrade-20261018/` (registry metadata, frozen baseline,
source backups, candidate/install logs, model metadata, verification/browser reports).
Next external step is deliberate model/config/image activation and a bounded real
voice comparison; the live Midtrans revision below still uses its previous stack.
Stage new `backend/constraints.txt`, `integration_gemini.py` and the upgrade guide
with their requirements/lockfile/Docker/CI changes. Keep all existing uncommitted
commerce/rebrand work. Human voice E2E, RTC reliability and the receipt timeout
remain open; source/SDK tests do not establish a latency gain.

**Earlier clarification, October 18: Gemini 3.1 migration prerequisites.**
In response to "why not use 3.1", installed Google plugin 1.7.1 source was checked:
it disables mutable chat/instructions for 3.1, suppressing appended context turns
used by commerce state sync. Current LiveKit docs require Python Google plugin
>=1.8.2 for 3.1 mid-session updates; thinking config must also change from the
worker's hardcoded budget zero to the model's level/appropriate default. This is
not an inherent 3.1 inability. Google's freshly checked 3.1 model page calls it
legacy preview and recommends 3.8 Live for most low-latency voice agents. Details
and primary links are in the comparison report. No SDK upgrade, source behavior,
model/private env change, provider call or deployment occurred in this answer.

**Latest local checkpoint, October 18: adapt useful Archava reference patterns.**
The user requested read-only comparison with Onchain, WhiteRock and the canonical
Platform template, then adaptation of good parts. Findings and limits are in
[ARCHAVA_REFERENCE_COMPARISON.md](ARCHAVA_REFERENCE_COMPARISON.md). Onchain/Platform
prewarm public Spatius assets while visitors read; DOPAMINE previously waited for
hover/focus/click. Source now prewarms during browser idle time with a data-saver/
hidden-document guard. It creates no view, mic or room. After fresh click-time
readiness, mic permission and visible rendering proceed concurrently; allocation
still waits for **both** permission and a real first frame. Late tracks are stopped
after Disconnect, permission denial keeps its specific error, and stale attempts
cannot allocate. First-frame gating, canvas identity, chat/minimize, three controls
and all commerce confirmation/receipt contracts remain intact.

Marketplace ACK now runs independently of model history sync after the exact
guest/page/revision is accepted. The context tool already sees that worker state;
ACK does not claim model ingestion or cart/payment success. Both tasks retain
shutdown cleanup. WhiteRock differs materially (Tavus, source-default Gemini 3.1,
voice-only degradation). No provider/model/prompt/VAD/region/buffer switch was made.
Source instruction sizes and tool counts suggest a workload difference, not a
verified voice-latency cause. Other reference repositories were not modified.

Fresh checks: 3 catalog + 86 module Node, 35 Python unit, 16 SDK cases, build,
shopping browser QA 17 scenarios at 1440/390/320, and seven real Brave renderer
cases passed. The new SDK test stalls model sync while requiring exact ACKs and
ignoring foreign guests. Browser tests prove background preload without mic/view/
room, visible face while permission waits, denial/cancellation/late-track cleanup,
cached-false recovery, render cancellation and restarting after Disconnect.
Every session request was intercepted: zero provider rooms, RTC sockets or
unintercepted POSTs. Actual normal/mic-wait face screenshots were inspected.
One preloaded local run measured 528 ms harness click→first-frame callback; this
is not an A/B, cold-click guarantee, full call startup or voice latency result.
Module export also passed (122 source files, no unexpected runtime paths);
`git diff --check` passed. Evidence and source fingerprints are in
`.logs/reference-comparison-20261018/verification-summary.json` and sibling reports.
Task-owned fixture servers and browsers have exited; unrelated services remain.
No provider conversation, payment, deployment, commit or push occurred. These
improvements and the earlier dependency fixes remain **local only**; the deployed
Midtrans revision below is unchanged. Human voice E2E latency, RTC reliability
and the earlier checkout receipt timeout remain open.

**Latest planning checkpoint, October 18: prototype submission preparation.**
The user supplied current portal mandatory-instruction/form screenshots and the
prescribed Google Slides URL. Its public PDF export (16 pages) was read without
editing/requesting access to the master. Required sections, remaining deliverables,
an editable 3:00 video outline and an English 812-character brief draft are in
[SUBMISSION_PREP.md](SUBMISSION_PREP.md). The portal requires PDF up to 5 MB,
public GitHub/prototype/video links, a brief up to 1024 characters, and continued
app/API/integration availability through evaluation. No recording, deck production,
repository publication, cloud rollout or submission occurred in this planning task.
Video-length conflict persists: portal mandatory text 3–4 minutes, actual template
3 minutes, public FAQ under 3 minutes. No formal amendment/organizer answer was
verified. Recommend real app screen/audio for functionality, optional motion for
explanations; no explicit facecam/manual-recording mandate was found. Keep cuts,
typed/automated input, sandbox payments and unverified voice claims clear.
Public requirements say Google AI plus Cloud Run or Firebase. This project uses
Cloud Run/Gemini/Secret Manager; Firebase/Firestore are not implemented and must
not be claimed. HACKATHON_RULES.md now records the new sources without resolving
reuse eligibility. The screenshot countdown is capture-time evidence, not a
verified current deadline. All prior audit/local/cloud status below is unchanged.

**Latest local checkpoint, October 18: repository audit before GitHub push.**
See [REPO_AUDIT.md](REPO_AUDIT.md) for keep/add/exclude decisions and remaining
release gaps. Fresh checks: 3 catalog + 86 module Node, 35 Python unit, 15 offline
SDK cases, build, shopping/checkout browser QA at 1440/390/320, and four real
renderer regressions passed. Renderer requests were intercepted: zero provider
rooms or RTC sockets. Actual face screenshot was inspected. No new voice/payment
provider session or cloud rollout occurred; current release below is unchanged.
Local dependency fixes (Vite 6.4.3, source-map-js 1.2.2 and scoped OpenTelemetry
Core 2.7.1→2.8.0 override) reduce npm audit's original 16 findings to zero while
preserving provider SDK pins. These changes are not yet in the deployed image.
Export guards now reject payment/signing keys in both env examples; cloud
bootstrap carries optional checkout secrets. English root README, third-party
notices, offline CI and checkout QA command were added. CI has not run on GitHub.
The project still has no chosen top-level source license. Root AGENTS now follows
manual-only skills. Private/generated output is ignored; no tracked source/assets
were deleted. Gitleaks found no secrets in initial push candidates or reachable
history; final scan metadata is in `.logs/repo-audit-20261018/`.
All source changes remain local/uncommitted/unpushed. Next: review/stage intended
source including new files, preserve manifest/lockfile together, then push when
requested. Full human voice checkout, success announcement, consistent latency
and RTC reliability are still open; do not infer completion from offline tests.

**Latest research checkpoint, October 18: latency internet research only.**
The user requested internet research, not another rollout/provider test.
Official Google/LiveKit/Spatius docs were checked against installed SDK source
and existing cloud logs. Current release/config below are unchanged; readback
confirms service min/max 1, CPU always allocated, 1 vCPU / 2 GiB and VAD 300 ms.
147 latency records across four revisions include 25 audio-frame→playback RPC
intervals (825–2031 ms, sample median 1090), and 21 valid model TTFTs
(311–3999 ms, sample median 715). On the current revision, five RPC intervals
range 901–2031 ms and five valid TTFTs range 715–1539 ms. These are mixed QA,
greeting/text/synthetic/failed/TCP-candidate samples, not human E2E or a regression
attributed to payment activation. One prepare-checkout tool took 20003 ms,
matching its receipt deadline; the missing/delayed receipt stage remains unknown.
RTC channel/transport closure evidence does not establish the root cause.
Next priority: turn-correlated E2E/browser playback and RTC diagnostics; then
trace checkout receipt timing, compare VAD 300/500 ms on Indonesian pauses, and
evaluate streaming/tool/prompt/model changes separately. Do not blindly force
TCP, disable the 80 ms motion jitter buffer, reduce VAD or add CPU. Native Gemini
speech-stopped events and playback RPC are not physical microphone/speaker clocks.
Full research, citations, proposed targets and limits: [latency audit](../archava/docs/LATENCY.md).
Sanitized read-only artifacts: `.logs/latency-research-20261018/`. No product
source, env, secrets, deployment, skill activation or live sessions changed.

**Latest verified release, October 18: Midtrans Sandbox activated.** Cloud Run
now serves **`dopamine-midtrans-20261018`**, 100% traffic, image
`sha256:6b0a5e4e3afc38fbb5d870b5803981014ac0efd9e8e3bff161823a923a142d29`.
Cloud Build `266516a9-b65d-4332-8ba3-47d17d31e95f` succeeded. Runtime secret
`ava-runtime-env` is mounted at **version 2**. Readback verified unchanged env,
resource limits, service account, scaling annotations, concurrency, timeout and
secret file path. Only the expected image/secret-version activation changed;
native VAD remains 300 ms. The private key is not in source, build or output.

**Actual provider verification passed:** a headless browser drove the deployed
storefront checkout card through `preview → pending → paid`, loaded the actual
Midtrans QR image, and paid using the **official sandbox simulator**. The backend
polled the same order ID and returned the simulated settlement; the UI displayed
“Pembayaran simulasi berhasil”. Cart remained unchanged. No real payment/order
or fulfillment occurred. A separate real avatar/Gemini session with typed input
also opened the checkout preview successfully; **full live voice confirmation
and success announcement are not yet established**. Two other avatar sessions
failed at startup/RTC, with worker logs showing transport closure after readiness.
Do not describe this activation as a fix for call reliability or human ASR.
An isolated TCP-browser candidate reached the preview and was still speaking,
but its full harness timed out waiting after review; no QR was charged in that
probe. It does not establish reliable TCP behavior or a transport fix. Product
transport was unchanged. Keep all earlier failed reports.

Evidence: `.logs/midtrans-activation-20261018/`, especially `cloud-qr-report.json`,
`rollout-readback.json`, `secret-install.json`, `avatar-preview-probe.json` and
sanitized RTC diagnostics. Two earlier QR tests created pending sandbox orders
but their harness failed to submit the simulator's relative form; these reports
are retained. The final successful harness uses the input's containing form.
Those earlier pending test orders' requested expiry was 15 minutes; their final
provider expiry was not checked. Browser processes are closed after each attempt;
all task calls have ended and final production-room count is **zero**, recorded
in `room-cleanup.json`. Source remains uncommitted/unpushed.

**Earlier activation checkpoint, October 18.** The user confirmed saving the replacement
key and authorized continuation. Their local private file contained an unassigned
credential with symbols; it was not available under `MIDTRANS_SERVER_KEY`.
The first over-restrictive extraction truncated that credential and received 401.
Reading the complete credential authenticated against the pinned Sandbox Get
Status endpoint (HTTP 200, provider code 404 for a fresh nonexistent order).
No charge was made during this check. The credential line is now a quoted
`MIDTRANS_SERVER_KEY` assignment; parse round-trip and preservation of unrelated
local env values were verified without printing any values. Source validation
now permits bounded visible ASCII symbols, excluding controls and the Basic-auth
colon separator; sandbox origin/redirect constraints are unchanged. Fresh
3 catalog + 84 module Node cases passed, including symbol examples and 401
no-production-fallback coverage. No new skills or background learning activated.

Runtime Secret Manager `ava-runtime-env` **version 2** was created through stdin
with readback matching, changing only `MIDTRANS_SERVER_KEY` from mounted version
1. No local namespace/config was copied wholesale to cloud. An authorized source
rollout to `dopamine-midtrans-20261018`, mounting version 2, is now building.
Production-room count before rollout was zero. Do not claim active QR/payment
integration until cloud readback and actual simulator settlement finish.
Evidence: `.logs/midtrans-activation-20261018/` (redacted metadata only).

**Earlier follow-up, October 18: Sandbox credential-format correction in source.**
The user has now registered a Midtrans account and reached the orange Sandbox
dashboard at `dashboard.sandbox.midtrans.com`. The supplied Access Keys view
shows a Server Key with a `Mid-server-` prefix, without `SB-`. The earlier claim
that a sandbox key must start `SB-` was incorrect for this observed dashboard.
Official authorization docs instruct obtaining credentials from the selected
environment; the example prefix is not an environment guarantee.
`archava/server/checkout.mjs` now accepts both observed server-key forms while
pinning all calls to `https://api.sandbox.midtrans.com`, rejecting redirects and
malformed/client keys, and never falling back to production. An injected 401
test covers this boundary. Fresh `npm test`: 3 catalog + 84 module Node cases
passed; `git diff --check` passed. No session/agent or rendering behavior changed;
Python/SDK/build results below remain the earlier checkpoint, not reruns.

The screenshot exposed a Server Key. The user was instructed to **Regenerate the
Server Key and save the replacement directly to ignored `archava/.env` under
`MIDTRANS_SERVER_KEY`**, without another key screenshot/chat message. No exposed
key, merchant identifier or account/contact details were copied into files or
tool requests. Rotation/private installation are not yet confirmed. No Midtrans
provider call, runtime-secret update or new cloud rollout occurred in this
follow-up. The format fix is **local only**; deploy it together with the fresh
key installation to avoid an unnecessary separate build. The live service is
still the checkout revision below, unconfigured for Midtrans. Next: confirm the
user has privately saved a rotated sandbox key, install it in a new runtime
secret version, roll out this source, then verify a real sandbox QR and simulator
settlement. Keep the existing env/VAD/namespace/limits and sandbox-only routing.

**Earlier checkpoint, October 18, 2026; checkout deployed and checked.** The user
authorized Ava-assisted checkout through QRIS sandbox and continuation on the
existing cloud service. At that checkpoint they had **no Midtrans account/key**;
the later registration and format correction are recorded above.
Source adds a server-priced checkout card separate from Chat, fresh voice/button
confirmation, pinned Midtrans sandbox adapter, signed restart-recoverable drafts
and signed status receipts verified by the guest-bound Python worker. No real
order, shipping, recipient-data transfer or cart clearing is introduced.
Without a key the expected result is **`unavailable`**, with a truthful summary
and no QR/payment. Do not replace this with a fake QR or timed success.
Verification: 3 catalog + 83 module Node cases, 35 Python unit cases, 15 offline
SDK cases and build passed. All 3 offline browser widths (1440/390/320) passed
with a **synthetic provider**, including reload reusing the same order.
Production is now **`dopamine-checkout-20261018`**, serving **100% traffic** at
the same public URL. Cloud Build `ff6cfe2d-7402-4edb-897e-41cdc1679eb1` succeeded;
readback verified unchanged env, resource limits, secret mounts, service account
and template annotations, including native VAD 300 ms. One real headed Brave
avatar/Gemini session, driven by a **typed** checkout request, opened the
server-priced card with `unavailable` and no QR. Chat closed, the same avatar
canvas remained, and the three controls stayed visible. Disconnect returned 200;
the task browser closed and production-room count is zero. Actual Midtrans
charge/simulator settlement and **human spoken checkout** remain **not verified**.
The next external step is a Midtrans sandbox account/key, then an authorized
runtime-secret version update and actual simulator verification. Existing source
remains uncommitted/unpushed. See [checkout activation and protocol](CHECKOUT_SANDBOX.md).
Task evidence: `.logs/checkout-rollout-20261018/`, `.logs/checkout-browser/`.

**Sandbox safety:** official Midtrans guidance warns sandbox references can
route real funds when paid using a real banking/wallet app. The card and Ava
direct tests to the official simulator and explicitly discourage real payment.
Only verified sandbox settlement permits **pembayaran simulasi berhasil**.

**Earlier checkpoint: October 18, 2026, after the cloud latency rollout.**
The user explicitly requested applying the prepared tuning directly to the cloud.
At that checkpoint production was **`dopamine-vad300-20261018`**, serving **100% traffic** at the
same public URL. Native `GEMINI_SILENCE_DURATION_MS=300` is active; source includes
the optional Gemini VAD wiring and allowlisted tool outcomes. Cloud Build
`d4ead303-6b5a-4e5e-84e7-51b33e1b2b4d` succeeded. Readback verified that this was
the only environment-key change and resources/secret mounts were preserved.
Two bounded headed Brave provider sessions verified avatar rendering, recognition
and reply to a synthetic audio fixture, and a filter receipt `applied` with the
browser at `/kategori/elektronik?q=headphone&max=500000`. The resulting two catalog
products are within budget. The final explicit Disconnect returned 200; both
task browser sessions are closed and no production rooms remain.
The original combined harness did not complete its filter request; a focused
follow-up's `/produk`-only assertion incorrectly rejected the valid category
route. Both failed reports are retained; verification uses the actual browser
route and worker receipt, not a claim that those harnesses passed unchanged.
**No before/after human voice latency improvement is established.** The 300 ms
setting is silence detection, not total response time. Five post-rollout audio
frame→playback RPC intervals were 954–1342 ms. See
[deployment runbook](GCP_DEPLOYMENT.md) and [latency audit](../archava/docs/LATENCY.md).
GitHub source changes remain uncommitted/unpushed; no billing upgrade or submission.

**Earlier setup checkpoint: October 18, approximately 09:10 Asia/Jakarta.**
The latency review preceding the rollout read existing cloud logs and found seven
model-audio→Spatius playback RPC intervals of 825–1090 ms, five valid provider
TTFT values of 311–525 ms, and one 5002 ms filter action matching the browser
receipt deadline (cause/outcome unconfirmed). These include earlier QA attempts;
none establishes human end-of-speech→audible response latency.
Local source now supports optional `GEMINI_SILENCE_DURATION_MS` directly in native
Gemini VAD; blank preserves baseline, 300 ms is an **untested live candidate**.
Tool latency records now include allowlisted outcome statuses. New verification:
75 Node / 29 Python / 14 SDK cases and build passed. **No rollout, new provider
call or private-env change** was made during that earlier review. The subsequent
authorized rollout above supersedes its no-rollout state. Details and measurement
limits: [latency audit](../archava/docs/LATENCY.md).

The user asked the agent to handle remaining GCP setup after payment activation.
The complete store/API/worker is now live at
[DOPAMINE](https://dopamine-656573292283.asia-southeast1.run.app), project
`dopamine-commerce-archzxy`, Singapore, ready revision `dopamine-00003-79x`.
Billing is linked; secrets, separate production worker and budget alerts are
configured. A headed Brave provider call passed avatar, mic/chat, needs brief,
two recommendation cards, preserved-canvas navigation and disconnect checks.
Final production-room count was zero. Details, retained failed QA attempts,
cost behavior and rollback: [GCP deployment runbook](GCP_DEPLOYMENT.md).
An October 18 pricing check estimates current continuous Singapore compute at
USD 68.43 per 30 days before free allowance, or approximately USD 63.21 with the
full account-wide monthly allowance available. This is an estimate, not measured
spend; other charges are additional. See the runbook calculation. No configuration
was changed in response to the user's cost question.
Source changes are still local/uncommitted; no billing upgrade, GitHub push or
competition submission was performed. The older no-deployment statements below
describe earlier checkpoints; current deployment status is this paragraph and
the runbook.

Checkpoint: **17 October 2026, Asia/Jakarta**. This file was prepared using the
local `hackathon` workflow so another agent can continue without the chat history.
It records existing work; no new product build, provider call, deployment or
submission was performed while preparing this handoff. Recheck changing facts
before acting, especially the deadline, billing and remote repository state.

**Current confirmed GCP status, 18 October 2026:** the latest user screenshot
shows **IDR 5,393,250 of IDR 5,393,250 Free trial credit**, **88 days remaining**,
ending **January 15, 2027**. A fresh read-only CLI check also reports
`My Billing Account` **`open: true`**. Trial credit/account activation are now
confirmed; no upgrade is required merely to use this trial. At that earlier
checkpoint the deployment project and billing link were not yet configured.
The later setup/deployment is recorded above. No upgrade or payment was performed
by the agent.
The earlier `open: false` and ended-trial banner below are superseded observations,
not the current account state. The reason the intermediate banner differed is
unconfirmed; do not claim a proven cache/propagation cause or a restarted trial.

Earlier read-only GCP check, **18 October 2026**: the authenticated CLI account
can now list six active projects, all named `My First Project`. Its one visible
billing account, `My Billing Account`, reports `open: false`. This does not prove
deployment readiness; no billing changes or deployment were performed. Product
and test checkpoints below remain historical unless explicitly updated.

Later user screenshot on October 18 identifies a concrete activation blocker:
Billing Overview labels this a **Free trial account** and says **“Your free trial
requires a prepayment.”** It also says an already-made payment should be credited
within 24 hours. A subsequent How you pay screenshot specifies a **one-time
payment of at least IDR 500,000 to become active**, with a Postpay section visible.
At that screenshot checkpoint, payment and remaining welcome credit were unverified.
Do not interpret `open: false` alone as proof the $300 credit expired or was
exhausted. No payment was made by the agent. Official payment-method guidance
confirms some Postpay methods require activation prepayment and unused Postpay
prepayments are refunded at account closure; do not promise instant repayment or
conflate this with a temporary card authorization or Gemini Prepay credits.

An intermediate screenshot superseded the pending-payment state: Payment Overview
shows **“You have a credit −IDR 500,000”**, **“No balance due”**, and a manual
IDR 500,000 payment dated October 17. This is a recorded payment credit, not an
overdue amount or proof of $300 promotional credit. The banner now explicitly
says **“Your free trial is over”** and offers Upgrade, although the type dropdown
still says Free trial account. That banner was superseded by the confirmed active
trial screenshot and fresh CLI check above. Do not promise that a
new payment restarts the trial or restores the $300. The IDR 1,000,000 Postpay
payment threshold shown below is a billing trigger, not another activation fee
or a spending cap. No upgrade, refund, cloud deployment or payment was performed
by the agent. The earlier CLI `open: false` result predates this screenshot.

## Read first

1. [Root agent rules](../AGENTS.md) and this file.
2. [README](../README.md) for commands and current behavior.
3. [Event rules](../HACKATHON_RULES.md), last researched **15 October**, for
   competition claims. This handoff does not constitute fresh rules research.
4. [Design direction](DOPAMINE_DESIGN.md) for visual work, or
   [module rules](../archava/AGENTS.md) for assistant/session work.

The original handoff request was to persist context for switching agents. The
latest task was GCP setup and deployment, now completed as recorded above. The
preceding design discussion concerned matching the DOPAMINE brand board more
closely; final user acceptance of that photographic/layout refinement is still
pending. Do not reopen the selected direction during deployment maintenance.

## Product and selected scope

**DOPAMINE** is an Indonesian commerce prototype, previously named **KALA**.
**Ava** is its avatar/voice shopping assistant and sales advisor: understand needs,
find suitable products, explain facts and compromises, navigate the shop, compare
options and prepare a confirmed demo cart. Brand line: **Good things. Happier you.**

The user explicitly requested adapting the existing Archava avatar/session
foundation for **Google Cloud AI Builder Cup 2026**, Retail & Commerce. Continue
this implementation. Repository ownership and rebranding do not determine
competition eligibility; retain an honest record of reused and new work.

Core demo flow: open Ava → state a product need and budget → inspect matching
products and comparisons → confirm a cart preview → see the demo cart and session
summary. Voice commands use structured tools with browser receipts. This is not a
general screen-vision agent: page awareness comes from validated page/product IDs,
DOM sections and structured store state. Do not claim arbitrary visual perception
or unrestricted browser control.

### Current readiness

| Area | Checkpoint state | Remaining gap |
| --- | --- | --- |
| Storefront | Multipage store deployed to Cloud Run; 80 products, 7 categories, filters, favorites, comparison, demo checkout | Final user design review; broader production hardening outside demo scope |
| Ava face and controls | Actual live provider rendering and mic/chat/disconnect passed in deployed headed Brave; mobile capture passed | User's real microphone/device remains to be checked |
| Shopping tools | Six groups implemented; deployed typed requests produced needs/shortlist and a confirmed category/price filter | Full six-feature human voice journey not verified after these changes |
| Sales-advisor prompting | Prompt and verified knowledge updated together; offline checks passed | No measured model compliance or conversion improvement |
| DOPAMINE rebrand | Local source, fonts, generated campaign images and responsive layout updated | Not committed/pushed; final visual acceptance pending |
| GitHub | Initial KALA commit pushed to personal Archzxy repository; private at last remote check | Review final diff, commit/push when requested; public access required for submission |
| Google Cloud | Dedicated project, linked trial billing, complete Cloud Run deployment, named worker, runtime secret and usage alerts verified October 18 | Continuous instance consumes trial credit; monitor costs and provider quotas; see deployment runbook |
| Submission | Dated rules audit exists | Public prototype, final English materials, PDF, video and portal submission unfinished |

## Source map and runtime

| Responsibility | Source |
| --- | --- |
| Store HTTP server, API proxy and rendered pages | `server.mjs`, `pages.mjs`, `compare-page.mjs`, `templates/home.html`, `index.html` |
| Store style and browser interactions | `styles.css`, `ui.js`, `app.js` |
| Catalog and facts | `data/products.js`, `data/catalog.js`, `data/product-knowledge.js`, `data/comparison.js` |
| Widget entry, conversation and avatar | `archava/src/App.tsx`, `archava/src/components/ShoppingConversation.tsx`, `SpatiusAvatar.tsx`, `AvatarCallControls.tsx` |
| Shopping bridge/state and navigation | `archava/src/components/ShoppingAssistantBridge.tsx`, `ShoppingWorkspace.tsx`, `archava/src/lib/` |
| Session API and Python agent | `archava/server/`, `archava/backend/agent.py` |
| Public assistant configuration and prompt | `archava/config/project.json`, `archava/config/catalog.json`, `archava/prompts/system.md` |
| Startup orchestration | `scripts/dev.mjs` |
| Full cloud build, supervision and setup | Root `Dockerfile`, `scripts/start-cloud.mjs`, `scripts/deploy-gcp.mjs`; [runbook](GCP_DEPLOYMENT.md) |

The root store uses plain Node server rendering, with a React/TypeScript/Vite
widget. Node proxies `/api/*` to the session API and serves `archava/dist` through
`/assets/archava/*`. Python registers the named LiveKit worker; Gemini supplies
native audio and Spatius AvatarKit supplies the face. There is no framework
migration underway. `archava/` remains a standalone module without parent imports.

Pinned frontend versions include React 18.3.1, AvatarKit 1.3.9, AvatarKit RTC
1.1.5 and LiveKit client 2.22.3; inspect manifests/locks before changing versions.
Earlier runtime used Gemini 2.5 native-audio preview 12-2025, Kore, thinking 0;
check actual configuration before claiming current provider availability.

Root `npm run build` first synchronizes the catalog into `archava/config/catalog.json`
and then builds the widget. Update product facts at their root source rather than
editing the generated snapshot alone. Behavior changes also update the prompt
and verified knowledge. Data, prices, ratings, stock and checkout are explicitly
demo; no real account signup, payment, shipping or newsletter service exists.

### Local preview

The public preview is now the Cloud Run URL above. **For local work use
`http://localhost:5193`.** The transient `dopamine-dev.service` was active at the
October 17 checkpoint, but was observed inactive during October 18 deployment
work. It was not restarted; no local worker is needed to keep the cloud demo
running. It is not a boot/login service. Inspect before starting another copy.

```bash
systemctl --user status dopamine-dev.service --no-pager
```

If stopped and startup is needed, inspect the service first. For a foreground run:

```bash
PORT=5193 npm run dev
```

The orchestrator starts storefront 5193, API 5180 and the Python worker, enabling
sessions after the worker registers. Default root port without `PORT` is 5173.
The user's report that 5173 showed CHOG was not conclusively explained; do not
assert a proven port/cache cause. Existing local origins must match the chosen
port. Redacted logs live in ignored `.logs/web.log`, `api.log` and `worker.log`.
Configuration-ready health flags do not prove a successful live conversation.

Private provider environment is ignored at `archava/.env`; Python uses
`archava/.venv`. Never print or export their contents. Fresh-machine setup and
origin configuration are in the README. Preserve the preview for user review;
check session activity before any necessary restart.

## Decisions that must survive agent changes

### Avatar rendering and compact interaction

The working lifecycle is **SDK init → loadAvatar → visible AvatarView →
onFirstRendering → allocate voice session → player attach/connect/microphone**.
Rendering comes before paid voice allocation. See `SpatiusAvatar.tsx`,
`src/lib/avatarRendering.ts` and [integration notes](../archava/docs/INTEGRATION.md).

Earlier capability checks produced false negatives, including cached SDK results.
Do not restore an `isDeviceSupported()` hard gate, manual WebGL probes/context
allocation or a PNG face fallback. Keep the same canvas/view through chat toggles
and minimizing. The user also observed success after restarting Brave; the exact
original graphics failure was not established. Do not diagnose every blank face
as a browser setting problem without tracing the actual lifecycle and error.

One **Tanya Ava** click opens the compact panel and starts preparation. Hide the
launcher while open. Place **Microphone, Chat, Disconnect** below the face; chat
starts closed and opens optionally. Minimize preserves the active call;
Disconnect ends it or cancels pending startup and restores the launcher. Latest
observed panel heights were about 436 px desktop and 410 px mobile.

Do not rename compatibility identifiers merely to match the new brand:
`kala-archava`, runtime namespace `kala-archava-dev`, named agent
`kala-archava-dev-host`, `kala-*` storage keys, `window.kalaCart`,
`window.kalaNavigate` and existing transport topics. The four section IDs are
`top`, `catalog-section`, `protocol-section`, `business-section`; section/revision,
exact guest binding, named dispatch, scoped metadata, short grants and expiry
remain security/interface contracts.

### Shopping behavior

Six implemented groups: editable needs/budget, voice-driven catalog filters,
card/price/spec highlighting, ordered recommendations with facts and compromises,
cart preview/confirmation/undo/idempotency, and same-tab summaries with a 24-hour
limit. Browser receipts determine whether an action happened; timeout is unknown.
Voice confirmation must come from a subsequent user turn, not a model argument.
See [feature details](../archava/docs/ASSISTANT_FEATURES.md),
[prompting](../archava/docs/PROMPTING.md) and
[product knowledge audit](../archava/docs/product-knowledge-audit.md).

The user wants Ava to sell confidently and helpfully using truthful catalog
facts. Do not invent discounts, stock urgency, compatibility, shipping promises
or benefits. JEV/“typesafe” was discussed as a speed idea; no confirmed integration
or demonstrated latency benefit exists. Do not describe it as implemented.

### Selected visual direction

The supplied brand board takes priority over previous palette suggestions:
purple **#7B3DFF**, lime **#D5FF4F**, pink **#FF6BC7**, cream **#FFF9F5**,
charcoal **#1F1F24**. The user rejected an earlier color-only treatment as still
feeling different. Fidelity also depends on the tight/slanted lowercase wordmark,
handwritten headings, tactile photographic packaging/fashion and compact retail
layout. Do not revert to the cobalt/lemon or archived pastel alternatives.

Current assets and layout:

- Original SVG wordmark from licensed Fredoka: tight, slanted, with lime smile/star.
  Caveat Brush handles short campaign headings; DM Sans/Plus Jakarta Sans handle
  utility and product reading. OFL files are bundled in `assets/fonts/`.
- Generated packaging hero: `assets/dopamine-packaging-v2.webp`; generated adult
  fashion campaign: `assets/dopamine-campaign-v2.webp`. These are illustrative
  brand images, not evidence of physical merchandise or customer endorsement.
- Compact lime hero → seven category icons → eight curated products → compact
  Ava introduction → handwritten/fashion campaign panels, promotions, editorial
  and comparison. Mobile keeps a short two-column hero, horizontal categories,
  two-column products and single-column promotional cards.
- Generator: `scripts/create-dopamine-assets.py` (optional fontTools dependency).
  Earlier vector bags and `assets/dopamine-palettes.html` are explorations;
  the live hero uses photography. Reference messaging screenshots are not shipped.

See [design decisions](DOPAMINE_DESIGN.md) and
[exact image prompts/provenance](DOPAMINE_IMAGE_PROMPTS.md). Latest refinement
changes storefront presentation; it does not establish new voice reliability.

## Verification ledger

The earlier rows are retained **historical local checkpoints**, not tests rerun
for the original handoff. The October 18 cloud row records new checks performed
during deployment. Evidence under `.logs/` is intentionally ignored by Git and
available only on this machine; a fresh checkout must regenerate it as needed.
The source baseline is `f328042` plus uncommitted DOPAMINE changes, not a tagged
or deployed release.

| Claim | Environment / mode and evidence | Result and practical limit |
| --- | --- | --- |
| Build and protocol/knowledge checks | Purple-theme checkpoint, `.logs/dopamine/reference/` | Build, 75 Node tests, 25 Python tests and 13 SDK integration cases passed; SDK cases are offline |
| Shopping UI behavior | Latest `.logs/dopamine/campaign/shopping-browser.log` | 17 scenarios × 1440/390/320 px = 51 passes; simulated assistant transport, not human voice |
| Responsive routes | `.logs/dopamine/campaign/visual-report.json` | Seven routes × five widths = 35 checks, no root overflow or JS errors; local only |
| Actual face preview | `.logs/dopamine/campaign/preview-report.json` and `ava-1440.png`, `ava-390.png` | Desktop/mobile actual rendering, launcher hidden, three controls visible, images decoded; no voice rooms allocated |
| Renderer retry/cancel | `.logs/dopamine/reference/avatar-browser.log`, `recovery-check.log`, `recovery-check/report.json` | First full run timed out waiting for forced GPU-error state; focused recovery/cancel rerun passed without renderer-source changes. Keep both outcomes |
| Provider conversation | Earlier records in `archava/docs/INTEGRATION.md` and `LATENCY.md` | Live navigation/context and calls were observed earlier; all six shopping features and the latest prompt were not fully revalidated with human voice |
| Standalone export | `archava/exports/kala-archava.tar.gz`, ignored, earlier source-allowlist check | 111 source files, no private env/dependencies/state/build; contains only Archava, not complete storefront deployment |
| October 18 cloud rollout | `.logs/deploy-gcp/`; `output/playwright/dopamine-gcp-20261018/live-flow-report.json`; [runbook](GCP_DEPLOYMENT.md) | Local 75 Node / 25 Python / 13 SDK cases and remote image build passed; public routes/origins/private-path checks passed; headed Brave live request and cleanup passed. Synthetic mic + typed input, not human ASR or full six-feature validation |

Relevant commands from the repo root, when required by a change:

```bash
npm run build
npm test
(cd archava && PATH="$PWD/.venv/bin:$PATH" npm run test:agent)
(cd archava && .venv/bin/python backend/integration_tools.py)
(cd archava && .venv/bin/python backend/integration_worker.py)
npm run test:browser
npm run test:avatar
```

Read browser scripts first: they need the local runtime and separately installed
browser tooling; the avatar suite also needs a graphical display/Brave. Existing
suites intercept voice allocation. For new interactive QA follow the installed
`playwright` skill and root lifecycle rules; close only task-owned sessions.
`evaluate_shopping.py --live` explicitly calls a provider: it is not an offline
check and is unnecessary for documentation work.

## Git, deployment and competition gaps

Local Git HEAD: **`f328042`**, initial KALA marketplace commit. Origin:
`https://github.com/Archzxy/archava-commerce.git`. Initial push is complete under
the requested personal owner; author/committer was haikarure. Both CLI accounts
were retained. Do not remove an account or change identity automatically.
The DOPAMINE rebrand, assets, renderer-related local changes and these handoff
files are uncommitted at this checkpoint. Inspect the full diff before a future
commit/push; private status is historical until checked again.

Google Cloud CLI is installed locally. The earlier check found no available
project/billing account, and a project-creation attempt failed on unaccepted
Terms of Service. That account inventory is now superseded: read-only checks on
October 18 first returned six active projects and one visible billing account with
`open: false`. The **latest check now returns `open: true`**, and the user's latest
screenshot confirms IDR 5,393,250 trial credit with 88 days left (January 15, 2027).
Account activation is confirmed. Later in the same task a dedicated project
`dopamine-commerce-archzxy` was created and linked; `billingEnabled: true` was
verified. Do not collect tax/payment details in the repo.

**Full-stack GCP deployment is complete at the checkpoint above.** The root
Dockerfile includes storefront, Node API and persistent Python worker; the
standalone module's Dockerfile/export remains separate. Cloud Run uses one
instance with continuously allocated CPU, separate namespace
`dopamine-commerce-prod`, 1 vCPU / 2 GiB, runtime Secret Manager mount and exact
HTTPS origins for both platform service URLs. It consumes trial credit while
idle. Budget alerts are not a spending cap; no permanent zero-cost claim is
made. See [GCP runbook](GCP_DEPLOYMENT.md) for verified resources, evidence,
maintenance and rollback. No GitHub deploy trigger was installed.

Event research is preserved in `HACKATHON_RULES.md` rather than re-created here:

- Published prototype date was **18 October 2026**; cutoff hour/timezone unknown.
  Reverify immediately before deadline-sensitive work.
- Google Cloud hosting is required in the researched rules; public GitHub and a
  PDF deck up to 5 MB are visible form requirements. Do not replace hosting with
  another provider and claim compliance without new evidence.
- Video length conflicts: published FAQ/terms under 3 minutes versus the latest
  supplied portal label of 3–4 minutes. It remains unresolved.
- Fresh-source/reuse eligibility, exact hybrid-hosting allowance, post-deadline
  edits and required uptime remain unresolved. A private/new repo does not settle
  the starter's eligibility. No organizer clarification was sent.
- English judging materials and team eligibility still need review. Do not treat
  current Indonesian UI/docs or a team label as proof those requirements are met.
- Deck PDF, recorded demo, final narrative and portal submission are unfinished.

## Next actions, in order of the user's chosen task

1. **For another design turn:** inspect the running 5193 preview and selected
   design guide, compare the requested part to the supplied board, and preserve
   avatar lifecycle. Do not restart the whole visual direction. Latest version
   still awaits user acceptance.
2. **For deployment maintenance:** use the existing project/service and runbook;
   inspect ready revision and active sessions before an authorized update.
   Preserve worker CPU availability, production namespace, secret mount and both
   exact HTTPS origins. Do not rerun first-deployment provisioning unnecessarily.
   Reverify deadline/hosting rules before competition claims or submission.
3. **Before publishing source:** review all changes and secret exclusions, keep
   provenance, and update the English project description. Commit/push or change
   visibility only within the user's actual request.
4. **Before claiming the demo complete:** exercise the deployed voice journey,
   tool receipts/cart confirmation, navigation, disconnect/retry and mobile face.
   Measure response latency if making speed claims; separate model time from
   avatar/audio/network delay. A screenshot or health flag is insufficient.
5. **For submission:** resolve the relevant rule gaps, prepare/rehearse the video,
   final PDF and English materials, verify the public URL/repo, then record actual
   portal acceptance. Prepared files do not mean submitted.

Suggested next-agent prompt:

> Baca AGENTS.md dan docs/AGENT_HANDOFF.md dulu. Lanjutkan DOPAMINE dari working
> tree sekarang sesuai permintaan gua; pakai preview localhost:5193, pertahankan
> lifecycle Ava yang sudah berhasil, dan bedakan hasil lokal dari deployment.
