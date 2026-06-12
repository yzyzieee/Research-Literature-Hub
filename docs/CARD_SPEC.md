# Card specification | 卡片规范

Every card is a single Markdown file with YAML frontmatter. One card = one fact-unit of knowledge (a paper, a concept, an algorithm, a resource, or a synthesis across cards).
每张卡片是一个带 YAML frontmatter 的 Markdown 文件。一张卡片对应一个知识单元（论文 / 概念 / 算法 / 资源 / 综述）。

## Frontmatter schema

```yaml
---
title: Adaptive noise cancelling: principles and applications   # English title (required 必填)
title_zh: 自适应噪声消除：原理与应用                                # Chinese title (required 必填)
type: paper            # paper | concept | algorithm | resource | synthesis (required)
status: pending        # pending | reviewed | official (required)
citation_key: widrow1975adaptive   # Better BibTeX key — required for type: paper
authors: [B. Widrow, J. R. Glover] # required for paper
year: 1975                         # required for paper
tags: [anc, adaptive-filter]       # lowercase kebab-case (required, ≥1)
drive: []              # Google Drive links to PDFs / data / audio
related: []            # slugs of related cards, e.g. [fxlms, active-noise-control]
created: 2026-06-12    # YYYY-MM-DD (required)
reviewed_by: []        # GitHub usernames of reviewers
---
```

## Naming rules | 命名规则

- File name = slug = `citation_key` for papers, lowercase-kebab-case English for everything else.
  文件名即 slug：论文卡用 citation key，其余用小写连字符英文。
- One slug must be unique across the whole repo. Slug 全库唯一。
- Wiki links in the body — `[[slug]]` — must point to an existing card slug.
  正文中的 `[[slug]]` 链接必须指向已存在的卡片。

## Status lifecycle | 状态流转

| status | meaning | location |
|---|---|---|
| `pending` | draft, not yet reviewed 草稿未审 | `90_pending/` |
| `reviewed` | reviewed, changes requested or awaiting promotion 已审待改/待晋升 | `90_pending/` |
| `official` | approved 已批准 | moved by CI into `01_…`–`05_…` 由 CI 移入正式目录 |

The reviewer — not the author — flips `status` to `official` during PR review. This is the human review gate.
由审核人（而非作者）在 PR 审核中将 status 改为 official。这就是人工审核门。

## Body layout | 正文结构

Bilingual, section by section. English first, Chinese after, per section — never split the card into two language halves.
逐节双语：每节先英文后中文，不要把整卡拆成上下两个语言区。

```markdown
## Summary | 摘要
## Key points | 要点
## Method | 方法          (paper / algorithm)
## Results | 结果          (paper)
## When to use | 适用场景   (algorithm / resource)
## My notes | 个人笔记
## References | 参考
```

Sections may be omitted when irrelevant, but `Summary` and `Key points` are always required.
与卡片类型无关的节可省略，但 Summary 与 Key points 必填。
