---
name: create-github-pr
description: Create or update a GitHub pull request for the current branch. Use when asked to "create a PR", "open a pull request", "submit this branch", "update the PR", "refresh the PR description", or "push this branch and make a PR". Runs required checks, uses gh for GitHub operations, and uses the PR summary skill for descriptions.
---

# Create or Update a GitHub Pull Request

Create a new GitHub pull request for the current branch, or update the existing pull request for the branch when it was created by the authenticated GitHub user.

## Step 1: Coordinate Supporting Workflows

Before each category of work, invoke the matching workflow using its natural task phrasing:

- For GitHub operations, interact with GitHub using the `gh` CLI. Use `gh pr`, `gh run`, and `gh api` for PRs, CI runs, and advanced queries.
- For PR bodies, generate a comprehensive GitHub Pull Request summary for the current branch. The result must be GitHub-compatible markdown.
- For approved local commits, create a git commit using a polished Conventional Commit message.

Use `gh` for GitHub operations. Do not use raw web UI steps.

## Step 2: Identify Repository, Branch, and User

Work from the repository root:

```bash
git rev-parse --show-toplevel
git branch --show-current
gh api user --jq '.login'
```

Stop and ask the user what branch to use if the current branch is detached or empty.

Stop before creating a PR from the default branch. Confirm the default branch with:

```bash
git symbolic-ref --quiet --short refs/remotes/origin/HEAD
```

Check whether a PR already exists for the current branch:

```bash
gh pr view --json number,url,author,title,body,headRefName,baseRefName,state
```

If this command finds a PR, follow the update workflow. If it reports that no PR exists, follow the create workflow.

## Step 3: Handle Uncommitted Changes

Check the working tree before any push, PR creation, or PR update:

```bash
git status --porcelain
```

If there are uncommitted changes, stop and ask the user what to do. Present the changed files and offer concrete options:

| Option | Action |
|---|---|
| Commit | Commit only after explicit user approval; create a git commit using the project's commit workflow. |
| Stash | Run `git stash push` only after explicit user approval. |
| Discard | Discard only after explicit user approval and only for files the user names or confirms. |
| Stop | Abandon this workflow and follow the user's next instruction. |

Never commit, stash, or discard uncommitted changes without explicit user approval.

## Step 4: Create a New Pull Request

Use this workflow only when no PR exists for the current branch.

### 4.1 Run Relevant Local Checks

Discover the most relevant validation command from project evidence before creating the PR:

1. Read project instructions such as `AGENTS.md`, `CLAUDE.md`, `README.md`, or package-specific docs.
2. Inspect common task definitions such as `package.json`, `Makefile`, `justfile`, `pyproject.toml`, `Gemfile`, `go.mod`, `Cargo.toml`, or CI workflow files.
3. Prefer the narrow command that covers the branch changes: targeted tests, type checks, lint checks, build checks, or a minimal smoke test for integration-heavy work.
4. If the right validation command is unclear, ask the user which command to run.

Run the selected check and capture the exact command and result.

If validation fails:

1. Show the failing command and the relevant failure output.
2. Ask the user whether to continue anyway or stop.
3. Continue to PR creation only if the user gives express, explicit approval to continue despite the failed validation.
4. Otherwise abandon this workflow and follow the user's instruction.

If validation passes, continue.

### 4.2 Push the Branch

Ensure the branch exists on GitHub after validation passes:

```bash
git push -u origin HEAD
```

If the branch already has an upstream, `git push` is sufficient. If push fails, stop and report the failure instead of creating the PR.

### 4.3 Generate the PR Description

Generate a comprehensive GitHub Pull Request summary for the current branch and use it as the PR body. Save the exact GitHub markdown to a temporary file, with no prose before or after the markdown.

Derive a concise PR title from the branch intent and commits. If the title is ambiguous, ask the user for the title.

### 4.4 Create the PR

Create the PR with `gh`:

```bash
gh pr create --title "$TITLE" --body-file "$BODY_FILE"
```

After creation, show the PR URL and include the validation command that passed. If the PR was created despite failing validation by explicit user approval, state that clearly.

## Step 5: Update an Existing Pull Request

Use this workflow only when a PR already exists for the current branch.

### 5.1 Enforce Ownership

Verify the authenticated GitHub user and PR author:

```bash
gh api user --jq '.login'
gh pr view --json number,url,author --jq '.author.login'
```

If the PR author does not exactly match the authenticated user, stop. Do not push to, edit, retitle, close, or otherwise update PRs created by another user.

### 5.2 Push Local Commits

Ensure all committed local branch changes are pushed to GitHub:

```bash
git status --short --branch
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git rev-list --left-right --count @{u}...HEAD
```

If the branch has no upstream, push it with:

```bash
git push -u origin HEAD
```

If the branch is ahead of upstream, push it with:

```bash
git push
```

Track whether this workflow pushed new commits. If push fails, stop and report the failure.

### 5.3 Decide Whether to Regenerate the Description

Fetch the current PR body:

```bash
gh pr view --json body --jq '.body'
```

Regenerate the PR description if either condition is true:

- New commits were pushed during this workflow.
- The existing PR body is empty or does not contain a detailed PR description.

Treat a body as detailed when it includes meaningful `## Problem`, `## Solution`, and `## QA` sections or an equivalent reviewer-focused structure. Do not overwrite a detailed body when no new commits were pushed.

### 5.4 Update the PR Description

If regeneration is needed:

1. Generate a comprehensive GitHub Pull Request summary for the current branch and use it as the new body.
2. Save the exact GitHub markdown to a temporary file.
3. Update the PR with `gh`:

```bash
gh pr edit --body-file "$BODY_FILE"
```

After updating, show the PR URL and summarize whether commits were pushed and whether the description changed.

If regeneration is not needed, show the PR URL and state that no description update was necessary.

## Step 6: Final Validation

Before reporting completion, verify the final PR state:

```bash
gh pr view --json number,url,author,headRefName,baseRefName,state
```

For new PRs, also verify the PR exists on the expected branch. For updates, verify the PR author is the authenticated user.

Report the outcome in this format:

```markdown
PR: <url>
Branch: <branch>
Validation: <command> — passed|failed with explicit approval|not run because existing PR update
Pushed: yes|no
Description: created|updated|left unchanged
```

Do not claim that validation passed, commits were pushed, or the PR was updated unless the relevant command completed successfully.
