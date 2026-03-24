---
on:
  issue-opened:
    filter: "label:skip-triage OR has:assignee"
allowed-actions:
  add-labels:
    allowed: [good first issue, help wanted, needs-triage, duplicate, wontfix]
    blocked: [internal, security, breaking-change]
  add-fields:
    allowed: [Priority, Area]
  close-issue:
    allowed-reasons: [duplicate, not_planned]
  assign-agent:
    allowed: [Copilot, custom-agent-1, custom-agent-2]
---

Test