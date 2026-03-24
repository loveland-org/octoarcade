---
name: Auto-assign PR reviewers
enabled: true
trigger:
  type: pr_opened
tools:
  - add-comments
---

When a pull request is opened, analyze the changed files to determine which team members should review it.

Use CODEOWNERS as a guide, but also consider:
- Recent activity in the changed files
- Team member availability (skip anyone with more than 3 open review requests)
- The size and complexity of the change

Add a comment tagging the suggested reviewers with a brief note about which files they should focus on.
