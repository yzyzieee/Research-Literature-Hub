# Research Literature Hub

A paper-first research literature management and LLM-context hub for research groups.

Research Literature Hub stores structured paper records, links to externally stored
PDFs, supports team ratings and attributed comments, and exports LLM-ready literature
context for research discussion.

它是一个面向研究组、以论文为核心的文献管理与 LLM 上下文平台。系统保存结构化
文献记录和外部 PDF 链接，支持团队评分与署名评论，并导出适合交给外部 LLM 使用的
可信文献上下文。

## Why this project

Research groups often spread paper PDFs, reading notes, ratings, and discussion across
personal drives and chat histories. This project keeps the durable record in GitHub,
stores original PDFs outside the repository, and gives each member a consistent way to
reuse the group's literature context with their own ChatGPT, Claude, Gemini, Kimi, or
other LLM subscription.

The web app is a context provider, not a built-in research chatbot. API-backed extraction
is optional and is used only to draft structured records from uploaded papers.

## Features

- PDF-first paper intake with explicit AI extraction, metadata review, and publication.
- One primary research domain plus optional cross-domain classification.
- DOI, citation-key, normalized-title, and storage-metadata duplicate checks.
- Structured summaries covering problem, method, results, strengths, and limitations.
- Team ratings for recommendation, innovation, and rigor.
- Attributed comments and append-only activity history.
- Generated Markdown and JSON catalogs for external LLMs.
- Compact catalog and selected-record context packs for large libraries.
- English and Chinese interface with English academic metadata.
- GitHub-backed records and configurable Google Drive PDF storage.

## Architecture

```text
Browser / Next.js web app
        |
        +-- GitHub repository
        |     +-- official/         published literature records
        |     +-- team/             team account configuration
        |     +-- index/            generated indexes and LLM catalogs
        |     +-- bib/              merged bibliography data
        |
        +-- External PDF storage
        |     +-- Google Drive adapter included
        |
        +-- Optional LLM provider
              +-- metadata and structured-record drafting
```

Markdown literature records are the source of truth. The web app does not maintain a
separate database.

## Quick start

Requirements:

- Node.js 20 or newer
- Python 3.12 or newer
- A GitHub repository for published records

```bash
git clone https://github.com/your-org/research-literature-hub.git
cd research-literature-hub/webapp
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without GitHub, Drive, or LLM credentials, the repository
can still be browsed locally and the validation/index scripts can be used.

## Configuration

The complete template is [webapp/.env.example](webapp/.env.example). Core variables:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Signs team login session cookies |
| `GITHUB_TOKEN` | Fine-grained token with repository Contents read/write |
| `GITHUB_REPO` | Target repository in `owner/repository` form |
| `NEXT_PUBLIC_GITHUB_REPO` | Repository used for public links and LLM catalogs |
| `LLM_PROVIDER` | Optional extraction provider |
| Provider API key | Key matching the selected LLM provider |
| `DRIVE_FOLDER_ID` | Google Drive folder used by the included storage adapter |
| Google OAuth or service-account variables | Server-side Drive authorization |

Never commit `.env.local`, OAuth refresh tokens, service-account JSON files, API keys,
or PDF files.

## Literature workflow

1. Choose a PDF.
2. Explicitly start AI extraction, if configured.
3. Verify bibliographic metadata and the structured reading record.
4. Select one primary domain and optional cross-domains.
5. Archive the PDF in external storage.
6. Publish the Markdown literature record to GitHub.
7. Team members rate and comment on the paper.
8. Use **Use with My LLM** to export a catalog prompt or selected-paper context pack.

## Data model

Important fields include:

- `entry_type: literature`
- `primary_domain` and `domains`
- `publication_type`
- `title`, `authors`, `year`, `venue`, `doi`, and `citation_key`
- `tags`
- `rating`, `ratings`, and `comments`
- PDF provenance and `activity`

See [Literature Record Specification](docs/LITERATURE_RECORD_SPEC.md).

## LLM context workflow

Generated files:

- `index/llm_catalog.md` for browsing-capable LLMs
- `index/llm_catalog.json` for tools, scripts, and future integrations

Recommended usage:

1. Start with the catalog for retrieval across 100-500+ papers.
2. Select a small relevant set.
3. Export full structured records only for deeper discussion.

See [Using the Hub with an LLM](docs/LLM_USAGE.md).

## Validation and maintenance

```bash
pip install -r scripts/requirements.txt
python scripts/check_secrets.py
python scripts/check_cards.py
python scripts/update_index.py
python scripts/merge_bibtex.py
cd webapp
npm run build
```

GitHub Actions validates records, scans tracked files for common secret patterns,
rebuilds indexes, merges bibliography data, bumps the patch version, and publishes
generated changes after updates reach `main`.

## Deployment

The included web app is designed for Vercel with `webapp` as the project root. See
[Deployment](docs/DEPLOYMENT.md) for GitHub, Vercel, environment variable, and
post-deployment verification steps.

## Project governance

This is a maintainer-controlled project published for transparency, reuse, and
self-hosting. The public repository is not an invitation to modify the maintainer's
hosted literature library, team records, or deployment.

External pull requests and feature requests are not actively solicited and may be
closed without review. Users who need different workflows should fork the software and
operate their own repository and storage configuration.

## Security and content policy

- Security reports: [SECURITY.md](SECURITY.md)
- Copyright and content boundaries:
  [docs/COPYRIGHT_AND_CONTENT_POLICY.md](docs/COPYRIGHT_AND_CONTENT_POLICY.md)

## License

MIT License. Copyright (c) 2026 Ziyi Yang.

The license does not grant rights to third-party papers, PDFs, publisher content, or
external datasets referenced by literature records. See [NOTICE](NOTICE).
