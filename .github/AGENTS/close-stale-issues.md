---
on:
  issue-commented: true
  schedule:
    filter: "0 9 * * 1"
allowed-actions:
  add-labels:
    allowed: [stale]
    blocked: []
  post-comment: true
  close-issue:
    allowed-reasons: [not_planned]
---

When an issue receives a comment, check if the issue has been marked as stale and has had no human activity in 30 days.

If so:
1. Add a comment explaining why the issue is being closed
2. Close the issue

Do NOT close issues that have the `keep-open` label, are assigned to someone, or have had human comments in the last 30 days.