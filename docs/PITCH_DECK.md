# DOPAMINE pitch PDF — updated October 19, 2026

**Later repository update, October 19:**
[Archzxy/archava-commerce](https://github.com/Archzxy/archava-commerce) is now
PUBLIC with the latest source pushed; anonymous repository and commit reads
pass. The already generated PDF/PPTX retain their earlier private-access label.
They and the dated generator copy were not regenerated in the GitHub publishing
task. The earlier private-repository checks below describe the artifact's
pre-publication checkpoint.

**October 19 form follow-up:** the user supplied the exact demo folder URL after
an ambiguous screenshot. Slide 12 now links to that
[Drive folder](https://drive.google.com/drive/folders/1ZFEBzCy2zcdvwWMdTqUovlTCvuU9ODZp?usp=sharing).
An anonymous request returned 200, the title `Demo Video - Google Drive` and
video MIME metadata, without a sign-in redirect. Actual playback and duration
were not verified. A fresh GitHub CLI read still reports **PRIVATE**. The new
PDF is 13 pages / 686,911 bytes, with an editable PPTX. Earlier evidence dates
and benchmark claims remain October 18; only page 12's text changed. The original
October 18 artifacts are preserved in their dated directory. A refreshed
841-character form description is in [SUBMISSION_PREP.md](SUBMISSION_PREP.md).

The user requested the submission PDF first. A downloaded copy of the
[prescribed organizer template](https://docs.google.com/presentation/d/13rg7vW43mEH6DkpuusAE6fdoEylSFz8waNpE4RLzoUg/edit)
was populated locally; the online master was not edited. The deck has 13 slides,
uses English authored content, and retains the organizer cover, section headers,
footer and closing. The DOPAMINE purple/lime/cream palette is used inside it.

Generated deliverables, excluded from Git and cloud source upload:

- `output/submission/dopamine-2026-10-19/DOPAMINE_AI_Builder_Cup_2026.pdf`
- `output/submission/dopamine-2026-10-19/DOPAMINE_AI_Builder_Cup_2026.pptx`
- `output/submission/dopamine-2026-10-19/BRIEF_DESCRIPTION.txt`

The PDF is approximately 0.69 MB, below the portal screenshot's 5 MB limit. The
PPTX is the editable companion. These are prepared artifacts, not an uploaded or
complete competition submission.

## Prescribed structure

| PDF slide | Template section | Content |
| --- | --- | --- |
| 1 | Team Details | Archzxy; leader Muhammad Fikri Haikal; member Muhammad Afif Alfawwaz; exact Retail & Commerce theme |
| 2 | Brief about the idea | Ava's shopping experience, audience context and demo boundary |
| 3 | Opportunities | Differentiation, problem addressed, USP and outcomes proposed for validation |
| 4 | Features | Catalog grounding, budget discovery, visible store actions, confirmed cart, compact avatar, sandbox checkout |
| 5 | Process flow | Needs → discovery → review → consent/receipt → sandbox |
| 6 | Architecture | Browser, combined Cloud Run service, Gemini, LiveKit/Spatius, Midtrans and Secret Manager |
| 7 | Technologies | Implemented Google AI/Cloud and supporting stack |
| 8–9 | Prototype snapshots | Current deployed typed filter/checkout preview and separately labelled earlier real simulator settlement |
| 10 | Performance/benchmarking | 90 Node, 38 Python, 18 offline SDK checks; 51 browser case-runs; qualified cloud tool/RPC timings and open gaps |
| 11 | Additional details/future development | Human voice validation, real merchant integrations, shared state before scaling, proposed pilot metrics and Archava attribution |
| 12 | Links | Live prototype; actual repository with private-access status; user-supplied shared Drive demo folder |
| 13 | Closing | Original organizer Thank You slide |

The download instruction page, unused blank slide and explicitly optional
wireframe/cost pages are omitted. Two filled screenshot pages share the original
snapshot section. No mandatory section is omitted. Authored captions are English;
actual app captures retain the product's Indonesian UI rather than pretending
an English app was tested. No organizer exception for product language is claimed.

## Evidence and remaining fields

The team names were supplied directly by the user. The deck identifies leader
and member only. Product engineering leadership is attributed to Fikri in notes;
QA/demo support was proposed for Afif's next work, not invented as completed
coding or design contributions.

Current-release filter and checkout screenshot comes from
`.logs/service-rollout-20261018/typed-tools.png`; the Ava portrait comes from its
actual `voice-verified-final.png`. The paid screenshot comes from
`.logs/midtrans-activation-20261018/cloud-qr-paid.png`, an earlier revision's
official Midtrans simulator test. Prepared crops exclude demonstration order IDs
and have no recipient fields, keys, tickets or provider-console details.

Performance figures reuse recorded evidence; they are not a new test run:
`.logs/service-upgrade-20261018/verification-summary.json` and
`.logs/service-rollout-20261018/verification-summary.json` plus its sanitized
cloud latency records. The deck does not claim human spoken checkout completion,
fixed latency, a successful synthetic voice filter, a controlled model A/B,
conversion uplift, real funds, real inventory or fulfillment. The earlier receipt
timeout remains unresolved. No Firebase/Firestore or Vertex use is claimed.

Current delivery checks, October 19:

1. `Archzxy/archava-commerce` is now **PUBLIC**, with the latest source pushed
   and anonymous access verified. The existing PDF/PPTX still label access as
   pending until a separate artifact update; the GitHub publishing task did not
   regenerate them.
2. The exact Drive demo folder supplied by the user is linked in slide 12 and
   anonymously accessible. Video playback, duration and language/caption review
   remain unverified. This check does not claim to have watched the recording.

The [official themes page](https://aibuildercup.com/themes.html) and
[FAQ](https://aibuildercup.com/Faqs.html) were rechecked October 18 for submission
language/artifacts. The portal's 3–4 minute video instruction, template's 3-minute
label and public FAQ's under-3-minute limit still conflict. This PDF preparation
does not resolve that conflict or the separate reuse eligibility question in
`HACKATHON_RULES.md`. No messages, access request, upload or submission were sent.

## Rebuild and review

`scripts/create-pitch-deck.py` uses locally installed python-pptx/Pillow. Its inputs
are the downloaded organizer PPTX and reviewed cropped images under the ignored
`.logs/pitch-pdf-20261018/` directory. It creates an editable native-text PPTX with
native flow/architecture shapes; product screenshots stay raster images. On this
workspace:

```bash
python scripts/create-pitch-deck.py
libreoffice -env:UserInstallation=file:///tmp/dopamine-pitch-lo-20261018 \
  --headless --convert-to 'pdf:impress_pdf_Export' \
  --outdir output/submission/dopamine-2026-10-19 \
  output/submission/dopamine-2026-10-19/DOPAMINE_AI_Builder_Cup_2026.pptx
```

Template/assets paths and output can be overridden with `--template`, `--assets`
and `--output`. The deck is also directly editable in the supplied PPTX; after
changing links, export and inspect the PDF again. Do not edit the online master.

PDF text, page count/size, hyperlink targets, PPTX archive uniqueness and text
placement were checked. All slides were rendered and visually reviewed; final
layout fixes address wrapped labels, screenshot captions and the architecture
node. Task-owned LibreOffice export exited. No application/provider session,
cloud change, dependency installation or Git commit/push was needed. Local
render/verification evidence is in `.logs/pitch-pdf-20261018/`. The October 19
link update additionally checks all 13 pages, PDF and PPTX exact hyperlink
targets, archive integrity and PDF size; extracted text changed only on page 12,
whose new rendering was visually inspected. Evidence is in
`.logs/pitch-pdf-20261019/`. The task-owned LibreOffice export exited; no browser
or application/provider session was started.
