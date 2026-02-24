---
name: detect-low-quality-issues
description: >-
  Evaluate whether a newly opened issue provides enough information to act on.
  If not, politely request specific missing details and apply the needs-more-info label.
metadata:
  author: github
  version: "1"
---

# Detect low quality issues

Evaluate whether a newly opened issue provides enough information for the team to understand and act on it. If not, politely request more detail.

## What makes an issue low quality

An issue is low quality if a developer reading it would not be able to understand the problem or reproduce it. Specifically, look for:

- **No reproduction steps** — The author says something is broken but doesn't explain how to trigger it.
- **Vague description** — "It doesn't work" or "there's a bug" without specifics.
- **Missing context** — No mention of browser, OS, version, environment, or what they were trying to do.
- **No expected vs. actual behavior** — The author describes what happened but not what they expected.
- **Screenshot without explanation** — An image alone without describing the problem.
- **Feature request with no use case** — "Add X" without explaining why or what problem it solves.

## What to do

1. Add a comment that is **friendly and specific**. Don't just say "please add more info." Tell them exactly what's missing:
   - "Could you share the steps to reproduce this? For example, what page were you on, what did you click, and what happened?"
   - "What browser and OS are you using? And what version of the app?"
   - "What did you expect to happen vs. what actually happened?"
2. Apply the `needs-more-info` label.

## What NOT to do

- Don't be dismissive. The author took time to file the issue.
- Don't close the issue — just ask for clarification and label it.
- Don't flag issues as low quality just because they're short. A concise, clear bug report with a stack trace is fine.
- Don't request information that's already in the issue. Read it carefully first.
