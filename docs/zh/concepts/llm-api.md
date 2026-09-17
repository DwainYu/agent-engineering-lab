---
id: llm-api
title: LLM API
category: fundamentals
status: learning
progress: 45
language: zh
source_revision: 1
summary: "所有 Agent 底层的那一次模型调用：消息进、一条回复出，外加 usage、finish reason 和 tool calls。"

prerequisites: []
related:
  - agent
  - tool-calling

experiments:
  - 001-basic-llm
  - 002-tool-calling

training_project:
  repo: tft-agent-set18
  path: agent/provider.py
---

# LLM API

## 定义

对 chat-completions 端点的一次调用：输入一组消息（外加 tool schemas、采样参数），输出
一条 assistant 回复，并附带 `finish_reason` 和 `usage`。

## 为什么重要

Agent 做的所有事，都是把这个最底层的原语重复执行。如果单轮 contract 没搞懂 —— 什么
是无状态的、message role 是什么意思、tool call 出现在哪里 —— 那上面那层循环就只是猜。

## 最小实现

```python
payload = {
    "model": MODEL,
    "messages": [{"role": "user", "content": "What is an Agent?"}],
    "temperature": 0,
}
request = urllib.request.Request(
    f"{BASE_URL}/chat/completions",
    data=json.dumps(payload).encode(),
    headers={
        "content-type": "application/json",
        "authorization": f"Bearer {api_key}",
    },
)
data = json.loads(urllib.request.urlopen(request, timeout=60).read())
```

不能省的三样东西：超时、每轮的 `usage` 统计、以及 429 / 5xx 上带 backoff 的重试。

## 实测数据

2026-09-12 跑真实端点得到的数字，不是文档里抄的：

| 测量项                                               | 数值                  |
| ---------------------------------------------------- | --------------------- |
| 同样两条消息，不带 `tools`                            | `prompt_tokens=37`     |
| 同样两条消息，四个 tool schemas                       | `prompt_tokens=501`    |
| 一次工具往返（Experiment 002，2 轮）                   | 1 205 tokens           |
| 四轮循环（Experiment 003）                            | 2 698 tokens           |
| `temperature: 0` 下重复 Experiment 002                 | 4 次，成本一致        |
| 实际返回的 `usage` 字段                                | prompt / completion / total |

对 runtime 写法有三个后果：

- 一次 prompt 里最大的固定成本是 schemas，不是对话。提供四个工具，每一轮都要为它们付
  钱；工具数量的预算就是 token 的预算。
- `temperature: 0` 的可重复性，才让一个脚本能够代替模型。它在小任务上成立；在被裁剪
  过的、含糊的任务上不成立（Experiment 005 两次给出了不同答案）。
- 端点特有的旋钮属于 provider 的构造函数（`enable_thinking`、`max_tokens`），永远不属
  于 loop。`content` 为空且 `tool_calls` 有值是正常的；`content` 为空且
  `finish_reason: stop` 是模型什么都没回答，而只有 `usage` 加上 finish reason 才分
  得清这两者。

## 常见问题

- 没有超时：一个挂死的请求看起来就像一个很慢的 Agent。
- 忽略 `finish_reason: "length"`，把一个被截断的回答当成最终答案。
- 交互式流量和批量流量共用同一个 client，于是延迟预算互相打架。
