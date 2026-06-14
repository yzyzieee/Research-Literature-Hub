# Audio Literature Hub

A paper-first literature management system for an audio research group.

The system archives PDFs, extracts structured publication metadata, assigns each
paper to a research domain, supports team ratings and attributed comments, and
exports trusted literature context for LLM-assisted research.

一个以论文为核心的组内文献管理系统。系统负责归档 PDF、自动提取论文元数据、
按研究方向分类、支持组内评分和带署名评论，并把高可信文献上下文导出给 LLM
用于后续调研。

## Product scope

1. Collect and normalize research PDFs.
2. Extract publication metadata and structured reading records.
3. Organize literature by one primary domain, optional cross-domains, and publication metadata.
4. Capture team ratings, comments, provenance, and audit history.
5. Export trusted records and direct PDF links to members' own LLM subscriptions.
6. Avoid duplicate uploads and repeated reading through DOI, title, citation-key,
   and Drive checks.

Concept and algorithm notes are legacy secondary content. New submissions always
use `entry_type: literature`.

## Storage

- Google Drive: a flat original-PDF repository using `NNNN_citationKey.pdf`.
- GitHub `official/`: English Markdown literature records.
- GitHub `team/`: team accounts and selected research domains.
- GitHub `index/`: generated machine-readable and Markdown indexes.
- Vercel `webapp/`: the collaborative UI and serverless APIs.

## Literature schema

The primary metadata fields are:

- `entry_type: literature`
- `primary_domain` and `domains`
- `publication_type`
- `venue`, `doi`, `citation_key`, `authors`, `year`
- `tags`
- `rating`, `ratings`, `comments`
- PDF provenance and `activity`

See [docs/CARD_SPEC.md](docs/CARD_SPEC.md) for the complete schema and unified
reading template.

## Workflow

1. Choose a PDF, then explicitly start AI extraction to generate a draft record.
2. Verify title, authors, year, DOI, venue, primary/cross-domains, publication type, and tags.
3. Archive the PDF to Drive; the app numbers and renames it consistently.
4. Optionally ask Gemini to re-read the archived original PDF.
5. Publish directly to `official/`.
6. Team members rate and comment from their domain-specific queues.
7. Export selected records, comments, scores, and PDF links to an external LLM.

## External LLM workflow

The app is a context provider, not a group-funded chatbot:

1. `index/llm_catalog.md` and `index/llm_catalog.json` provide compact, generated
   entry points for web-enabled LLMs and future tooling.
2. The **Use with my LLM** page creates a GitHub-access prompt or a filtered
   compact catalog for first-pass retrieval.
3. After narrowing the list, members can prepare a full context pack for up to
   25 selected papers.

## Maintenance

```bash
pip install -r scripts/requirements.txt
python scripts/check_cards.py
python scripts/update_index.py
python scripts/merge_bibtex.py
```

CI validates records, rebuilds indexes, merges bibliographies, bumps the web app
patch version, and triggers Vercel deployment after changes reach `main`.
