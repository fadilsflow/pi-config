---
name: big-feature
description: Context build, plan/oracle, worker implementation, then review
---

## context-builder

Build implementation context for this feature. Include request scope, relevant files/modules, architecture constraints, validation commands, risks, and a compact worker prompt. Do not edit. Request: {task}

## planner

Create a concise implementation plan from this context. Identify trade-offs, open questions, non-goals, steps, and validation. Request: {task}

Context:
{previous}

## worker

Implement this feature according to the plan. Keep scope tight, follow project conventions, run focused verification, do not commit or push.

Request: {task}

Plan:
{previous}

## reviewer

Review the resulting diff for correctness, regressions, validation gaps, security, simplicity, and project conventions. Do not edit. Original request: {task}

Previous context:
{previous}
