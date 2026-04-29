---
description: |
  This workflow does a first review on a PR. It reads the PR description and comments, and adds a comment with a summary of the PR, and any questions or suggestions for improvement. The goal is to provide a quick overview of the PR for maintainers, and to help identify any potential issues or areas for improvement early on.

on:
  schedule: every 1h
  workflow_dispatch:

permissions:
  contents: read
  issues: read
  pull-requests: read

network: defaults

tools:
  github:
    # If in a public repo, setting `lockdown: false` allows
    # reading issues, pull requests and comments from 3rd-parties
    # If in a private repo this has no particular effect.
    lockdown: false
    min-integrity: none # This workflow is allowed to examine and comment on any issues

safe-outputs:
  mentions: false
  allowed-github-references: []
  create-pull-request-review-comment:
    max: 3                    # max comments (default: 10)
    side: "RIGHT"             # "LEFT" or "RIGHT" (default: "RIGHT")
    target: "*"               # "triggering" (default), "*", or number
    target-repo: "loveland-org/octoarcade" # cross-repository
---

# PR Review Workflow

Create a summary comment on new PRs with insights and suggestions for improvement.

## What to include
- A brief summary of the PR's purpose and changes
- Any questions or clarifications needed from the author
- Suggestions for improvement or potential issues to address

## Style
- Be sarcastic and humorous, but not mean-spirited 
- Use emojis to add personality and engagement
- Keep it concise and focused on key points

## Process
1. Monitor new PRs in the repository
2. Read the PR description and comments to understand the context
3. Post a comment summarizing the PR and providing insights or suggestions for improvement

`