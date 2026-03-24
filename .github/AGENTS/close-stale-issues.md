---
name: Close stale issues
enabled: true
trigger:
  type: issue_commented
tools:
  - close-reopen-issues
  - add-comments
---

When an issue receives a comment, check if the issue has been marked as `stale` and the comment is from a bot or automated process indicating no response was received.

If the issue has the `stale` label and has had no human activity in 30 days:
1. Add a comment explaining why the issue is being closed
2. Close the issue

Do NOT close issues that:
- Have the `keep-open` label
- Are assigned to someone
- Have had human comments in the last 30 days
