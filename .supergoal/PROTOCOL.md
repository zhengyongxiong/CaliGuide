# Execution Protocol

## Phase Execution Loop

For each phase:
1. Read phase spec from `.supergoal/phases/phase-N.md`
2. Execute all tasks in the phase
3. Run verification steps
4. Update `.supergoal/STATE.md` with progress
5. If verification fails:
   - Attempt fix (strike 1)
   - Write fix-spec and retry (strike 2)
   - Hand off to user (strike 3)

## Memory Writeback

After each phase:
- Document what worked
- Document what didn't work
- Update `.supergoal/memory/` with learnings

## Final Audit

After all phases:
1. Re-verify against ROADMAP.md
2. Run full typecheck
3. Check all deliverables
4. Print `SUPERGOAL_RUN_COMPLETE`
