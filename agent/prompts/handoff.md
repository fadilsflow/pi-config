---
description: Create an implementation-ready handoff brief
model: openai-codex/gpt-5.5
thinking: medium
restore: true
---

Create an implementation-ready handoff for this task. Do not edit files unless explicitly necessary for inspection artifacts.

Task:
$@

Include:
- goal and expected outcome
- relevant files/modules
- current behavior and constraints
- proposed implementation steps
- non-goals
- validation commands/checks
- risks and open questions
- final compact worker prompt that can be pasted into a fresh agent

If codebase context is missing, inspect first or use scout/context-builder before writing the handoff.
