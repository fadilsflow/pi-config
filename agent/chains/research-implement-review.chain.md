---
name: research-implement-review
description: Research external docs, scout local code, implement, then review
---

## researcher

Research current docs, APIs, ecosystem behavior, and external evidence relevant to this request. Include sources. Request: {task}

## scout

Scout local codebase context, relevant files, conventions, risks, and validation commands for this request. Do not edit.

Request: {task}

Research findings:
{previous}

## planner

Synthesize the research and scout findings into a concise implementation plan. Request: {task}

Findings:
{previous}

## worker

Implement the planned minimal change. Follow project conventions, run focused verification, do not commit or push.

Request: {task}

Plan/context:
{previous}

## reviewer

Review the resulting diff for correctness, regressions, validation gaps, security, simplicity, and project conventions. Do not edit. Original request: {task}

Previous context:
{previous}
