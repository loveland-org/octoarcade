---
name: issue-first-pass-triage
description: Make newly created issues actionable fast by detecting duplicates, applying metadata, and requesting missing info. Use this when an issue is opened or when asked to triage an issue.
---

To triage an issue, follow this process using tools from the GitHub MCP Server.

1) Gather context
- Read the issue title, body, labels, assignees, and existing comments.
- If the issue is in a project, review any existing field values (type, priority, area, customer impact, etc.).

2) Check for skip rules
- If the issue is a draft, is marked "do not triage", is opened by a bot, or already has a "triaged" label, do not proceed.
- If skip rules apply, leave no comment and stop.

3) Detect duplicates and close candidates
- Use `search_issues` to find similar issues using the issue title plus 2-3 key phrases from the body.
- Prefer open issues with high activity and matching symptoms.
- If you find a strong duplicate:
  - Add a short comment linking to the likely canonical issue(s).
  - Apply the label `duplicate`.
  - If repo policy allows, close the issue as a duplicate. Otherwise, leave it open with the `duplicate` label and request maintainer confirmation.

4) Classify and apply metadata
- Infer an issue type (Bug / Feature / Task / Docs) from intent and scope.
- Use `update_issue` to apply the type (or `set_issue_type` if available).
- Apply 1-3 labels that reflect area/component and severity/priority if the repo uses them.
- Fill any required issue fields if the repo uses them (area, platform, priority, version, etc.).
- Add the label `triaged` when metadata is successfully applied.

5) Assess completeness
For bugs, check for:
- Expected vs actual behaviour
- Steps to reproduce
- Environment (OS, browser/device, app version)
- Logs or screenshots if relevant

For features, check for:
- Problem statement / user need
- Desired outcome
- Non-goals / constraints
- Acceptance criteria

6) Request missing information (only if needed)
- If key info is missing, post a single concise comment with:
  - What’s missing
  - Why it matters
  - A short checklist of what to add
- Apply label `needs-info`.
- If the repo has templates or forms, link to the relevant section.

7) Summarize actions taken
- Post a short triage summary comment that includes:
  - Type chosen
  - Labels/fields set
  - Duplicate links (if any)
  - What you need from the author (if anything)

8) Guardrails
- Do not assign people unless the issue explicitly names an owner/team or CODEOWNERS mapping is available via tooling.
- Do not close issues unless duplicate confidence is high or repo policy explicitly allows auto-close.
- Keep comments short and neutral. Prefer checklists over paragraphs.
- Never reveal secrets from logs or workflows. Redact tokens/keys if present.
