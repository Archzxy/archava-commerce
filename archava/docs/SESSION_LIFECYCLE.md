# Conversation lifecycle

October 19, 2026 Asia/Jakarta: deployed to Cloud Run after the user explicitly
approved the rollout. Revision `dopamine-completion-20261019` receives 100%
traffic, using build `93eea172-0169-4885-bb78-3a931a415ad0`. Runtime readback and
both public origins confirm `SESSION_SECONDS=0`, enabled/ready sessions and
HTTP 200 for the storefront, checkout, health and config. The mounted secret
remains version 4; all unrelated runtime settings were preserved. No voice
session or actual long-call/farewell provider test was started for this rollout.

`SESSION_SECONDS=0` is now the source/example default and the ignored local
runtime setting. It means no fixed application deadline. Optional values
30–1800 retain the previous bounded behavior. Existing deployment environment
values override the new default, so changing source alone does not activate it.

In completion mode, `/api/config` reports `sessionSeconds:0`; session responses
and scoped room metadata contain `endsAt:null`. The browser hides its countdown,
the worker creates no duration timer, and the API does not expire active rooms
because time passed. Exact project/provider/guest metadata validation, named
dispatch, limited microphone grants and a maximum five-minute **join** token
remain. Join-token expiry is separate from the lifetime of a connected call.

The pinned LiveKit `EndCallTool` adds `end_call`. Prompt and approved assistant
knowledge direct Ava to use it after a resolved task when the visitor is done,
or on an explicit stop request. If closing intent is unclear, she checks once
whether any help is still needed. An intermediate thanks, cart addition,
recommendation, QR, silence, minimize or closed Chat does not finish the task.
Pending/unknown commerce outcomes remain unconfirmed. Closing never clears
the cart, cancels payment or claims payment/email success.

The tool writes server-owned `archavaSession.status=ending`, generates a brief
Indonesian goodbye, waits for speech completion, shuts down the session/job and
deletes its room. The pinned tool also handles Gemini's separate spoken tool
reply. The browser uses that metadata to distinguish deliberate departure from
a lost agent; it stays connected while the goodbye plays. Explicit Disconnect
still ends/cancels immediately.

RoomIO binds to the exact guest and deletes the room on session close. Failed
avatar startup retains its public error for up to 60 seconds in completion mode,
then deletes the room. The ten-second API sweep closes owned rooms without their
guest after a 60-second join grace, including after API restart. Active guests
are not timed out by this sweep. Missing rooms release ticket admission slots;
recovered active rooms count toward capacity. Admissions remain intended for
one API replica, and provider cleanup failures retry on the next sweep.

Gemini context compression is enabled; the installed plugin already serializes
session resumption handles and reconnects on GoAway. This follows the
[Gemini session guide](https://ai.google.dev/gemini-api/docs/live-api/session-management).
Farewell lifecycle follows the installed implementation and
[LiveKit EndCallTool documentation](https://docs.livekit.io/agents/prebuilt/tools/end-call-tool/).
Removing the application's timer does not guarantee uninterrupted provider
availability, quotas, avatar credit or unlimited conversation length. Prompt
instructions and mocked SDK tests do not prove actual model closing decisions.

Remaining live acceptance: speak through a useful
task beyond two minutes, verify the call remains connected, preserve pending
checkout/help, then say "makasih, selesai" and verify the complete goodbye,
closed panel, deleted room and restored slot. Also check minimize, manual
Disconnect, abandoned startup and unexpected connection failure. These live
cases were not performed in this deployment task.
