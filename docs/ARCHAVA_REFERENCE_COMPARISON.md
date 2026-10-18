# Archava reference comparison — October 18, 2026

The user requested comparison with the existing Onchain, WhiteRock and Platform
repositories and adaptation of useful parts. Those repositories were inspected
read-only. This is a source/configuration comparison, not a controlled live
conversation benchmark. Their actual running services were not tested. No
provider session, payment, model migration or cloud rollout is part of this task.

**Later same-day follow-up:** the user subsequently authorized a coordinated
service upgrade and its rollout. DOPAMINE now runs Gemini 3.8 Live with Python
SDK 1.8.8 and the updated browser packages on Cloud Run. See the current handoff
and [upgrade guide](../archava/docs/SERVICE_UPGRADE.md) for evidence and limits.
The tables and SDK 1.7.1 diagnosis below describe the comparison checkpoint.

## Follow-up: WhiteRock email path

Subsequent local implementation: the user authorized adapting this pattern.
DOPAMINE now has a confirmed-recipient checkout form, paid-only encrypted outbox,
background SMTP helper and signed delivery status, plus the professional cashier
prompt. Spacemail login was tested without sending a message. Reference repos
remain untouched; cloud mail activation and real inbox verification are pending.
See [CHECKOUT_EMAIL.md](../archava/docs/CHECKOUT_EMAIL.md). The inspection record
below describes the earlier read-only checkpoint.

The user requested inspecting WhiteRock's existing Gmail delivery as a reference
for DOPAMINE checkout. This follow-up inspected source only; it did not edit the
reference, read SMTP credentials, send mail, start a provider session or implement
email in DOPAMINE.

Verified in `Archava_WhiteRock/backend/`:

- `agent.py` registers `send_booking_email` as a base agent tool.
- `prompts.py:58` proactively collects reservation details and the guest's email,
  then asks the model to call that tool.
- `tools.py:246` validates/normalizes the address, calls `send_actual_email`, and
  opens the reservation-summary page. `tools.py:171` builds a branded HTML MIME
  email and calls an SMTP transport configured through server-only runtime env.
  It can deliver to a Gmail recipient; no Gmail inbox-reading integration is
  involved. SMTP is optional, and source presence does not prove today's config
  or actual delivery in this inspection.
- The email describes a reservation request. It explicitly says it is not proof
  of an on-chain payment. This path has no Midtrans settlement condition.

Useful adaptation: a branded HTML receipt and server-only mail transport, wired
to DOPAMINE's existing **verified sandbox paid** state. Proposed sequence:
checkout review → recipient email confirmation → QR confirmation → Midtrans
verified settlement → one receipt email per order → delivery status for Ava.
The email should say simulation; real fulfillment remains unavailable. Recipient
data can stay in a dedicated checkout/server path without being added to model
page/history context. Selecting a real sender and actual outbound mail testing
remain later work, not implied by this reference inspection.

Do not transplant the reference unchanged: its synchronous `smtplib` network calls
run inside an async function and could stall the worker loop; email failures and
missing configuration share a false result; the prompt unconditionally suggests
saying a VIP pass was sent, despite the tool's conditional outcome. Its address
normalizer can rewrite a domain without user confirmation, and its summary URL
contains guest details. A commerce adaptation should use background delivery,
separate accepted/failed/unknown mail states, verified payment facts, duplicate
suppression and confirmed recipient data outside URLs. SMTP acceptance alone is
not proof that Gmail placed the message in the recipient's inbox.

No changes to Ava's deployed prompt or checkout happened in this follow-up. The
earlier proposed professional-cashier wording is still a proposal. The user now
reports noticeably better latency on the upgraded version; this is qualitative
user feedback, not a new benchmark or proof of complete voice checkout.

## What differs

| Area | Onchain | Platform template | WhiteRock | DOPAMINE before this change |
| --- | --- | --- | --- | --- |
| Avatar preparation | Automatically warms public Spatius assets while the visitor reads | Automatically warms public Spatius assets after config refresh | Tavus camera/video track after provider startup | Hover/focus/click begins warming; otherwise the first click bears download/init |
| Realtime model | Local configuration: Gemini 2.5 native audio, Kore | Source/config default: Gemini 2.5 native audio, Kore | Source default: Gemini 3.1 Flash Live, Kore; local configuration enables Tavus | Gemini 2.5 native audio, Kore; deployed native silence setting 300 ms |
| Rendered instructions, characters | 6,612 | 5,032 | 8,645 in `AGENT_INSTRUCTION` | 35,923 including store policies, examples, knowledge and 80-product index |
| Source tool count | 3 decorated tools | 3 decorated tools | 6 explicit base tools, plus optional MCP | 21 decorated commerce tools |
| Page receipt | Small page/section protocol | ACK after accepted guest-bound packet | Broader navigation messages | Marketplace ACK awaited model context synchronization |

Character counts are not token counts or measured response times. The wider
commerce scope is a plausible source of additional model/tool work, not a proven
explanation for a slow turn. Onchain/Platform share the same main Gemini tuning
as DOPAMINE: thinking budget zero and the same LiveKit endpointing/interruption
settings. Copying those settings again would not establish a speed improvement.
WhiteRock's model/provider combination is a separate candidate, not a single
configuration switch validated for this store's tools and context updates.

### Follow-up: why not simply select Gemini 3.1?

The user asked this explicitly after the comparison. A fresh October 18 check
found a concrete integration issue: this project's pinned Google plugin 1.7.1
sets `mutable_chat_context` and `mutable_instructions` false for model names
containing `3.1`. Its context-update implementation consequently omits appended
conversation turns for that model. DOPAMINE uses those updates for page/product,
shopping-plan and checkout context. This is a version-specific plugin limitation,
not a statement that Gemini 3.1 inherently cannot accept live context updates.

[Current LiveKit documentation](https://docs.livekit.io/agents/models/realtime/gemini/#gemini-31-compatibility)
requires Google plugin **1.8.2 or later** for Python 3.1 mid-session updates;
older versions may ignore updates or close the connection with error 1007. It
also documents migration from `thinking_budget` to `thinking_level`; the current
worker hardcodes `ThinkingConfig(thinking_budget=0)`. The compatible 3.1 setting
is `minimal` or omission of the thinking override. Synchronous tool responses
still block continuation, so changing models does not remove slow receipt paths.

[Google's current 3.1 page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview?hl=en)
now labels it a **legacy preview** and recommends Gemini 3.8 Live for most
low-latency voice agents. Consequently evaluate current model options rather than
calling WhiteRock's source default the newest choice. Any migration needs
compatible pinned SDKs, model-specific config and regression/latency comparisons;
preserve the working 2.5 configuration as a control. No package, model, private
environment, provider session or cloud configuration changed in this clarification.

The Platform client pins the same AvatarKit 1.3.9, RTC adapter 1.1.5 and LiveKit
client 2.22.3 as DOPAMINE. Onchain declares version ranges; that alone does not
identify its installed/runtime versions. There is no evidence here that a newer
avatar SDK accounts for the perceived difference.

## Adapted locally

1. **Prepare public assets during browser idle time.** After an enabled, supported
   Spatius configuration arrives, warm the existing cached SDK/avatar loader.
   An idle callback yields to storefront work; a 1.5-second timer is the fallback.
   Automatic warming skips a hidden document and the browser's data-saving mode;
   intentional hover/focus/click still prepares normally. It never creates an
   AvatarView, requests a microphone or allocates a voice room. The browser
   performance mark `archava-avatar-preloaded` records asset readiness, not a
   rendered face or active call. This trades background bandwidth/memory for
   less asset work after a later click; an immediate click still shares the load.
2. **Prepare the visible face and microphone permission concurrently.** A fresh
   readiness check still comes first. The face can render while a permission
   prompt remains unanswered. Allocation waits for both a real first frame and
   granted microphone access. Denial opens the existing permission error; late
   permission after Disconnect releases tracks and never starts a room. Chat,
   minimize, launcher and checkout behavior are preserved.
3. **Separate marketplace receipt from model history synchronization.** Once the
   exact guest/page/revision packet is validated and accepted, publish its ACK
   independently of `update_chat_ctx`. The context tool already has the accepted
   state. Slow model synchronization no longer delays this navigation receipt;
   conversely a blocked/failed ACK cannot block context synchronization. Both
   tasks remain tracked and cancelled on worker shutdown. An ACK does not prove
   Gemini has processed history or that a cart/payment operation succeeded.

Implementation: `archava/src/App.tsx` and `archava/backend/agent.py`.

## Useful patterns and limits in the references

- **Onchain/Platform:** public asset warming and a small, focused assistant are
  useful. Their startup source allocates a room before proving the visible first
  frame, and the renderer path does not await that frame before player setup.
  Keep DOPAMINE's verified first-frame gate instead of transplanting that order.
  Their narrower tools do not replace commerce knowledge, preview, fresh consent
  and signed checkout receipts.
- **WhiteRock:** one data listener avoids duplicate actions; bounded provider
  retries and explicit degradation are understandable choices for that product.
  DOPAMINE already uses scoped listeners and bounded protocols. WhiteRock can
  fall back to a fresh voice-only session when Tavus fails, so availability there
  does not necessarily mean its face succeeded. Do not silently remove this
  user's requested avatar. Its broad URL messages, wallet and booking tools are
  not suitable replacements for the store's allowlisted actions.
- **DOPAMINE:** keep frame-by-frame native audio, the cached loader, worker warm
  process, persistent rendered canvas and receipt/consent checks. No whole-sentence
  audio buffer was introduced here. No model/provider/VAD/jitter-buffer/region
  change is justified by source inspection alone.

## Validation and remaining measurement

Fresh checks passed: 3 catalog and 86 module Node cases, 35 Python unit cases,
16 offline SDK cases, production build, standalone module export (122 source
files, no unexpected runtime paths), shopping browser QA (17 scenarios each
at 1440/390/320), and seven real renderer scenarios in Brave. The SDK regression
deliberately holds model context synchronization open and requires exact
navigation ACKs to arrive anyway; foreign guest packets are still ignored.
Browser regressions use real public avatar assets while intercepting all session
allocations: zero provider rooms, RTC sockets or unintercepted POSTs. They cover
pending/denied/late microphone permission and the previous graphics/retry/
cancellation cases. Normal and microphone-wait screenshots were inspected.

The single preloaded normal run measured **528 ms from the harness click to the
first-frame console callback**. This is local, after asset readiness, with a
fixture configuration and intercepted session API. It is not a before/after A/B,
an immediate cold-click guarantee, a live-call startup time, or voice latency.
Other modes deliberately change permission/graphics timing and are not comparable
speed samples. Detailed reports are in the ignored comparison evidence directory.

This change removes known serial work in startup and navigation acknowledgements.
It does **not** establish improved human speech-to-audible-answer latency, solve
the previously observed checkout receipt timeout, or update the deployed service.
The next meaningful comparison uses the same device/network, separates greeting,
no-tool replies and commerce actions, and measures microphone stop to browser
playback alongside tool receipts and RTC failures. Prompt/model trials must retain
catalog truth and fresh confirmation. Existing measured limits and the proposed
measurement plan remain in [the latency research](../archava/docs/LATENCY.md).

## Source map

- `Archava_onchain/src/App.tsx`, `src/components/SpatiusAvatar.tsx`,
  `backend/agent.py`, `backend/instructions.py`.
- `Archava_Platform/Archava Template/src/App.tsx`,
  `src/components/SpatiusAvatar.tsx`, `backend/agent.py`, `backend/instructions.py`.
- `Archava_WhiteRock/backend/agent.py`, `backend/prompts.py`,
  `src/components/ai_avatar/AvatarVoiceAgent.jsx`.
- This repository's equivalent files, `archava/src/lib/spatius.ts`, installed
  provider SDK source and sanitized metadata under the ignored
  `.logs/reference-comparison-20261018/` directory. No private env contents belong
  in this report or the module export.
