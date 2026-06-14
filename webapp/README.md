# Research Literature Hub Web App

Next.js interface for Research Literature Hub. Markdown records in the repository remain
the source of truth; the app provides paper intake, search, ratings, comments, storage
integration, and LLM-context export.

## Local development

```bash
npm install
copy .env.example .env.local
npm run dev
```

The app reads the repository parent directory by default. Set `KB_PATH` only when the
records live elsewhere.

## Main workflows

- **Library**: search published literature by text, domain, and relative year.
- **Add Paper**: choose a PDF, explicitly run extraction, verify the record, archive the
  original, and publish.
- **Ratings**: review domain-specific papers and score recommendation, innovation, and
  rigor.
- **Comments**: attach attributed research interpretation and implementation notes.
- **Use with My LLM**: copy a repository access prompt, compact catalog, or selected
  full-record pack.

## Deployment

Import the repository into Vercel and set **Root Directory** to `webapp`. Configure
server-side credentials only in Vercel environment variables. See
[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
