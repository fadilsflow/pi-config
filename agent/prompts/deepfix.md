---
description: Root-cause debug and fix a difficult issue
model: openai-codex/gpt-5.5
thinking: high
restore: true
---

Debug this issue carefully and fix the root cause:

$@

Workflow:
1. Inspect the exact error, logs, failing behavior, or reproduction path.
2. Locate relevant code and call sites.
3. Form a root-cause hypothesis from evidence.
4. Verify the hypothesis before changing code when possible.
5. Apply the smallest correct fix.
6. Run verification that would have caught the bug.

Rules:
- Do not patch symptoms blindly.
- Do not add speculative fallback code.
- Do not commit or push.

Final output:
- root cause
- changed files
- fix summary
- verification commands/results
- remaining risks
