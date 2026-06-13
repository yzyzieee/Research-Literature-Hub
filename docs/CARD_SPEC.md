# Card specification

Every card is a single Markdown file with YAML frontmatter. One card = one fact-unit of knowledge (a paper, a concept, an algorithm, a resource, or a synthesis across cards). Cards are written in standard academic English.

Cards are stored flat: `pending/` while in review, `official/` once approved. They are **organised by domain and type via frontmatter** (the web app groups and filters by it) — not by folder.

## Frontmatter schema

```yaml
---
title: Adaptive noise cancelling: principles and applications   # required
type: paper            # paper | concept | algorithm | resource | synthesis (required)
domain: active-noise-control   # required — one of the DOMAINS in scripts/kblib.py
source_type: paper     # paper | conference | book | patent | other (optional; the Drive doc kind)
status: pending        # pending | reviewed | official (required)
citation_key: widrow1975adaptive   # Better BibTeX key — required for type: paper
authors: [B. Widrow, J. R. Glover] # required for paper
year: 1975                         # required for paper
tags: [anc, adaptive-filter, lms]  # domain keywords, broad -> narrow (required, >=1)
drive: []              # Google Drive links to PDFs / data / audio
related: []            # slugs of related cards, e.g. [fxlms, active-noise-control]
created: 2026-06-12    # YYYY-MM-DD (required)
reviewed_by: []        # GitHub usernames of reviewers
---
```

## Field rules

- **type** — the knowledge-unit kind. **domain** — the research field (primary organising axis). They are independent: a `paper` in `active-noise-control`, a `concept` in `speech-enhancement`, etc.
- **tags** — lowercase kebab-case domain keywords, ordered **broad → narrow** (e.g. `[anc, adaptive-filter, lms]`). **Not** years, **not** author names — the year lives in `year`, authors in `authors`.
- **domain** — must be one of the controlled list in `scripts/kblib.py` (`DOMAINS`). Edit that list to add a field.

## Naming rules

- File name = slug = `citation_key` for papers, lowercase-kebab-case English for everything else. Unique across the repo.
- Wiki links in the body — `[[slug]]` — must point to an existing card slug.

## Status lifecycle

| status | meaning | location |
|---|---|---|
| `pending` | draft, not yet reviewed | `pending/` |
| `reviewed` | reviewed, changes requested or awaiting promotion | `pending/` |
| `official` | approved | moved by CI into `official/` |

The reviewer — not the author — flips `status` to `official` during PR review. After merge, CI moves the card from `pending/` to `official/`.

## Body layout

English, section by section. `Summary` and `Key points` are always required; the rest are type-specific and may be omitted when irrelevant.

```markdown
## Summary
## Key points
## Method        (paper / algorithm)
## Results        (paper)
## When to use    (algorithm / resource)
## My notes
## References
```
