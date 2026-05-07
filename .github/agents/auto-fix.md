---
name: Auto fix
description: asdasd
tools:
  - github/create_pull_request
on:
  issues:
    types:
      - opened
github:
  permissions:
    pull-requests: write
---

Fix the issue with a small PR
