---
description: "Orchestrated implementation workflow: scout -> worker -> reviewer"
restore: true
---

Use subagents to implement this task with a scout -> worker -> reviewer workflow:

$@

Required flow:
1. Launch `scout` to inspect the codebase and identify relevant files, conventions, risks, and validation commands. Scout must not edit.
2. Launch `worker` with the scout findings and the original task. Worker may edit only the necessary files.
3. Launch `reviewer` to inspect the resulting diff for correctness, regressions, tests, and simplicity. Reviewer must not edit.
4. Apply any fixes that are clearly necessary, then run focused verification.

Rules:
- Keep changes minimal.
- Do not commit or push.
- Stop and ask if requirements are ambiguous enough to affect implementation.

Final output:
- scout summary
- changed files
- reviewer findings addressed/deferred
- verification commands/results
- risks or remaining gaps
