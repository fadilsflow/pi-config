---
description: Minimal safe refactor without behavior changes
model: openai-codex/gpt-5.5
thinking: medium
restore: true
---

Refactor this with the smallest safe change:

$@

Rules:
- Preserve behavior and public APIs.
- Do not introduce new abstractions unless they clearly reduce existing complexity.
- Avoid broad formatting churn.
- Do not touch unrelated files.
- Run relevant tests/typecheck/build.
- Do not commit or push.

Final output:
- changed files
- what improved
- behavior preservation notes
- verification commands/results
