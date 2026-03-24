---
on:
  pr-opened: true
  pr-synchronized: true
  pr-ready-for-review: true
allowed-actions:
  add-labels:
    allowed: [needs-review, approved, changes-requested]
    blocked: []
  post-comment: true
---

When a new pull request is opened, review the changes and provide feedback.

Review for:
- **Code quality**: Identify potential bugs, logic errors, or anti-patterns
- **Security**: Flag any security concerns or credential leaks
- **Testing**: Note missing test coverage for changed code
- **Documentation**: Check if documentation needs updating

Be constructive and specific. Focus on substantive issues, not style.