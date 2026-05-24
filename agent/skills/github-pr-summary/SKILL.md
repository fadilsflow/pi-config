---
name: github-pr-summary
description: Generate a comprehensive GitHub Pull Request summary for the current branch. Use when asked to "write a PR summary", "generate a PR description", "summarize this branch for a PR", "draft GitHub PR notes", or "create a pull request summary". Produces GitHub-compatible markdown, focuses on user impact first, and excludes changes merged in from other branches.
---

# Generate a GitHub PR Summary

Study the current branch and produce a GitHub-compatible PR summary that explains the problem, solution, QA, deploy notes, and related work without including changes merged in from other branches.

## Step 1: Establish the branch-only scope

Work from the repository root.

Detect the default remote branch:

```bash
git symbolic-ref --quiet --short refs/remotes/origin/HEAD
```

If that fails, use the first branch that exists from this list:

```bash
git show-ref --verify --quiet refs/remotes/origin/main && echo origin/main
git show-ref --verify --quiet refs/remotes/origin/master && echo origin/master
git show-ref --verify --quiet refs/heads/main && echo main
git show-ref --verify --quiet refs/heads/master && echo master
```

Find the branch fork point:

```bash
git merge-base --fork-point <base-branch> HEAD
```

If `--fork-point` fails, fall back to:

```bash
git merge-base <base-branch> HEAD
```

Build the commit list from the first-parent history only:

```bash
git log --first-parent --no-merges --reverse --format='%H%x09%s' <fork-point>..HEAD
```

Treat that command as the source of truth for what belongs in the PR summary.

Rules:
- Ignore merge commits.
- Ignore commits that arrived by merging another branch.
- Do not summarize code that exists only because another branch was merged in.
- If a branch commit modifies a file that also changed in a merged branch, describe only the delta introduced by the branch commit itself.
- If there are uncommitted changes, mention them only if the user explicitly asked for a summary of the working tree too. Otherwise ignore them.

## Step 2: Inventory only the branch-authored changes

Collect the branch-only file list and per-commit diffs:

```bash
git diff --stat <fork-point>..HEAD
git diff --name-status <fork-point>..HEAD
git log --first-parent --no-merges --reverse --format='COMMIT %H%nSUBJECT %s%nBODY%n%b%n==END==' <fork-point>..HEAD
```

Then inspect each branch-authored commit directly:

```bash
git show --stat --summary --find-renames <commit>
git diff <commit>^! -- path/to/file
```

Use commit-level inspection to separate branch-authored work from merged-in background churn.

Do not rely only on the final aggregate diff when merge commits are present.

## Step 3: Read the changed files

Read the files touched by the branch-authored commits.

Prioritize in this order:
1. entry points, routes, controllers, API handlers, database/schema changes
2. shared types, hooks, services, utilities, background jobs
3. components and views with user-visible impact
4. tests that reveal intended behavior

When a diff changes control flow, public interfaces, or data shape, read the full file instead of only the patch.

## Step 4: Reconstruct the narrative

Answer these questions before writing:

| Question | What to capture |
|---|---|
| What problem did the branch solve? | User pain, product gap, operational issue, or engineering bottleneck |
| What changed for users? | UI behavior, API behavior, workflows, or reliability improvements |
| What changed technically? | Main architectural choices, data flow, algorithm, or integration changes |
| Why this approach? | Non-obvious tradeoffs and explicit "Why not X?" reasoning |
| What must QA verify? | Concrete user journeys or API checks |
| Are there deploy concerns? | Migrations, env vars, feature flags, backfills, jobs, or sequencing |

Keep the narrative grounded in evidence from commits and code. Do not guess at intent when the code does not support it.

## Step 5: Categorize files for the summary tables

Group files by the system they affect.

Use these heuristics:
- **Backend Changes**: server code, API code, jobs, workers, models, migrations, database files, infrastructure tied to runtime behavior
- **Frontend Changes**: components, routes, views, hooks, client state, styles, assets, client-side tests
- If a file does not clearly fit either bucket, place it in the section that best matches the user-facing surface it supports.
- Omit empty subsections.

For each file row:
- Use backticks around the path.
- In the `Change` column, start new files with `**New** — ...`.
- For modified files, start with a plain verb phrase such as `Adds`, `Updates`, `Refactors`, `Removes`, `Extends`, or `Reworks`.
- Describe the behavioral significance, not a line-by-line diff.

## Step 6: Write the PR summary in GitHub markdown

Output valid GitHub markdown only. Do not add a preamble.

Use this structure when the sections apply:

```markdown
## Issue
- [Issue title](https://github.com/org/repo/issues/123)

## Problem
2-4 sentences describing the user or business pain.

## Solution
2-4 sentences describing the high-level approach.

### Algorithm/Architecture Design
- **Pattern/approach**: explanation.
- **Why not X?** explanation.

### Backend Changes
| File | Change |
|---|---|
| `path/to/file.rb` | Adds ... |
| `path/to/new_file.rb` | **New** — Introduces ... |

### Frontend Changes
| File | Change |
|---|---|
| `src/Feature.tsx` | Updates ... |

## QA
1. Step one.
2. Step two.
3. Verify specific outcomes.

## Deploy Notes
- Run migration ...
- Set `ENV_VAR` (default: `false`) ...

## Screenshots

## Related
- Fixes #123
- Related: #456
- Background: [Doc title](https://...)
```

## Step 7: Apply writing rules

Follow these rules strictly:
- Write for the PR reviewer first and the end user second.
- Put **user-facing impact** before implementation detail.
- Keep the **Problem** and **Solution** sections to 2-4 sentences each.
- Use backticks for file names and component names.
- Bold key terms, algorithm names, and architectural patterns on first use.
- Include **Why not X?** bullets only when the choice is non-obvious.
- Include environment variables in backticks and note defaults inline when known.
- Omit any section that genuinely does not apply.
- Leave **Screenshots** as a header only with no placeholder text under it.
- Keep the tone direct, specific, and conversational without filler.

## Step 8: Check section-specific requirements

### Issue
Include only when you can identify a real GitHub issue URL or issue reference with high confidence. If there is no reliable issue reference, omit the section.

### Problem
Explain the gap being fixed from the user's perspective when possible. Avoid repeating implementation details here.

### Solution
Start high-level, then expand into subsections only when they add useful detail.

### QA
Write manual test steps as a numbered list. Use specific actions and verifications such as click targets, routes, filters, API actions, or expected text changes.

### Deploy Notes
Include only if there are migrations, data backfills, new jobs, feature flags, config changes, env vars, rollout sequencing, or operational caveats.

### Related
Include linked issues with `Fixes #N` when supported by the branch evidence. Add related PRs or docs only when they materially help the reviewer.

## Step 9: Final validation

Before returning the summary, verify:
- Only first-parent non-merge commits on this branch were considered.
- Merged-in branch work was excluded from the narrative.
- Every file mentioned was actually changed by a branch-authored commit.
- The markdown is valid GitHub markdown.
- Empty sections were omitted.
- `Screenshots` is blank except for the header.
- Claims about behavior or deployment are supported by code, tests, or commit evidence.

If branch-only authorship is ambiguous because history was rewritten or commits were cherry-picked, say so briefly in the relevant section instead of presenting speculation as fact.
