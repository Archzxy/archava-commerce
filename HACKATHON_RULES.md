# AI Builder Cup 2026 — operational rules

This is an eligibility audit, not an eligibility approval or a submitted entry.
Unknown items require evidence; a new repository does not establish fresh work.

- Event: Google Cloud AI Builder Cup 2026, organized by Hack2skill.
- Official site: https://aibuildercup.com/
- Target: Retail & Commerce; one solution under one theme.
- Status: registration closed; published prototype window remains open on the checked date.
- Rulebook version: undated live pages; no version number found.
- Last checked: 2026-10-15 14:31 Asia/Jakarta.
- Targeted eligibility recheck: 2026-10-15 18:26 Asia/Jakarta; FAQ accessible and unchanged. Terms fetch temporarily failed; the previously read terms snapshot remains the available evidence.
- Existing-project reuse was explicitly requested by the user for this event.
- Scope of this audit: GitHub organization/repository choice and reuse of Archava in KALA.

## Sources and access

| ID | Source | Access | Scope |
| --- | --- | --- | --- |
| S1 | [Official overview](https://aibuildercup.com/) | Read | Timeline and event identity |
| S2 | [Official FAQ](https://aibuildercup.com/Faqs.html) | Read | Fresh projects, team, artifacts |
| S3 | [Official terms linked by S1](https://docs.google.com/document/d/e/2PACX-1vRm7ChZ6Ij9fG7uFDkxzUMpwgVeBmnQ6cMDnAIEEX84AiLBOOQ9cYbl3S5OzFBbcVb8TF55s-eVpiXb/pub) | Read | Freshness, rights, eligibility |
| S4 | [Official themes and requirements](https://aibuildercup.com/themes.html) | Read | Track, stack, language, rubric |
| S5 | [Official rewards](https://aibuildercup.com/rewards.html) | Read | Awards |
| S6 | User-provided submission screenshot, first conversation image | Partial | Required form fields; PDF limit shown as 5 MB |
| S7 | [Archava](https://github.com/Archzxylabs/Archava), GitHub API metadata and all 15 main-branch commits | Read | Source provenance evidence |
| S8 | [Archava-Platform](https://github.com/Archzxylabs/Archava-Platform), GitHub API metadata and all 48 main-branch commits | Read | Template provenance evidence |

The Hack2skill dashboard requires participant access; its additional declarations
and post-submit controls have not been inspected. Search results for other Google
hackathons were excluded from this event's rules.

## Coverage and rule ledger

All entries below were checked on the date above. Rule summaries and this
project's implications are separate.

| ID / category | Operational rule | Source / section | Status and implication |
| --- | --- | --- | --- |
| R1 Identity/theme | Six themes; target commerce covers conversational shopping and customer experience. | S4, Themes | Verified; product alignment is a team assessment. |
| R2 Freshness/build window | Fresh code and original assets must be created within the official timeline; earlier products, ongoing projects and work predating launch are excluded. | S3, Technical Stack, Authenticity, and Freshness Standards; S2, Building & Submission | Verified restriction; the eligibility of this reuse is unresolved. |
| R3 Templates/own modules | No explicit exception for a participant's existing avatar template was located. | S2–S3 | Unknown; do not assume attribution grants an exception. |
| R4 Organization/repository | Public source is mandatory. No restriction on an existing GitHub organization was located. | S2–S3, deliverables | Verified public-source requirement; organization-name eligibility is not stated. |
| R5 Stack | Google AI models or listed agentic platforms; Google Cloud deployment. | S4, What you'll build / AI Tools | Verified; plan Cloud Run or Firebase. Broader GCP wording also appears in S2–S3. |
| R6 Artifacts | Live prototype, public repository, video strictly below 3 minutes and explanatory deck. | S3, Prototype & Deliverables; S2 | Verified; S4 asks for deck converted to PDF. S6 corroborates fields. |
| R7 Language | English submission materials, including code, documentation and presentations. | S4, Language | Verified; current Indonesian documentation needs review before submission. App-language treatment is not explicit. |
| R8 Eligibility | Teams of 2–4; age 21+; working professionals/entrepreneurs/startups; JAPAC residency; students excluded. | S2, Team Composition; S3, General Eligibility | Verified rules; the user's team's compliance has not been audited. |
| R9 Entry limits | One team and one solution/theme per participant. | S2–S3 | Verified; prior participation in another event does not establish this entry's eligibility. |
| R10 Development AI | No explicit coding-assistant permission/disclosure provision located. | S2–S4 | Not stated; runtime AI requirements do not settle development-tool policy. |
| R11 Rights/assets | Respect third-party rights; organizer marketing rights and six-month first-refusal provisions apply. | S3, Conduct / Intellectual Property / Copyright | Verified provisions; licensing details require review before submission. Ownership alone does not waive R2. |
| R12 Data/security | Rights and privacy restrictions apply; prohibited harmful content/code. Detailed security standard not located. | S3, Protection of Intellectual Property | Partial; public code must exclude runtime credentials. |
| R13 Judging | Technical/GenAI 40%; alignment/impact 25%; innovation 25%; UX/design 10%. | S4, Judging criteria; S2 | Verified; rubric applies across themes. |
| R14 Review | Initial scoring precedes finalist selection; finalists demo in Singapore. Full initial review procedure is not stated. | S2–S3, judging; S1 | Partial. |
| R15 Awards | Ranked prizes $10k/$7k/$5k; four $2k special awards. Award stacking not stated. | S5 | Verified amounts; headline rendering shows $0, while S1 states $30k and listed awards sum to $30k. |
| R16 Post-deadline edits | No explicit code-freeze, submission-edit or uptime window located. | S1–S4 | Unknown; previous advice about general redeployment capability does not override competition freeze rules. |

S3's generic copyright clause discusses rights to an existing application. It
does not clearly override the specific freshness prohibition; S2 reiterates
fresh-only eligibility. Treat an own-template exception as unresolved.

## Timeline

Dates from S1 and current S2. Exact deadline times and organizer timezone are
not stated, so precise Asia/Jakarta cutoffs cannot be calculated.

| Milestone | Published 2026 date | Status |
| --- | --- | --- |
| Registration | September 1–October 11 | Closed |
| Team formation | September 1–October 14 | Closed |
| Prototype build/submission | September 7–October 18 | Published window |
| Prototype deadline | October 18 | Hour/timezone unknown |
| Evaluation | October 19–November 6 | Published schedule |
| Finalists | November 7 | Published schedule |
| Finale | December 4, Singapore | Published schedule |

S3's roster wording refers to October 11 registration and no changes after
October 14; S1/S2 distinguish the two deadlines. No roster action is inferred.

## Provenance evidence and limits

Read-only GitHub inspection found:

| Repository | Created at (UTC) | Earliest main-branch committer timestamp found (UTC) |
| --- | --- | --- |
| Archava-Platform | 2026-09-22 20:00:43 | 2026-09-22 20:00:30 |
| Archava | 2026-09-30 12:00:51 | 2026-09-30 12:00:39 |

Earliest commits inspected directly:

- [Platform foundation](https://github.com/Archzxylabs/Archava-Platform/commit/638600fa4bfcb33875489edfa8fb991a95107a21), September 22 UTC.
- [Archava minute-pack MVP](https://github.com/Archzxylabs/Archava/commit/f1c195f30f3838809d801aeadb06e79c47ce2805), September 30 UTC.

The commerce-specific product can be new in problem, behavior and implementation.
That assessment is separate from the event's fresh-source condition. Current
metadata supports an in-window repository history; it neither proves an
ineligible earlier origin nor conclusively establishes eligibility. Record the
adaptation as a new commerce prototype reusing the Archava starter, subject to
clarification of that reuse. No categorical disqualification has been established.

These dates fall within the published build window, but repository creation and
commit timestamps do not prove when source or assets were originally authored,
nor that adapting an ongoing project meets R2. Archava's README identifies a
separate Web3 hackathon product. KALA's local folder currently has no Git
history, and its `archava/` starter was copied from an existing project.

Requested reuse: the Archava avatar/session starter, adapted to the KALA retail
experience. The retail tools, catalog, shopping flow and renderer corrections
are present locally. Their provenance and eligible scope need an honest record;
moving them to a newly created repository does not change their origin.

## Current decisions and unresolved questions

| Action | Assessment | Next evidence |
| --- | --- | --- |
| Use the Archzxylabs organization | No organization-specific prohibition found | Check any additional dashboard declarations. |
| Create a separate commerce repository | Repository structure is a technical choice, not an eligibility remedy | Preserve provenance and disclose reused modules. |
| Claim the current adapted project is eligible | Unknown | Organizer clarification on this exact reuse and build timeline. |
| Describe the current project as entirely new/from scratch | Unsupported | Do not erase or misrepresent its origin. |
| Submit the adapted project | Not cleared by this audit | Resolve freshness before representing compliance. |
| Rebuild solely to change repository dates | No eligibility value | Actual origin, scope and timing govern the question. |

Clarification contact published by the organizer:
`support+aibuildercup@hack2skill.com`. No message has been sent.

Suggested question for the organizer, with exact dates/source links supplied:

> Our team has an existing Archava avatar/session starter, whose currently
> visible repository history begins within the published build window. We are
> adapting that starter into a retail shopping assistant for this entry. Does
> the fresh-project rule permit this reuse? If so, what source disclosure and
> evidence of newly developed work are required?

## Amendments / corrections

| Checked | Change | Impact |
| --- | --- | --- |
| 2026-10-15 | First verified event-rules audit; corrected the assumption that a separate repo sufficiently addresses hackathon suitability. | Organization choice and source-reuse eligibility must be evaluated separately. No source was deleted, rewritten to obscure origin, pushed or submitted. |

Next checks: organizer reuse answer, actual source/asset authorship dates,
exact submission cutoff, dashboard declarations and code-freeze/edit policy.
