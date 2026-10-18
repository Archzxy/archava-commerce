# DOPAMINE: agent entrypoint

Read [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md) first. It is the canonical
checkpoint for this project, including decisions, evidence, unfinished work and
the next actions. Then read the files relevant to the requested change:

- [README.md](README.md): installation, routes, commands and demo limitations.
- [HACKATHON_RULES.md](HACKATHON_RULES.md): dated event research and unresolved rules.
- [docs/DOPAMINE_DESIGN.md](docs/DOPAMINE_DESIGN.md): selected visual direction.
- [archava/AGENTS.md](archava/AGENTS.md): additional rules for the standalone module.

## Scope and collaboration

- Continue this existing commerce product. The user explicitly requested adapting
  Archava and rebranding KALA as DOPAMINE for Google Cloud AI Builder Cup 2026.
  Do not restart ideation, switch frameworks or hide the starter's provenance.
- DOPAMINE is the store; Ava is its voice/avatar shopping assistant. User-facing
  conversation is concise, casual Indonesian. Follow the selected brand board.
- Check the current working tree before edits. The DOPAMINE rebrand and handoff
  are local, uncommitted changes at this checkpoint. Preserve unrelated work.
- Execute the requested scope. Skill use and old plans do not independently
  authorize publication, paid tests, cloud spending, repository visibility changes
  or submission. Prepare reviewable files before asking about a required action.
- Update the handoff after material decisions, fixes or verification. Distinguish
  source implementation, simulation, actual provider calls and public deployment.

## Contracts to preserve

- Keep the Node multipage storefront plus the standalone React/Node/Python
  `archava/` module. Do not introduce parent imports into that module.
- Preserve product IDs, URLs, `kala-*` storage/window interfaces, transport topics,
  room identities and strict section/revision/session bindings. Public branding
  does not require blanket-renaming internal identifiers.
- Ava must render its visible `AvatarView` and receive `onFirstRendering` before
  voice-session allocation. Do not restore the `isDeviceSupported()` hard gate,
  manual WebGL probes, PNG face fallback or canvas recreation on chat/minimize.
- One click on **Tanya Ava** opens/prepares Ava and hides the launcher. Keep
  Microphone, Chat and Disconnect below the avatar. Chat is optional and initially
  closed; minimize keeps a call, Disconnect ends/cancels it.
- Catalog facts and checkout are demo data. Cart changes require the existing
  preview/confirmation/receipt flow. Do not invent inventory, claims or payments.
- Secrets stay in ignored runtime configuration. Never copy credentials, private
  environment files, join tokens, payment/tax details or user state into docs,
  source, exports or tool output.

## Verification and local tooling

- Use the existing scripts and checks proportional to the change. Session/agent
  edits also follow the checks in `archava/AGENTS.md`. Historical passing results
  are evidence of their checkpoint, not a new test run or model compliance proof.
- Skills and learning workflows are manual only: load only a skill explicitly
  requested by the user. Do ordinary engineering and audits directly. Do not
  activate ECC, learning, browser skills or subagents merely because they fit.
- Browser QA must use a task-owned session and installed Chromium where possible;
  always close that session and its fixture servers. If the user selects the
  `playwright` skill, also use `open --idle-timeout 60000` as its fallback.
- Keep analysis services off when idle, including REA's persistent MCP. Start
  only tools needed for the task and stop task-owned processes afterward. Never
  use broad browser/process cleanup against unrelated sessions.
- The transient `dopamine-dev.service`, when active, serves the user's product
  preview at `http://localhost:5193`. Check its current status rather than assuming
  it is running. Preserve user-started previews and check for an active call
  before restarting one. It is not an idle analysis tool.
