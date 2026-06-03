---
description: Orchestrated debugging workflow with scout, fix, and review
restore: true
---

Use an evidence-first debug loop for this issue:

$@

Required flow:
1. Reproduce or inspect the exact failure/error/logs.
2. Use `scout` if multiple files or unclear ownership are involved.
3. Identify root cause before editing.
4. Apply the smallest fix.
5. Use `reviewer` or self-review to check the diff for regressions.
6. Run verification that would have caught the original issue.

Rules:
- No symptom patching.
- No speculative fallback code.
- Do not commit or push.

Final output:
- root cause
- changed files
- fix summary
- verification commands/results
- remaining risks
