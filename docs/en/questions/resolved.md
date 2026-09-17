# Resolved Questions

Answered questions, with what the answer actually changed in my head.

## Q001

Why does a Workflow not need a loop, while an Agent always does?

Status: resolved

Created: 2026-09-09

Resolved: 2026-09-10

Related:

- agent
- agent-loop

**Answer**

A Workflow's step count is known when I write the code, so control flow can
live in my `for` / `if`. An Agent's step count depends on what the
intermediate results say, so the branch has to move into the model's output —
and something outside the model has to keep going until the model stops
asking.

What changed: I stopped trying to "make the model decide" through prompt
wording and started treating the exit test as runtime code that I own.
