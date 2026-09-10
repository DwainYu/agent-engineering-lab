---
id: tool-calling
title: Tool Calling
category: tools
status: learning
progress: 35
summary: "A structured request from the model to the runtime: name plus JSON arguments, validated against a schema the model was told about."

prerequisites:
  - agent
  - llm-api

related:
  - agent-loop

experiments:
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: app/tools/registry.py

production_project:
  repo: tft-agent-set17
  path: api/agent/tools.py
---

# Tool Calling

## Definition

A **tool** is a JSON schema advertised to the model. "Tool calling" is the
model replying with `{"name": ..., "arguments": "..."}` instead of prose, and
`finish_reason: "tool_calls"` marking that reply as "not finished yet".

## Why

Text output cannot affect the world. Tool calling gives the model a
side-effect channel without giving it code execution, so the runtime keeps
the authority to validate, restrict, and log every effect.

## Minimal Implementation

```python
@dataclass
class Tool:
    name: str
    description: str
    parameters: dict          # JSON Schema
    fn: Callable[..., str]

    def as_schema(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }
```

Execution is a plain dispatch, and the result must return as a `tool`
message carrying the same `tool_call_id`:

```python
{"role": "tool", "tool_call_id": call.id, "content": json.dumps(output)}
```

## Real Project

- Training: `tft-agent-set18/app/tools/` — registry plus three tools.
- Production: `tft-agent-set17/api/agent/tools.py` — the same contract, plus
  caching and auth-bound tools.

## Common Problems

- Vague descriptions: the model selects tools by reading them, so a bad
  description is a routing bug.
- Accepting arguments without validating against the schema before running.
- Returning raw exceptions as tool output — the model reads them as facts and
  gets creative. Return a structured error instead.
- Parallel calls: two writes to the same resource, no ordering guarantee.
