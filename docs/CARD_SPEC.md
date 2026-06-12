# Card specification

Every card is a single Markdown file with YAML frontmatter. One card = one fact-unit of knowledge (a paper, a concept, an algorithm, a resource, or a synthesis across cards). Cards are written in standard academic English.

## Frontmatter schema

```yaml
---
title: Adaptive noise cancelling: principles and applications   # required
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

## Naming rules

- File name = slug = `citation_key` for papers, lowercase-kebab-case English for everything else.
- One slug must be unique across the whole repo.
- Wiki links in the body — `[[slug]]` — must point to an existing card slug.

## Status lifecycle

| status | meaning | location |
|---|---|---|
| `pending` | draft, not yet reviewed | `90_pending/` |
| `reviewed` | reviewed, changes requested or awaiting promotion | `90_pending/` |
| `official` | approved | moved by CI into `01_…`–`05_…` |

The reviewer — not the author — flips `status` to `official` during PR review. This is the human review gate.

## Body layout

English, section by section. The first two sections are always required; the rest are type-specific and may be omitted when irrelevant.

```markdown
## Summary
## Key points
## Method        (paper / algorithm)
## Results        (paper)
## When to use    (algorithm / resource)
## My notes
## References
```

`Summary` and `Key points` are always required.
