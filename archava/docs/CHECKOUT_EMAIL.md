# Optional sandbox payment receipt email

October 19, 2026 Asia/Jakarta (October 18 UTC): deployed after explicit user
approval. Actual public UI/API → Midtrans sandbox simulator settlement →
background Spacemail submission → signed `accepted` status passed. The user
confirmed the selected Gmail recipient received the single test message in
**Spam**. Inbox placement remains an open deliverability issue. No real funds,
fulfillment or voice session were used in this test.

## User journey

1. Review the server-priced checkout card. Ava acts as a concise shopping
   adviser and cashier: review the selected items, quantity, example shipping
   and total, then ask for a fresh confirmation before creating a sandbox QR.
2. Optionally enter a receipt address in the card and explicitly confirm it.
   The dedicated `POST /api/checkout/email` endpoint accepts only the signed
   draft capability, one email address and `consent: true`. No recipient is
   inferred from the conversation or the storefront's separate demo form.
3. Create and settle the QR **only through the official Midtrans sandbox
   simulator**. The backend verifies order ID, total, currency, payment type,
   transaction ID and settlement using Get Status. User statements and browser
   status claims cannot authorize mail.
4. The registered receipt enters a durable outbox after verified settlement.
   A background task invokes a bounded Python SMTP process. The voice worker
   never performs SMTP, and payment responses do not wait for mail submission.
   Storage/status calls still have their own latency; this is not a zero-delay
   or voice-latency guarantee.
5. Ava sees only the fresh signed payment/email status. `accepted` means the
   SMTP server accepted the message; it does not establish inbox placement.

The message contains branded HTML and plain text, server-priced item lines,
example shipping, total and order reference. It clearly says **SIMULASI** and
is **not a tax invoice**. There is no PDF invoice attachment, real purchase,
fulfillment, Gmail account access, campaign or newsletter subscription.

## Private configuration

Keep these settings only in the ignored runtime `.env` or mounted secret:

```dotenv
CHECKOUT_EMAIL_ENABLED=false
SMTP_HOST=mail.spacemail.com
SMTP_PORT=465
SMTP_USER=sender@example.com
SMTP_PASS='mailbox-password-goes-here'
SMTP_FROM=sender@example.com
SMTP_USE_SSL=true
CHECKOUT_EMAIL_BUCKET=
CHECKOUT_EMAIL_STATE_DIR=
```

For Spacemail, use the **mailbox password**, not the Spaceship account password.
The provider documents full mailbox username, `mail.spacemail.com`, port 465
and SSL. View the mailbox's configuration in Spacemail webmail Settings →
IMAP/SMTP/POP3 → See configuration; ensure SMTP access remains enabled.
[Official Spacemail configuration](https://www.spaceship.com/en-GB/knowledgebase/connect-spacemail-to-email-client/).
Do not echo passwords into terminals, chat, screenshots or generated archives.
The real sender address is not part of this source example.

Enable only when credentials, payment verification and storage are ready.
`SMTP_USE_SSL=false` requires verified STARTTLS before authentication; plaintext
authentication is never used. Python's default TLS certificate verification
remains enabled. The child receives only SMTP-related configuration and its
private payload through stdin, never through process arguments.

## Durability, privacy and cloud activation

Local execution uses encrypted records under `archava/.state/checkout-mail/`,
or `CHECKOUT_EMAIL_STATE_DIR`. Runtime state is ignored by Git, build contexts
and standalone exports. SMTP secrets are never included in an outbox record.
The recipient is retained in the encrypted server record, not in browser
storage, model history, navigation URLs, Midtrans payloads or signed receipts.

Cloud Run requires `CHECKOUT_EMAIL_BUCKET`. The container filesystem is
ephemeral, so the feature deliberately remains unavailable there without a
durable bucket. Records use AES-256-GCM with an order-bound authenticated
identifier derived from the shared checkout key. Keep the checkout signing key
stable across revisions; rotating it makes previous outbox records unreadable.

An authorized cloud activation needs:

- One dedicated private bucket in the runtime region, with public access
  prevention and uniform bucket-level access. Do not reuse the build-source
  bucket for recipient records.
- Runtime service-account permission to read/list/create/replace objects only
  in this bucket. The GCS adapter uses runtime metadata credentials and
  generation preconditions; it requires no downloadable account key.
- An explicit retention/lifecycle decision. Queue records are valid for 24
  hours; seven-day object expiry can bound retained recipient data for this
  sandbox demo. The demo accepts at most 1,000 retained records and does not
  automatically delete local records. Monitor capacity; do not delete an
  active claim to force a resend.
- A new mounted runtime secret version containing SMTP settings,
  `CHECKOUT_EMAIL_ENABLED=true` and the bucket name, preserving every existing
  model/provider setting. The current supervisor supports SMTP password
  redaction. The bootstrap deployment script is not an updater for an
  existing service.
- A source image rollout preserving the existing worker namespace, origin,
  resource limits, probes and CPU allocation. Check active calls first and
  retain the previous image/secret pair for rollback. Rollback does not cancel
  an email already accepted by SMTP.

The current always-allocated Cloud Run CPU supports the background scanner.
It scans every two seconds and checks waiting orders at most once per 15
seconds per record. Storage operations and existing instance CPU consume GCP
quota/credit; this is not permanent free hosting. If this becomes a larger
production system, replace the bounded demo scanner with a proper durable
job queue and transactional order storage.
[Cloud Run filesystem contract](https://docs.cloud.google.com/run/docs/container-contract#file_system),
[GCS generation preconditions](https://docs.cloud.google.com/storage/docs/request-preconditions).

For the current host, the prepared activation targets project
`dopamine-commerce-archzxy`, existing service `dopamine` in `asia-southeast1`,
and a new dedicated bucket `dopamine-commerce-archzxy-checkout-mail`. Its proposed
lifecycle deletes objects after seven days, with no public access. Grant the
existing runtime account `roles/storage.objectUser` on this bucket only. Build
the source, create a new runtime secret version by merging only the email
settings into the existing version, and deploy the image/secret pair together.
Preserve Gemini 3.8, all session limits, CPU/scaling and existing configuration.
The user approved and this plan was executed. Build/storage operations consume
the project's trial credit. Cloud Run revision `dopamine-email-20261019` uses
runtime secret version 4; image digest is
`sha256:da86087b512e115de5bd61199c5de0af3455b33af3ff668e61720d6a188bda60`.
Readback confirms unchanged model, public env, resources, account, probes,
concurrency, timeout, scaling and secret mount path. The prior image/secret
pair is revision `dopamine-gemini38-20261018` / version 3. The seven-day lifecycle
is measured from creation of each replacement object generation; soft delete
is disabled for this dedicated demo bucket.

Passive DNS checks found one SPF record authorizing Spacemail and a DKIM key
at the provider's documented selector. No DMARC record was returned. Record
presence does not prove that the particular Gmail message passed SPF/DKIM, or
that missing DMARC alone caused Spam placement. Inspect the received message's
authentication results to confirm. A basic monitoring-only DMARC TXT record at
`_dmarc` can use `v=DMARC1; p=none`; DNS has not been changed by this task.
See [Spacemail's DNS guide](https://www.spaceship.com/knowledgebase/spacemail-dns-records-third-party-domain/)
and [Gmail's sender guidance](https://support.google.com/mail/answer/81126?hl=en).

## Delivery states and recovery

| Email status | Meaning |
| --- | --- |
| `unavailable` | Flag, SMTP settings or durable cloud storage missing |
| `not_requested` | No confirmed recipient for this order |
| `waiting_payment` | Recipient recorded; verified settlement is still required |
| `queued` / `sending` | Verified paid, awaiting or attempting SMTP submission |
| `accepted` | SMTP accepted DATA; inbox/spam placement remains unverified |
| `failed` | Submission failed or the receipt expired; payment remains independent |
| `unknown` | Submission or storage outcome is uncertain; no automatic resend |

Each order freezes its explicitly confirmed recipient. Concurrent polls and
workers must acquire the same durable CAS claim **before** contacting SMTP.
Restart after a claim never automatically sends again. A stale `sending` claim
is reported `unknown` after one minute. This favors avoiding duplicates over
retrying a possibly delivered message; SMTP cannot provide exactly-once inbox
delivery. A failed or uncertain email never changes a verified paid state or
creates another payment. Background status reconciliation continues even if
the browser closes; after a prolonged outage beyond 24 hours, a waiting record
expires without mail.

## Verification

Tests cover exact consent, recipient validation and freezing, paid-only
delivery, malformed/foreign requests, signed v1/v2 receipts, independent SMTP
failure, concurrent claims, restart, uncertain-delivery suppression, encrypted
state and GCS generation conditions. The full HTTP integration uses the real
Python helper and a task-owned certificate-verified TLS SMTP server, with a
synthetic payment provider. It submits exactly one fixture letter across a
restart; it sends nothing to an external address.

`scripts/checkout-browser.mjs` in the host workspace exercises actual UI/API at
1440/390/320 px with fake payment and mail transports, checks recipient consent,
waiting/paid/accepted states, reload/order reuse, no address in browser storage,
no unexpected request fields, overflow and JavaScript errors. Fixture servers,
browsers and temporary state are closed afterward. These checks do not establish
Inbox placement or complete spoken checkout. The later real cloud test established
SMTP acceptance, encrypted runtime-account storage, verified sandbox settlement
and same-order accepted status after reload. The user separately reported receipt
in Spam. No email was automatically resent. Run the module's Node, Python,
SDK integration, production build and export checks described in its AGENTS.md.
