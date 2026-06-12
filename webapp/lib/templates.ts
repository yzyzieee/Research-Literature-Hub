import type { CardType } from "./types";

export const BODY_TEMPLATES: Record<CardType, string> = {
  paper: `## Summary

(one-paragraph summary)

## Key points

-

## Method

## Results

## My notes

## References
`,
  concept: `## Summary

(definition in 2-3 sentences)

## Key points

-

## Intuition

## Math

## My notes

## References
`,
  algorithm: `## Summary

(what the algorithm does)

## Key points

-

## Method

\`\`\`text
pseudocode
\`\`\`

## When to use

## Implementation notes

## My notes

## References
`,
  resource: `## Summary

(what the resource is and why it matters)

## Key points

-

## When to use

## How to get it

## My notes

## References
`,
  synthesis: `## Summary

(the question this synthesis answers)

## Key points

-

## Landscape

| Approach | Card | Strength | Weakness |
|---|---|---|---|
| | | | |

## Open questions

## My notes

## References
`,
};
