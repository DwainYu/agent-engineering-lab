---
id: tool-calling
title: Tool Calling
category: tools
status: learning
progress: 35
language: zh
source_revision: 1
summary: "模型发给 runtime 的结构化请求：名字加 JSON 参数，并按事先告知模型的 schema 校验。"

prerequisites:
  - agent
  - llm-api

related:
  - agent-loop

experiments:
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: agent/tools.py

production_project:
  repo: tft-agent-set17
  path: api/agent/tools.py
---

# Tool Calling

## 定义

一个 **tool** 是一份告知模型的 JSON schema。"Tool calling" 指的是模型不回散文，而是
回 `{"name": ..., "arguments": "..."}`，并且用 `finish_reason: "tool_calls"` 把这条
回复标记为"还没完"。

## 为什么需要它

文本输出影响不了现实世界。Tool calling 给了模型一条带副作用的通道，但没给它执行代码
的权力 —— runtime 因此保留了校验、限制和记录每一次影响的权力。

## 最小实现

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

执行是一次普通的分派，而且结果必须作为一条 `tool` 消息、带着同一个 `tool_call_id`
返回：

```python
{"role": "tool", "tool_call_id": call.id, "content": json.dumps(output)}
```

## 真实项目里

- Training：`tft-agent-set18/agent/tools.py` — registry、参数校验和四个工具。
- Production：`tft-agent-set17/api/agent/tools.py` — 同样的 contract，多了缓存和绑定
  鉴权的工具。

## 常见问题

- 描述含糊：模型是靠读描述来选工具的，所以坏描述就是路由 bug。
- 没先按 schema 校验参数就执行。
- 把原始异常当工具输出返回 —— 模型会把它们当事实读，然后开始自由发挥。应该返回结构化
  的错误。
- 并行调用：两次写同一个资源，没有任何顺序保证。
