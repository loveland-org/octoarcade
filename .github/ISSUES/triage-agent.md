---
filter:
  query: "is:issue state:open label:skip-triage OR is:open has:assignee"
actions:
  add-labels:
    allowed: [good first issue, help wanted, needs-triage, duplicate, wontfix]
    blocked: [internal, security, breaking-change]
  add-type:
    allowed: [Bug, Feature]
---

Test