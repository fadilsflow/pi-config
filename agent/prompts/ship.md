---
description: Implement, verify, and summarize a task end-to-end
model: openai-codex/gpt-5.5
thinking: medium
restore: true
---

Implement this task end-to-end with minimal correct changes:

$@

Workflow:
1. Inspect relevant files first.
2. Follow existing project conventions.
3. Make the smallest safe implementation.
4. Run focused verification, then broader checks if appropriate.
5. Review your own diff for regressions or slop.

Rules:
- Do not over-engineer.
- Do not touch unrelated files.
- Do not commit or push.
- If requirements are ambiguous enough to change implementation, ask before editing.

Final output:
- changed files
- summary
- verification commands/results
- risks or remaining gaps
