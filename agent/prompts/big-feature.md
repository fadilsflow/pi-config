---
description: "Full big-feature workflow: context -> plan/oracle -> worker -> reviewers"
model: openai-codex/gpt-5.5
thinking: high
restore: true
---

Run a full big-feature workflow for this request:

$@

Required flow:
1. Use `context-builder` or parallel scouts to gather request scope, codebase patterns, validation commands, and risks.
2. Use `planner` or `oracle` for architecture/high-impact decisions if the implementation is non-trivial.
3. Present the implementation approach if there are meaningful trade-offs or open questions.
4. Use `worker` for the implementation once scope is clear.
5. Use fresh-context `reviewer` agents for correctness, tests/validation, and simplicity/maintainability.
6. Apply accepted fixes and verify.

Rules:
- Do not edit before enough context exists.
- Keep scope tight and avoid unrelated refactors.
- Do not commit or push.

Final output:
- context summary
- plan/decision summary
- changed files
- reviewer findings addressed/deferred
- verification commands/results
- risks or remaining gaps
