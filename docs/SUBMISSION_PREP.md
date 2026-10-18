# Prototype submission preparation

**Repository update, October 19:** the latest source is pushed to
[Archzxy/archava-commerce](https://github.com/Archzxy/archava-commerce), now
**PUBLIC** and verified through anonymous repository and commit API reads.
GitHub Repository checks passed on the source commit. The generated PDF/PPTX
still contain their earlier access-pending wording; artifact regeneration and
portal submission remain separate. The private-repo statements in earlier
preparation checkpoints below are historical.

**Form update, October 19:** the user supplied a screenshot with the actual Cloud
Run URL, repository URL and a Drive folder in the demo-video field, then supplied
the exact URL as text. Slide 12 now links to that folder; an anonymous request
returned 200 with video MIME metadata and no sign-in redirect. Playback and
duration remain unverified. A fresh authenticated GitHub read still reports
the repository **PRIVATE**. New October 19 PDF/PPTX files are in
`output/submission/dopamine-2026-10-19/`; the PDF is 13 pages / 686,911 bytes.
The original October 18 artifacts are preserved. A refreshed **841-character** English description
includes the deployed private Cloud Storage receipt-email path and is also
saved as `output/submission/dopamine-2026-10-19/BRIEF_DESCRIPTION.txt`.
No repository visibility change, upload or portal submission occurred.

**Artifact update, October 18:** the requested 13-slide PDF and editable PPTX have
now been prepared from the actual organizer template. See [PITCH_DECK.md](PITCH_DECK.md)
for paths, section coverage, verification and remaining link fields. The PDF is
approximately 0.69 MB. Registered team details were supplied by the user. The
repository is still private and the video link pending; no upload/submission was
performed. The coordinated Gemini 3.8 release is now deployed, as recorded in
the current handoff. The preparation notes below predate those completed steps.

Checkpoint: **October 18, 2026**. Preparation only: no repository publication,
cloud rollout, recording, slide editing/upload or submission was performed.

The participant supplied new screenshots of the mandatory prototype instructions
and form, plus the [prescribed deck template](https://docs.google.com/presentation/d/13rg7vW43mEH6DkpuusAE6fdoEylSFz8waNpE4RLzoUg/edit).
The template's public PDF export was downloaded and its text inspected. Local
reference copy: `.logs/submission-prep-20261018/official-template.pdf` (ignored).
Edit a downloaded/copied version; do not request edit access to the organizer's
master. Keep the prescribed sections and remove instructional/empty material
from the final deliverable only where the template permits it.

## Required package and current status

| Deliverable | Preparation needed |
| --- | --- |
| Deployed GCP / Cloud Run prototype link | Existing deployment is available. Local audit fixes are not deployed; review/push and roll out the intended final revision, then verify the selected demo flow. |
| Deck following the prescribed template | Populate the actual sections below; export to PDF, at most 5 MB according to the supplied form. |
| Public GitHub repository | Latest source is pushed to `Archzxy/archava-commerce`; PUBLIC access is verified without sign-in. GitHub Repository checks passed on the source commit. |
| Working demonstration video | Record actual deployed functionality. Motion graphics may explain the concept/architecture; a motion-only mockup would not demonstrate the requested working functionality. No explicit manual-recording/facecam requirement was found in the inspected material. |
| Brief description | English draft below is within the form's 1024-character limit. Review current functionality against the final deployed revision. |
| Continued access | Portal says links, app, APIs and integrations must remain accessible throughout evaluation. Check links without sign-in and monitor provider credit/quota and worker availability. |

The portal screenshot shows 6 h 37 min remaining **when captured**; it does not
establish the current remaining time, deadline timezone, or permission to edit
after submission. Check the actual portal countdown before planning the final
upload. Finish artifacts and link checks before the cutoff.

## Prescribed deck sections

The inspected template asks for:

1. Team details: team name, leader and selected problem statement.
2. Brief about the idea.
3. Opportunities: differentiation, problem solved and USP.
4. Features offered by the solution.
5. Process flow or use-case diagram.
6. Wireframes/mock diagrams — optional.
7. Architecture diagram.
8. Technologies used.
9. Estimated implementation cost — optional.
10. Prototype screenshots.
11. Performance report/benchmarking.
12. Additional details/future development.
13. Public GitHub, demo-video and final-product links.

Use Retail & Commerce: Intelligent Customer and Business Experiences. Team
details must match the registered team; organization/account names do not prove
the registered team name. Describe commerce-specific work and the reused Archava
starter honestly. Reuse eligibility remains the separate question in the rules
ledger; this checklist does not clear it.

Show implemented architecture: browser storefront/widget ↔ Cloud Run Node APIs
and Python worker ↔ Gemini Live; LiveKit carries RTC; Spatius supplies avatar
motion/audio; confirmed sandbox checkout calls Midtrans. Secret Manager holds
runtime credentials. Label the catalog as demo data and the payment environment
as sandbox. There is no Firestore database in the current implementation.

For benchmarks, report the actual 3 catalog + 86 module Node + 35 Python + 15 SDK
checks, three browser widths and renderer tests with their offline/mock limits.
Actual provider QR/simulator settlement is a separate earlier cloud result.
Full human voice checkout and consistent E2E latency remain unverified. Do not
invent conversion uplift, sales, customers, an E2E response time or completed
spoken-payment announcements. Proposed business outcomes belong under future
validation, not measured results.

## Video format and evidence

Recommended production approach: short branded motion opening, actual app capture
for the core journey, then a concise architecture/results/closing segment.
This is an editorial recommendation; the inspected rules do not explicitly
approve a specific AI/motion tool. They require the working solution to be shown.
No facecam or a fully manual workflow recording was explicitly required.

Capture the real screen and actual Ava output for claims about voice interaction.
Human voice input can establish spoken interaction; clearly label typed input
or automation if that is what the recording uses. Synthetic narration is suitable
for explanations, but must not be passed off as the app's generated response.
Ordinary editing, captions, callouts and zooms can clarify the screen. Disclose
cuts/speed changes rather than presenting edited waits as measured low latency.

Suggested **3:00 master**, selected because it matches the deck's stated length
and the portal's lower bound. This does not resolve the conflicting public FAQ:

| Time | Content |
| --- | --- |
| 0:00–0:15 | Problem and DOPAMINE promise, brief motion opening |
| 0:15–0:35 | What Ava can do and a simple Google Cloud architecture explanation |
| 0:35–2:35 | Real demo: needs/budget → recommendations/comparison → explicit cart confirmation → checkout review → sandbox QR/status, only as actually verified/recorded |
| 2:35–2:50 | Measured verification and clearly labelled limitations |
| 2:50–3:00 | Product/repository links and closing |

Do not script an unsupported success into the demo. First rehearse one complete
journey on the intended device. If voice confirmation fails, fix it before
claiming a voice end-to-end journey; a clearly labelled button-assisted sandbox
checkout can show its actual implemented behavior.

**Duration conflict remains:** the new portal mandatory text and form require
3–4 minutes, the supplied deck says 3 minutes, while the
[public FAQ](https://aibuildercup.com/Faqs.html) still says under 3 minutes and
the [themes page](https://aibuildercup.com/themes.html) says 3 minutes.
There is no exact duration satisfying every literal statement. Seek organizer
clarification if possible; do not state that a formal amendment was verified.
Retain the editable recording/master so a 2:55 alternative can be exported if
the organizer confirms the FAQ limit. No message has been sent to the organizer.

Use an accessible YouTube/Vimeo/Drive link as supported by the public requirements;
verify playback without signing in. Prefer English narration/captions and deck
text, following the public submission-language requirement. If the product demo
uses Indonesian dialogue, add English subtitles; this improves accessibility but
does not establish an organizer exception to any language rule.

## Brief description — English draft

The following draft is **841 characters** including spaces, below 1024. Recount
after editing. Mention only services actually used; public requirements name
Google AI and deployment on Cloud Run **or** Firebase, and do not establish that
Firebase and Firestore must both be added. The supplied portal's broader wording
about those services remains worth clarifying if the organizer intends all four.

> DOPAMINE is an Indonesian conversational commerce prototype featuring Ava, a voice and avatar shopping assistant. Shoppers describe their needs and budget, compare catalog-grounded options, navigate products, and confirm cart changes before checkout. Google's Gemini Live API powers real-time conversation and tool selection. Google Cloud Run hosts the storefront, Node.js APIs, and Python agent worker. Secret Manager protects runtime credentials, while a private Cloud Storage bucket stores encrypted receipt-email records. LiveKit handles real-time communication and Spatius renders Ava. Checkout uses server-calculated demo prices, signed receipts, and QRIS through Midtrans Sandbox. After sandbox payment is verified, shoppers who opt in can receive an email receipt. The catalog is demo data; no real orders or fulfillment are created.

## Recommended next order

1. Freeze feature scope, finish one actual demo rehearsal and choose the truthful
   workflow to show. Preserve sandbox/consent boundaries.
2. Review/stage/push source and complete the authorized final cloud rollout.
   Verify the intended source version and links after rollout.
3. Populate the prescribed deck and capture screenshots from that revision.
4. Record real screen/audio, edit the motion/caption layer and export the video.
5. Export the PDF under 5 MB, verify video playback, repository access, prototype,
   API/worker and brief length in a signed-out browser. Check provider credits and
   expiry behavior for judge access.
6. Review the participant declarations and final form, then submit before the
   portal deadline. Submission/publication require an actual user instruction;
   preparation does not submit anything automatically.
