---
on:
  issue-create:
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
  close-issue:
    allowed-reasons: [duplicate, not_planned]
---

# Triage Agent Configuration

## Instructions
When a new issue is opened, automatically triage it by:
1. Applying appropriate labels based on the issue content
2. Assigning to the correct team based on the area of the codebase affected
3. Adding priority labels based on severity indicators
