---
   description: Implement one Recovery Master Plan item (caveman ultra)
---

/skill:caveman ultra

   Read:
   - docs/audit/06-recovery-master-plan.md
   - source backlog sections referenced by this item
   - relevant docs/dev-plan/XX-day-X.md
   - .agents/rules/raxza-officehub.md

   Implement only Recovery Master Plan item $1: "$2"

   Previous completed items:
   $3

   Before editing:
   - inspect current implementation
   - verify listed dependencies
   - if dependency is missing, stop and explain blocker

   Rules:
   - implement minimal correct end-to-end behavior for this item only
   - do not touch unrelated modules
   - preserve existing architecture/style
   - no mock/TODO/coming soon behavior
   - use Bun only
   - run relevant typecheck/build/tests

   At the end provide:
   - changed files
   - summary of fixes
   - verification results
   - remaining gaps
