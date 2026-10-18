# Repository audit before GitHub push

**October 19 publication update:** the latest source is now pushed to
[Archzxy/archava-commerce](https://github.com/Archzxy/archava-commerce), and
anonymous repository/commit reads confirm public access. Fresh checks pass:
3 catalog + 112 module Node, 45 Python unit, 20 offline SDK cases, production
build/export and zero npm audit findings. Candidate/index/history scans and
comparison with private runtime values found no credentials. GitHub Repository
checks passed on source commit `015f123`:
[Actions run](https://github.com/Archzxy/archava-commerce/actions/runs/39152730006).
The October 18 audit below records its own historical checkpoint and limits.

Date: **October 18, 2026**. Scope: current working tree, locally reachable Git
history, build/install configuration, core session/cart/checkout boundaries,
documentation, automated checks and selected browser journeys. This is a source
and release-readiness review, not a penetration test or proof of model behavior.
All audit changes are local; the linked Cloud Run revision was not redeployed.

## Verdict and remaining work

The core demo has the intended implementation: discover → compare → assisted
cart preview/confirmation → checkout review → sandbox QR → verified simulated
settlement. The source can be prepared for GitHub with its limitations visible.
Do not describe the entire human voice journey or production commerce as complete.

| Priority | Finding | Resolution / remaining action |
| --- | --- | --- |
| Before staging | Private config and runtime artifacts must not enter Git | Gitleaks working-tree candidates and reachable history scans found no secrets; env/dependencies/logs/export paths are ignored. Scan again if staging changes. |
| Fixed locally | npm initially reported 16 findings: 2 high, 14 moderate | Vite 5.4.21 → 6.4.3, source-map-js 1.2.1 → 1.2.2, scoped OpenTelemetry Core 2.7.1 → 2.8.0 override. Final npm audit: zero findings. Provider/renderer SDK pins are preserved. |
| Fixed locally | Export validation omitted new payment/signing secrets | Both example files must keep MIDTRANS_SERVER_KEY and CHECKOUT_SIGNING_KEY blank; new tests reject populated examples. Personal profiles still do not copy payment credentials across projects. |
| Fixed locally | Initial cloud bootstrap omitted optional checkout secrets | Optional payment/signing keys now join the runtime-only secret payload. The script still refuses to replace an existing service; it was not executed. |
| Fixed locally | Public README mixed historical counts, deployment status and current capabilities | English README now separates implementation, offline checks, live provider evidence and remaining gaps. Checkout knowledge records historical simulator verification without treating it as current-order payment proof. |
| Fixed locally | Agent instructions contradicted manual-skill preference | Repository entrypoint now requires explicit skill activation and checks preview status before assuming it is running. |
| Before claiming complete voice checkout | Human spoken confirmation and automatic spoken success are not fully verified | Run a bounded actual-device/provider journey after separately authorizing provider usage; preserve confirmation and signed-receipt rules. |
| Before claiming reliable live demo | RTC startup failures, variable audio latency and one 20-second checkout receipt wait | Add turn-correlated browser/RTC/tool timings and trace the receipt path. See latency research. No root cause or latency fix is established by this audit. |
| Before open-source licensing | No top-level source license selected | Confirm adapted-code rights and choose a license. Added third-party notices; no license was assigned on the user's behalf. |
| Before competition submission | Deck, demo video, material language and eligibility review remain separate | Follow dated HACKATHON_RULES.md; resolve reuse/eligibility and conflicting video-duration requirements. GitHub push is not submission or proof of eligibility. |

The dependency advisories were checked against their primary sources:
[Vite release](https://github.com/vitejs/vite/releases/tag/v6.4.3),
[source-map-js fix](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), and
[OpenTelemetry Core fix](https://github.com/advisories/GHSA-8988-4f7v-96qf).
The scoped override avoids npm's suggested downgrade to Spatius 1.0.0. An npm
advisory scan does not cover all Python, operating-system or provider risks;
Python dependency consistency was checked with `pip check`.

## Keep in source

- Storefront source, templates, product data/knowledge and local product images.
- The complete standalone `archava/` module: React widget, Node API, Python
  worker, bounded protocols, prompt/configuration, tests and setup/export tools.
- Existing IDs, `kala-*` browser/window contracts, room bindings and provenance.
  Renaming these is not required for DOPAMINE branding.
- Node lockfile, pinned Python requirements, blank environment examples and
  ignore files. The root has no npm dependencies and needs no invented root lock.
- Root Cloud Run Dockerfile/supervisor/bootstrap/runbook. Keep module-only Docker,
  Compose and hosting examples clearly labelled as module deployment options.
- DOPAMINE source assets, design references, fonts and their OFL notices. Some
  assets have only generator references; a literal import search alone is not
  sufficient evidence to delete them.
- AGENTS.md, the canonical handoff, dated rules research, test/evidence summaries
  and public attribution. Preserve historical failures and source provenance.

## Added or improved

- `.github/workflows/checks.yml`: pinned official actions, read-only repository
  permissions, no persisted Git credential, no app secrets, no provider calls or
  deployment. Runs Node/Python/SDK checks, build, npm advisory audit and export.
  Its commands pass locally; the GitHub-hosted workflow has not run yet.
- `THIRD_PARTY_NOTICES.md` and this audit report.
- Root `engines.node >=22.18.0` and `npm run test:checkout` for the existing browser
  runner. The project remains Node + React + Python.
- Additional ignores for generated output, local agent state, browser auth/HAR
  artifacts and common private-key formats.

## Exclude from Git; retain locally when needed

Keep `.env`, private profiles/keys, `node_modules`, `.venv`, build output,
`archava/exports`, `.logs`, browser state, HAR files and private screenshots out
of staging. Existing ignore rules plus the additions cover these paths. Do not
delete credentials or retained failed QA evidence merely to make Git status
shorter. No tracked source or design assets were deleted in this audit.

Never add original screenshots that show provider credentials, account/contact
details or payment/tax information. Review any new demo recording before making
it public. Assets deliberately intended for source belong in `assets/`, with
their attribution; generated test artifacts belong under ignored output/logs.

## Fresh verification

| Check | Result |
| --- | --- |
| Node catalog checks | 3 passed |
| Module Node/protocol/export tests | 86 passed |
| Python unit checks | 35 passed |
| Offline SDK integration | 15 passed; mocks, no provider sessions |
| Python dependency consistency | pip check passed |
| TypeScript / widget build | Passed on Vite 6.4.3 |
| npm advisory scan | 0 reported findings after local fixes |
| Shopping browser QA | 17 scenarios each at 1440 / 390 / 320 px; passed |
| Checkout browser QA | Passed at 1440 / 390 / 320 px, including unavailable, preview, pending, simulated paid, reload/order reuse and form privacy; synthetic provider |
| Avatar browser regressions | Normal/restart, cached-false probe, graphics recovery and cancellation passed; actual renderer/assets, zero provider rooms/WebRTC sockets |
| Standalone source export | Passed; inspected archive excludes private env, dependencies, logs, build and generated state |
| Git secret scans | Working-tree candidates and reachable history: no findings with default Gitleaks rules and full redaction |

Avatar screenshot was inspected: the face rendered and the three controls were
visible. Its session allocation was deliberately intercepted; this is renderer
evidence, not a completed conversation. Checkout browser success uses a synthetic
provider; the separate actual Midtrans simulator proof remains the earlier
deployment checkpoint. No new live voice or payment sessions were created.
Task browsers and fixture servers closed; user/cloud runtimes were preserved.

Local reports: `.logs/repo-audit-20261018/`, `.logs/assistant-browser/`,
`.logs/checkout-browser/`, `.logs/avatar-browser/`. These are ignored and are not
required for a fresh clone to run tests. The source documentation records the
results without publishing private runtime evidence.

## Review before staging and pushing

1. Review `git diff` and the untracked files. Rebrand, cloud, checkout and audit
   changes have not been committed; stage all intended source, not just tracked
   modifications. Preserve the lockfile with its package manifest.
2. Run the README checks, `git diff --check` and secret scan on any subsequently
   changed candidate set. Inspect `git diff --cached --stat` and the staged paths.
3. Keep the readiness gaps above visible in the commit/PR description. Avoid
   claiming real fulfillment, completed human voice checkout or fixed latency.
4. Push only after reviewing the staged change. A later authorized Cloud Run
   rollout is needed to put these local security/documentation changes online.
   GitHub checks do not perform that rollout or competition submission.
