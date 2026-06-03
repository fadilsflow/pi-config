---
description: Clean current diff, then run review
restore: true
---

Clean and review the current repository diff.

Workflow:
1. Inspect staged and unstaged git diff.
2. Remove unnecessary complexity, AI-slop comments, broad formatting churn, and unrelated edits.
3. Preserve behavior.
4. Run relevant verification.
5. Use `reviewer` or a review pass to inspect the final diff.

Rules:
- Do not commit or push.
- Do not introduce new behavior unless required to fix a clear issue.

Final output:
- cleanup changes
- reviewer findings addressed/deferred
- verification commands/results
- remaining risks
