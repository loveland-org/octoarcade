---
on:
  issue-opened:
    filter: "label:skip-triage OR has:assignee"
  on-mention: true
allowed-actions:
  add-labels:
    allowed: [good first issue, help wanted, needs-triage, duplicate, wontfix]
    blocked: [internal, security, breaking-change]
  add-type:
    blocked: [Epic, Initiative]
  add-fields:
    allowed: [Priority, Area]
  post-comment: true
  close-issue:
    allowed-reasons: [duplicate, not_planned]
  assign-agent:
    allowed: [Copilot, custom-agent-1, custom-agent-2]
---

When a new issue is opened in this repository, automatically triage it.

1. Read the issue title, body, and any attached metadata.
2. Set the issue **type** (Bug, Feature, Task, Epic, Question) based on the content.
3. Apply relevant **labels** (area, priority, severity). Re-use existing labels in this repo before inventing new ones.
4. Suggest an **assignee** based on CODEOWNERS, recent contributors to the affected area, or the team that typically owns this kind of work.
5. If the issue is high-severity (security, data loss, customer-facing outage), set sub-status to **In progress** and flag it. Otherwise move it to **Backlog**.
6. If the issue looks like a duplicate of an existing open issue, link it and propose closing as duplicate instead.
7. Post a short, friendly comment summarising what you did and what you'd like the author to confirm.

Be concise, factual, and link to evidence in the codebase or related issues whenever possible. If you're not confident about a metadata choice, leave it unset and explain why in your comment.