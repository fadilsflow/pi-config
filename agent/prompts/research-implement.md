---
description: Research plus local scout, then implement and review
model: openai-codex/gpt-5.5
thinking: high
restore: true
---

Use external research plus local codebase context to implement this task:

$@

Required flow:
1. Launch `researcher` for current docs, APIs, ecosystem behavior, or external evidence relevant to the task.
2. Launch `scout` for local codebase patterns, files, constraints, and validation commands.
3. Synthesize the findings into a short implementation approach.
4. Launch `worker` to implement the agreed minimal change.
5. Launch `reviewer` to inspect the diff.
6. Run focused verification.

Rules:
- Prefer official/current docs for version-sensitive APIs.
- Keep implementation minimal and aligned with local conventions.
- Do not commit or push.

Final output:
- external evidence summary
- local context summary
- changed files
- reviewer findings addressed/deferred
- verification commands/results
- risks or remaining gaps
