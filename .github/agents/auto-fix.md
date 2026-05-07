---
name: Auto fix
description: Auto fix on issue create
tools:
  - github/issue_read
  - github/list_issues
  - github/search_issues
  - github/issue_write
  - github/add_issue_comment
  - github/pull_request_read
  - github/list_pull_requests
  - github/search_pull_requests
  - github/create_pull_request
  - github/update_pull_request
  - github/merge_pull_request
  - github/update_pull_request_branch
  - github/pull_request_review_write
  - github/add_comment_to_pending_review
  - github/add_reply_to_pull_request_comment
on:
  issues:
    types:
      - opened
github:
  permissions:
    pull-requests: write
---

Fix the issue with a small PR
