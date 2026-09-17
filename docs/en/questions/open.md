# Open Questions

Things I do not understand yet. Each one becomes a Day when it gets answered.

## Q001

Why does an Agent need a State object when the message transcript already
contains everything the model can see?

Status: open

Created: 2026-09-10

Related:

- agent-runtime
- agent-loop

## Q002

When a streamed tool call's `arguments` arrive in fragments across SSE
chunks, who reassembles them, and what happens if a chunk is lost?

Status: open

Created: 2026-09-10

Related:

- llm-api
- tool-calling
