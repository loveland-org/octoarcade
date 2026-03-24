---
name: Label new issues
enabled: true
trigger:
  type: issue_opened
tools:
  - apply-labels
  - add-comments
---

When a new issue is opened, analyze its title and body to determine the most appropriate labels.

Apply labels for:
- **Area**: Which part of the codebase is affected (e.g. `area:frontend`, `area:api`, `area:docs`)
- **Type**: What kind of issue this is (`bug`, `enhancement`, `question`)
- **Priority**: How urgent it is (`p0-critical`, `p1-high`, `p2-medium`, `p3-low`)

If the issue is missing reproduction steps for a bug report, add a polite comment asking for more detail.
