---
name: assign-to-copilot
description: >-
  Evaluate whether an issue is a good candidate for Copilot to resolve
  autonomously based on scope, clarity, and complexity. Assign if appropriate.
metadata:
  author: github
  version: "1"
---

# Assign to Copilot

Evaluate whether this issue is a good candidate for Copilot to resolve autonomously. Not every issue is suitable — Copilot works best on well-scoped, clearly defined tasks with low ambiguity.

## Good candidates for Copilot

An issue is a good fit if **all** of the following are true:

- **The fix is straightforward** — It's a bug with an obvious cause, a small refactor, a typo, a missing null check, a simple UI tweak, or adding a well-defined small feature.
- **The scope is narrow** — The change likely touches 1-3 files. It doesn't require architectural decisions or cross-cutting changes.
- **The behavior is clearly specified** — The issue describes exactly what should happen. There's no ambiguity about the desired outcome.
- **There are tests or the change is easily verifiable** — Either existing tests cover the area, or the fix is simple enough that correctness is obvious.
- **No human judgment needed** — The fix doesn't require product decisions, design review, security analysis, or stakeholder input.

## Examples of good Copilot issues

- "Button text says 'Sumbit' instead of 'Submit'" (typo fix)
- "Add aria-label to the search input for accessibility" (well-defined, single file)
- "API returns 500 when `user_id` is null — add null check" (clear bug, clear fix)
- "Update dependency X from v2.1 to v2.2" (mechanical change)
- "Add unit test for the `formatDate` utility" (well-scoped, additive)

## Examples of BAD Copilot issues

- "The app feels slow" (vague, needs investigation)
- "Redesign the settings page" (requires design decisions)
- "Migrate from REST to GraphQL" (large scope, architectural)
- "Users are confused by the onboarding flow" (needs product/UX judgment)
- "Fix security vulnerability in auth" (needs careful human review)

## What to do

If the issue is a good candidate:
1. Add a comment: "This looks like a good candidate for Copilot to handle — it's well-scoped and the expected behavior is clear."
2. Assign the issue to Copilot.

If the issue is NOT a good candidate:
- Don't assign it. Don't comment about Copilot. Just skip this skill silently.
