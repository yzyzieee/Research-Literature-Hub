# Literature Record Specification

Research Literature Hub is a paper-first literature management and LLM-context system
for research groups. Original PDFs remain in external storage; structured literature
records are stored as Markdown in the repository.

Legacy concept and algorithm notes remain readable during migration but are excluded
from the main Library, Ratings, and **Use with My LLM** workflow. Every new record uses
`entry_type: literature`.

## Frontmatter schema

```yaml
---
title: Adaptive filtering for a reproducible signal-processing task
entry_type: literature
publication_type: journal-paper
primary_domain: fundamentals-dsp
domains: [fundamentals-dsp, machine-learning-audio]
venue: Example Journal
doi: 10.0000/example.2026.001
abstract: ""
status: official
citation_key: sample2026adaptive
authors: [Alex Researcher, Morgan Example]
year: 2026
tags: [adaptive-filter, reproducibility]
drive: []
related: []
created: 2026-06-14
reviewed_by: []
rating: null
ratings: []
comments: []
uploaded_by: DEMO
uploaded_at: 2026-06-14T12:00:00.000Z
pdf_uploaded_by: ""
pdf_uploaded_at: ""
pdf_file_name: ""
pdf_reused: false
activity: []
---
```

## Controlled fields

### `primary_domain` and `domains`

- `active-noise-control`
- `acoustic-echo-cancellation`
- `speech-enhancement`
- `source-separation`
- `beamforming-arrays`
- `spatial-audio`
- `audio-coding`
- `room-acoustics`
- `machine-learning-audio`
- `fundamentals-dsp`
- `other`

`primary_domain` is the single filing and statistics axis. `domains` is a non-empty
multi-value list that must include the primary domain. Cross-domain matches use
`domains`; primary grouping uses `primary_domain`.

### `publication_type`

- `journal-paper`
- `conference-paper`
- `preprint`
- `review-paper`
- `book`
- `book-chapter`
- `patent`
- `thesis`
- `technical-report`
- `dataset-paper`
- `other`

Publication type is academic metadata only. External storage remains the original-file
repository; classification and cross-domain relationships live in the literature record.

### `tags`

Use one to six specific lowercase kebab-case technical topics, ordered broad to narrow.
Do not use years, author names, or generic labels such as `paper` or `research`.

## Naming and duplicate rules

- The Markdown file name equals `citation_key`.
- Citation keys may use letters, numbers, dots, underscores, and hyphens.
- The Drive adapter names files with the globally unique format
  `NNNN_citationKey.pdf`.
- Storage duplicate detection uses DOI and citation key.
- GitHub publication checks DOI, normalized title, and citation key.

## Body layout

Every new literature record uses this English structure:

```markdown
## Summary
## Problem
## Method
## Key results
## Strengths
## Limitations
## Relevance to our group
## Notes
## References
```

## Team evaluation

Members rate recommendation, innovation, and rigor from 1 to 5. The app converts the
three averages into a 0-100 team weight. Attributed comments and PDF, publication,
rating, and comment actions are preserved in the record's audit trail.
