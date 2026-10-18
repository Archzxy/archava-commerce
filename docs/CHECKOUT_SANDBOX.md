# Ava checkout demo

October 18, 2026. Source supports Midtrans QRIS **sandbox only**. The user has now
created an account and privately saved its replacement key. Its full credential
authenticated against Sandbox Get Status. Private env quoting and runtime secret
version 2 are installed in Cloud Run revision `dopamine-midtrans-20261018`.
**Actual sandbox verification passed:** the deployed card showed preview, created
a real provider sandbox QR and displayed its image, then reached `paid` after the
official simulator payment. Backend polling retained the same order ID and the
cart stayed unchanged. No real funds/order/fulfillment occurred. Without a key,
the implemented unavailable state remains supported.

One real avatar/Gemini typed request successfully opened the configured preview.
Other live attempts encountered RTC disconnects; full human voice checkout and
automatic spoken success remain unverified. See the handoff for this boundary.

Earlier checkpoint: deployed to `dopamine-checkout-20261018` before activation. One
actual avatar/Gemini session with typed checkout input verified the unavailable
card, closed Chat, preserved canvas, visible controls and Disconnect. It did not
call Midtrans or establish human speech/QR/payment behavior.

## User journey

1. Add demo products through the existing cart confirmation flow.
2. Say “lanjut checkout” to Ava (`prepare_checkout`), or open `/checkout` and click
   **Checkout QRIS sandbox**. This opens a separate card; Chat stays optional.
3. Review items, demo shipping and server-calculated total. Ava needs a **new**
   explicit confirmation after that review, or use the card confirmation button.
4. When configured, `confirm_checkout` creates/reconciles the same sandbox order.
   The card displays its QR, total, expiry and simulator link.
5. Copy the QR image URL into the **official Midtrans simulator**. Never scan or
   pay with a real banking/wallet application. Sandbox references can accept real
   funds in the provider's separate real environment.
6. The backend checks Midtrans Get Status. Only verified `settlement` becomes
   `paid`; Ava calls it **pembayaran simulasi berhasil**. No real order, shipment,
   inventory reservation, cart clearing or fulfillment occurs.

The recipient form remains a separate local preview. Checkout API requests
contain item IDs, quantities and shipping choice, or an opaque draft capability.
Recipient/contact fields are not sent to Ava or Midtrans.

## Operator configuration

Create a merchant account yourself at [Midtrans Dashboard](https://dashboard.midtrans.com/),
switch to **Sandbox**, and obtain its **Server Key** in the dashboard's access-key
settings. Save it as `MIDTRANS_SERVER_KEY` in ignored `archava/.env`. The observed
Sandbox dashboard can issue `Mid-server-…` without `SB-`; both formats are
accepted. Source validation accepts bounded visible ASCII symbols, excluding
control characters and the Basic-auth colon separator. Preserve all key symbols; quote its `.env` value when needed,
and verify the parser returns the full value. A prefix does **not** prove the environment. Calls are always
pinned to `api.sandbox.midtrans.com`; Midtrans authenticates the key for that
environment, with no production fallback. The format correction and
runtime secret version 2 are deployed. No Client Key is required for
this server-side Core API flow. Never send keys in chat or commit them.

Cloud Run uses its existing Secret Manager mount, not the local `.env`. Installing
the local key alone does not enable cloud checkout. An authorized operator must
add it to a **new version** of the existing runtime secret and update the mounted
version, preserving all existing credentials, origins, project and VAD settings.
Do not put credentials in deploy command arguments or change a global CLI profile.
After rollout, verify one actual sandbox QR and simulator settlement before
claiming provider integration works.

`CHECKOUT_SIGNING_KEY` optionally supplies a dedicated shared secret for Node and
Python. Blank derives an HMAC key from `LIVEKIT_API_SECRET` with a checkout-specific
purpose string; neither secret reaches the client. Rotation invalidates saved
drafts/receipts. Keep the key identical across instances/revisions for recovery.

## Protocol and limits

October 18 local addition: optional confirmed-recipient receipt mail, a signed
v2 receipt with `emailStatus`, and a background encrypted outbox. Activated on
the cloud at the October 19 Asia/Jakarta checkpoint; actual simulator settlement
and SMTP acceptance passed, and the recipient reported Gmail Spam delivery. See
[receipt email setup and evidence](../archava/docs/CHECKOUT_EMAIL.md).

- `POST /api/checkout/draft`: exact `{items:[{id,quantity}], shipping}`. Maximum
  12 distinct items, quantity 1–10 subject to demo stock, total at most IDR 100M.
  Prices and demo shipping come from the server catalog, never caller amounts.
- `POST /api/checkout/confirm`: exact `{token, confirmed:true}`. An immutable
  signed preview is chargeable for 5 minutes; requested QR expiry is 15 minutes
  from preview creation. The provider's status remains authoritative.
- `POST /api/checkout/status`: exact `{token}`. Status can be reconciled for 24
  hours, including after an API restart. No unauthenticated mark-paid endpoint.
- `POST /api/checkout/email`: exact `{token,email,consent:true}`. The address is
  frozen for that draft and returned only as an email status, never as a contact
  field. Registration does not create a payment or submit mail before settlement.
- Draft capability lives only in memory/sessionStorage on the same tab, saved
  before charge and sent in POST bodies. It is not in URLs, logs or model context.
  A browser reload restores the capability and rechecks the server, never restores
  a client-provided paid status. Clearing site data loses this recovery handle.
- Sandbox origin is pinned and redirects are rejected. Key-format validation
  rejects malformed/client keys; the provider checks environment authorization. No real
  customer details are included. Ambiguous errors remain `unknown`; retry first
  checks the **same order ID**. Provider order-ID uniqueness covers process races;
  an in-process lock also serializes confirmations.
- Status is polled every 8 seconds while the pending/unknown card is visible.
  Closing the card stops polling; reopening or `get_checkout_status` refreshes it.
  Closing, minimizing or Disconnect does not cancel a provider transaction.
- A changed cart requires review before confirmation. An existing pending/unknown
  invoice keeps its frozen items; do not silently replace it with another payment.
- New topics `archava.checkout.action`, `.result`, `.state` preserve the existing
  assistant/cart protocol. Exact agent/guest identity, request IDs, bounded schema
  and monotonic revisions are checked. The Python worker verifies the Node HMAC,
  project, receipt purpose, arithmetic and 30-second freshness before using facts.
  Receipt fields contain no recipient details or private draft token.
- Sandbox settlement is observed by polling Get Status, not browser claims or an
  unverified webhook. There is no fulfillment database or production payment API.

## Verification

Backend and SDK tests use injected provider fakes. `scripts/checkout-browser.mjs`
uses the actual storefront/widget/API at 1440/390/320 px with a synthetic provider
and a deliberately non-QR image fixture. It checks unavailable → review → pending
→ verified simulated-paid UI, reload/order reuse, privacy and overflow. These are
**offline tests**, not evidence Midtrans accepted a transaction or Ava spoke live.
All task-owned fixture servers and browsers close in `finally`.

Run `npm test`, Python unit/SDK checks from the handoff, and `npm run build`.
For browser QA use the existing installed Playwright module and Chromium, e.g.
`PLAYWRIGHT_MODULE_PATH=/absolute/path/to/playwright/index.mjs node scripts/checkout-browser.mjs`.
Optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` selects an installed browser. Artifacts
are ignored under `.logs/checkout-browser/`; no account or real payment is needed.

Primary references checked October 18:
[QRIS charge API](https://docs.midtrans.com/reference/qris),
[Get Status](https://docs.midtrans.com/reference/get-transaction-status),
[custom expiry](https://docs.midtrans.com/reference/custom-expiry-object),
[authorization](https://docs.midtrans.com/docs/api-authorization-headers),
[sandbox testing and real-payment warning](https://docs.midtrans.com/docs/testing-payment-on-sandbox),
[current QRIS simulator](https://simulator.sandbox.midtrans.com/v2/qris/index).
