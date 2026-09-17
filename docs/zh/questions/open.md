# 待解决问题

我还没搞懂的东西。每一个被回答之后，就会变成一个 Day。

## Q001

为什么 Agent 需要一个 State 对象？message transcript 明明已经包含了模型能看到
的全部东西。

Status: open

Created: 2026-09-10

Related:

- agent-runtime
- agent-loop

## Q002

当一个被流式输出的工具调用的 `arguments` 分散在多个 SSE chunk 里到达时，谁来把它
们拼回去？如果其中一个 chunk 丢了会怎样？

Status: open

Created: 2026-09-10

Related:

- llm-api
- tool-calling
