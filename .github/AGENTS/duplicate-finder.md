---
on:
  issue-opened: true
  schedule:
    filter: "0 6 * * *"
allowed-actions:
  add-labels:
    allowed: [duplicate]
    blocked: []
  post-comment: true
  close-issue:
    allowed-reasons: [duplicate]
---

When a new issue is opened, search existing open and recently closed issues for potential duplicates. Also run every morning at 6am to scan all recent issues for duplicates that may have been missed.

Compare the title, body, and labels to find issues describing the same problem or feature request.

If a likely duplicate is found:
1. Add a comment linking to the original issue with a brief explanation of why they appear related
2. Apply the `duplicate` label
3. If confidence is high, close the issue as duplicate

If multiple possible matches exist, list them and let the maintainer decide. Never close an issue as duplicate unless the match is very clear.