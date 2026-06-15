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
key_references:
  - title: A foundational related paper
    doi: 10.0000/example.2021.001
    year: 2021
    role: foundation
    reason: Defines the core formulation used by this paper.
    status: external
    linked_card: null
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

### `key_references`

`key_references` is an optional list of three to eight high-value related-paper anchors,
not a complete bibliography. Leave it empty when the source reference list is unavailable
or uncertain.

Allowed roles are `foundation`, `method`, `baseline`, `dataset`, `survey`, and
`related_work`. Each item requires a title and one short reason. DOI and year are optional,
but DOI is preferred when available.

The app links references to existing cards by exact normalized DOI first, then by a
conservative exact normalized-title match. A matched reference uses `status: in_library`
and its card slug in `linked_card`; unmatched references remain `status: external` with
`linked_card: null`. Key references never create cards automatically and must not contain
full abstracts, full author lists, BibTeX, or the paper's full bibliography.

After every publication to `main`, repository maintenance rebuilds DOI and title indexes
from official literature records and synchronizes all existing cards. A reference that was
previously external is therefore persisted as `in_library` when that paper is added later.
If a linked card is removed or no longer resolves uniquely, it safely returns to `external`.

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
```

Do not add a `References`, `Bibliography`, `Related work`, or `Works cited` section to
the body. The compact `key_references` metadata is the only related-paper list retained
by the literature record.

Write important equations with `$...$` for inline math and `$$...$$` for display math.
Do not place equations in backticks or code fences. Define notation in nearby prose so
the Method section remains readable when exported as text as well as rendered in the app.

## Team evaluation

Members rate recommendation, innovation, and rigor from 1 to 5. The app converts the
three averages into a 0-100 team weight. Attributed comments and PDF, publication,
rating, and comment actions are preserved in the record's audit trail.
