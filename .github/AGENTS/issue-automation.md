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

asd