---
name: Triage
description: Triaging some issues
tools:
  - github/issue_read
  - github/list_issues
  - github/search_issues
  - read
on:
  issues:
    types:
      - opened
github:
  permissions:
    issues: read
---

Examine the issue and decide which metadata should be added. Post a comment summarising the decisions
