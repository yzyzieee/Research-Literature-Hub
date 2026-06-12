import type { CardType } from "./types";

export const BODY_TEMPLATES: Record<CardType, string> = {
  paper: `## Summary | 摘要

(one-paragraph summary 一段话概括)

## Key points | 要点

-

## Method | 方法

## Results | 结果

## My notes | 个人笔记

## References | 参考
`,
  concept: `## Summary | 摘要

(definition in 2-3 sentences 两三句话定义)

## Key points | 要点

-

## Intuition | 直觉理解

## Math | 数学表达

## My notes | 个人笔记

## References | 参考
`,
  algorithm: `## Summary | 摘要

(what the algorithm does 算法做什么)

## Key points | 要点

-

## Method | 方法

\`\`\`text
pseudocode
\`\`\`

## When to use | 适用场景

## Implementation notes | 实现笔记

## My notes | 个人笔记

## References | 参考
`,
  resource: `## Summary | 摘要

(what the resource is and why it matters 资源是什么、为什么有用)

## Key points | 要点

-

## When to use | 适用场景

## How to get it | 获取方式

## My notes | 个人笔记

## References | 参考
`,
  synthesis: `## Summary | 摘要

(the question this synthesis answers 本综述回答的问题)

## Key points | 要点

-

## Landscape | 全景梳理

| Approach | Card | Strength | Weakness |
|---|---|---|---|
| | | | |

## Open questions | 开放问题

## My notes | 个人笔记

## References | 参考
`,
};
