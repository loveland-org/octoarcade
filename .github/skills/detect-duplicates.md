# Detect duplicates

When a new issue is opened, search the repository's existing issues (both open and closed) to determine if this issue has already been reported.

## How to detect duplicates

1. **Extract key details** from the new issue: error messages, stack traces, affected components, UI elements, API endpoints, or specific behavior described.
2. **Search broadly** — don't just match titles. Look for issues that describe the same underlying problem even if worded differently. A "login button broken" issue and a "auth flow fails on click" issue may be the same bug.
3. **Check closed issues too** — the problem may have been reported and fixed before, or closed as won't-fix. This context is valuable.
4. **Consider partial overlaps** — if an existing issue covers a broader scope that includes this report, note that rather than marking it as a full duplicate.

## What to do when a duplicate is found

- Add a comment linking to the original issue: "This appears to be a duplicate of #123."
- Apply the `duplicate` label.
- If the original issue is closed, mention whether the fix has been released or if it may be a regression.
- If you're not confident it's a true duplicate, say so: "This may be related to #123 — please confirm if you're seeing the same behavior."

## What NOT to do

- Don't close the issue automatically — let a maintainer decide.
- Don't mark issues as duplicates based only on similar titles. Read the full description.
- Don't link to more than 2-3 potentially related issues. Pick the most relevant ones.
