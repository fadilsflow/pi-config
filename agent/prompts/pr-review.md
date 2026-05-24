---
description: Review current git diff like a PR reviewer
model: opencode-go/deepseek-v4-flash
thinking: low
restore: true
---

Review the current repository diff. Do not edit files.

Focus on:
- correctness and regressions
- security and data safety
- missing validation or tests
- unnecessary complexity
- project convention violations

Use git commands to inspect staged and unstaged changes.

Output:
- blockers
- important issues
- optional improvements
- verification gaps

Keep it concise. Include file references where useful.
