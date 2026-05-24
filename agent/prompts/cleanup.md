---
description: Clean up current diff for simplicity and slop
model: openai-codex/gpt-5.5
thinking: medium
restore: true
---

Clean up the current diff while preserving behavior.

Focus:
- remove unnecessary complexity
- remove AI-slop phrasing/comments
- tighten naming and structure
- avoid unrelated refactors
- keep project conventions

Workflow:
1. Inspect git diff.
2. Apply only safe cleanup.
3. Run relevant verification.
4. Summarize what changed.

Do not commit or push.
