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

# Triage Agent Configuration

## Instructions
When a new issue is opened, automatically triage it by:
1. Applying appropriate labels based on the issue content
2. Assigning to the correct team based on the area of the codebase affected
3. Adding priority labels based on severity indicators
