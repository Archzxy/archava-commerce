# Shopping assistant features

All six additions are implemented in the KALA widget and Python agent. Local
checks use the real storefront, cart adapter, DOM actions, and tool SDK with a
simulated agent transport. Live startup, rendering, and audio playback have been
checked; microphone recognition and all six spoken flows need a full rehearsal.
Public deployment is pending.

Clicking **Tanya Ava** opens the compact panel and starts the call immediately;
there is no second start button. Microphone, Chat, and Disconnect sit directly
below the avatar. Chat starts closed. The launcher is hidden whenever the panel
is open and returns, with keyboard focus, after minimizing or disconnecting.
Chat expands/collapses text conversation and shopping details. Closing details
or minimizing never disconnects the active room or
remounts the avatar. Recommendations/cart previews reveal details when needed;
saved summaries are available there after a call. Text and voice transcripts
are displayed only in the optional chat and remain in memory for the active
session. The compact panel is 300 px on desktop and up to 280 px on mobile;
the expanded panel is up to 390 px with viewport limits.

Disconnect closes the panel and ends the owned session. It can also cancel
startup: a ticket returned after cancellation is ended without mounting a room
or connecting a websocket. Duplicate clicks do not allocate duplicate sessions.

Startup follows the current official
Spatius RTC contract: render the visible view and wait for its first-render
callback, allocate the voice session, create the player, attach it, connect the
room, then enable the microphone. The same view survives session allocation.
The earlier
Platform/Onchain reference attaches before the view is ready and is not the
source of truth for this ordering. See `docs/INTEGRATION.md` for official links.
No PNG capture, manual WebGL context, quality override or cache reset is used.
The first-render deadline closes stalled calls through normal session cleanup.

The one-click UI passed a live Brave check: the face rendered, all three
controls were visible, microphone mute/unmute worked, and opening/closing chat retained the
same avatar canvas and unsent draft, a typed message appeared in chat, and
minimize/reopen kept the call active. There was one session request and one
LiveKit websocket through all toggles, with no page errors. Compact active
panels measured about 300×436 px at desktop and 280×410 px at 390/320 px
viewports. The launcher was hidden throughout the open-panel state, and
Disconnect closed the panel.

The render-first revision passed another live Brave check: the renderer's
first-frame receipt preceded the session POST, and its exact canvas remained
mounted through allocation, microphone enablement, Chat, minimize/reopen and
mobile resizing. That run used one session and one LiveKit websocket, with no
page errors. Separate intercepted-session regressions passed all four cases:
normal graphics, cached-false probe, same-page graphics recovery/retry, and
Disconnect during failed rendering. The SDK's own delayed blank-canvas check
reported no blank frame in the successful cases; screenshots were inspected.

A subsequent same-page restart check also passed: Disconnect disposed the first
view, and a second click rendered a new view before allocating the next call.
The live check completed two successive sessions on that page, with one socket
per call and no page errors. Mic, optional Chat, minimize/reopen and mobile sizing
continued to work. The intercepted-session runner retains this restart case.

Local rebuilds retain previous hashed chunks so already-open pages can finish
loading their lazy avatar imports. The host revalidates static files with
`Cache-Control: no-cache`. This protects against a rebuild/load race; it does
not establish the cause of a particular failure in the user's browser.

Graphics readiness uses the actual first frame, without a separate capability
gate. AvatarKit 1.3.9 caches its probe for the page lifetime, including a false
result. A fault-injection regression reproduced a cached `isDeviceSupported()`
false even after graphics recovered and the real avatar rendered at 518×411.
The old host gate turned that result into AV-G1 before trying the renderer.
Repeated clicks could never escape the cached false. That gate and its AV-G
codes have been removed. This proves a retry defect; the user's initial probe
failure still has no confirmed cause. See `docs/LATENCY.md` for research evidence.

An isolated renderer test loaded the exact SDK/WASM from Archava Onchain with
KALA's public avatar IDs, without a LiveKit room. In headed Brave with the GPU,
the SDK support check passed and the first frame rendered (518×411). With
GPU rendering disabled, the SDK returned false. Neither case created a session.
The production widget then passed a live headed Brave check at DPR 1.2:
first frame before LiveKit connection, visible 432×388 canvas, active microphone,
answering state/audio playback, and retained image after minimize/reopen. There
were no page errors. The earlier GPU-disabled startup showed AV-G1 with no
session request. The current flow instead tries the real renderer and only
allocates a room after its first frame.
The user subsequently confirmed the renderer correction worked in their own
browser. The compact UI was verified separately in the controlled Brave run
described above.

| Feature | Behavior | Tool or source |
| --- | --- | --- |
| Editable needs | Visible budget, purpose, query, category and priority. Voice tools or the form correct them; changed constraints invalidate the shortlist and cart preview. | `update_shopping_brief`, `src/lib/assistant.ts` |
| Product guidance | Scroll to a card, price or known comparison attribute. Open details/specifications when needed. Mobile minimizes the panel to show the page. | `focus_shopping_product` |
| Spoken filters | Apply query, category, price range and sort to the actual catalog URL. Failed navigation does not report success. | `filter_shopping_catalog` |
| Recommendation cards | Display 1–3 ordered products with catalog prices, budget/priority facts, use cases and tradeoffs. Reject cards above the saved budget. | `show_shopping_recommendations`, `ShoppingWorkspace.tsx` |
| Confirmed demo cart | Preview item, quantity and amount first. A button or fresh explicit user confirmation applies the addition. Undo preserves unrelated items and refuses to overwrite manual edits to the same item. | `request_cart_add`, `confirm_cart_add`, `cancel_cart_add`, `undo_cart_add`; host `window.kalaCart` |
| Session summary | Display needs and shortlist in optional details after the call. Restore them after reload in the same tab for up to 24 hours. | `endShoppingSession`, `App.tsx` |

## Protocol and outcomes

The original section/revision and marketplace/page contracts remain intact.
Additional state travels on `archava.assistant.state`: bounded needs, approved
catalog IDs, cart IDs/quantities, pending preview, undo availability and a
monotonic revision. The worker reconstructs product facts from the catalog;
preference text is data, never instructions.

Actions use `archava.assistant.action` with a unique request ID and strict
action-specific fields. The frontend binds actions to the voice agent identity.
Results use `archava.assistant.result` and carry the resulting browser state.
The worker accepts only its bound guest and matching pending request IDs; older
receipts cannot overwrite newer state. Missing receipts return `unknown` and
the model must inspect state before retrying or claiming success.

Duplicate requests reuse their receipt. Pending cart confirmation lasts 120
seconds, and session end or changed needs clears it. Voice consent checks actual
user history after an assistant proposal; model arguments cannot supply consent.
Delayed or ambiguous speech can use the confirmation button. Expired/replaced
proposals, changed cart quantities and quantity/stock limits are rejected.

The stored summary contains only `brief`, `recommendationIds`, and `savedAt`.
It excludes transcripts, tokens, pending cart operations, undo receipts and
checkout fields. When browser storage fails, the visible cart remains usable
in memory for the current page lifetime. Cart changes are local demo actions,
not orders or payments.

## Local verification — 15 October 2026

The current checks pass: 75 Node tests, 25 Python tests, 13 SDK integration tests,
and the TypeScript/Vite build. Seventeen browser scenarios run at each of 1440,
390 and 320 px, including one-click startup, cancellation with a late ticket,
launcher hiding/restoration, focus return, compact sizing and optional detail toggling. They
exercise filtering, product/specification highlights, comparisons, cards,
preview/confirmation, duplicate delivery, manual edits, undo, corrected needs,
summary/reload, storage failure, checkout cart totals with recipient fields preserved, and the shipped widget with providers disabled.
These are implementation checks; they do not establish live speech quality.

Run from the marketplace workspace root:

```bash
npm test
PATH="$PWD/archava/.venv/bin:$PATH" npm run test:agent --prefix archava
archava/.venv/bin/python archava/backend/integration_tools.py
archava/.venv/bin/python archava/backend/integration_worker.py
npm run build
```

The host's `scripts/assistant-browser.mjs` starts an isolated marketplace-only
server and injects a simulated agent transport. Screenshots go to the ignored
`.logs/assistant-browser/` directory. It is a host integration runner and is not
included in the standalone widget export.

Playwright is optional test tooling and can be installed outside source:

```bash
npm install --prefix /tmp/kala-ava-browser-tools playwright
PLAYWRIGHT_MODULE_PATH=/tmp/kala-ava-browser-tools/node_modules/playwright/index.mjs npm run test:browser
```

Install Playwright's Chromium if absent; `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can
select an already installed browser executable.

`scripts/avatar-browser.mjs` exercises the shipped renderer in isolated Brave
profiles using public avatar assets. It intercepts every session allocation,
so it creates no provider rooms. It covers normal rendering, a false capability
probe, graphics recovery with the same-page retry, cancellation, and first frame
before allocation. Run `npm run test:avatar` from the host with the same optional
Playwright module/executable environment variables. Screenshots and report go
to `.logs/avatar-browser/`; this host runner is outside the standalone export.

## Live rehearsal still needed

Start the normal runtime with configured providers and available credits. Test:

1. "Cari dan tampilkan headphone buat kerja, budget 500 ribu, prioritas baterai."
2. "Urutkan yang paling murah."
3. "Budget naik jadi 600 ribu. Tampilkan pilihannya lagi."
4. "Tunjukkan baterai pilihan kedua."
5. "Masukkan yang kedua satu ke keranjang."
6. "Ya, tambahkan."
7. "Batalkan penambahan yang barusan."
8. Close/reopen chat and minimize/reopen Ava during the call; voice and the same avatar should continue.
9. Disconnect, reopen Ava and Chat to inspect the saved summary, and reload the same tab.

Verify recognition, tool choice, actual visible outcomes, spoken claims and
latency. Offline SDK/browser tests do not establish that a live model will
choose every tool correctly.
