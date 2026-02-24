# Fill out issue metadata

When a new issue is opened, analyze its content and apply appropriate metadata to help the team prioritize, route, and track it.

## Labels to apply

Classify the issue along these dimensions:

### Type
- `bug` — Something is broken or behaving unexpectedly.
- `feature` — A request for new functionality.
- `enhancement` — An improvement to existing functionality.
- `question` — The author is asking for help, not reporting a problem.
- `documentation` — Missing or incorrect docs.

### Priority (if you can assess it)
- `priority: critical` — Data loss, security vulnerability, or complete breakage of a core workflow.
- `priority: high` — Significant impact on users, no reasonable workaround.
- `priority: medium` — Moderate impact, workaround exists.
- `priority: low` — Minor inconvenience, cosmetic, or edge case.

### Area
Apply area labels based on which part of the codebase or product is affected (e.g., `area: api`, `area: ui`, `area: auth`, `area: docs`). Use existing labels in the repository — don't invent new area labels.

## How to assess

- Read the entire issue, including any screenshots, logs, or reproduction steps.
- Look at file paths, component names, or error messages to determine the affected area.
- If the author mentions urgency, a deadline, or widespread impact, factor that into priority.
- If you can't confidently determine priority, skip it rather than guessing wrong.

## What NOT to do

- Don't apply labels that don't already exist in the repository.
- Don't set milestone unless the issue clearly fits an existing milestone's scope.
- Don't over-label — 2-4 labels is usually right. More than that adds noise.
