---
filter:
  query: "is:issue state:open label:skip-triage OR is:open has:assignee"
actions:
  add-labels:
    allowed: [good first issue, help wanted, needs-triage, duplicate, wontfix]
    blocked: [internal, security, breaking-change]
  add-type:
    allowed: [Bug, Feature]
  add-fields:
    allowed: [Priority, Area]
  post-comment:
    enabled: true
  close-issue:
    allowed-reasons: [duplicate, not_planned]
  assign-agent:
    enabled: true
    allowed: [Copilot, custom-agent-1, custom-agent-2]
---

Test