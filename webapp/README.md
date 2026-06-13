# Audio Research KB — Web App

Next.js UI layer over the knowledge-base repo. The repo (markdown cards in the parent folder) is the single source of truth — the app stores nothing itself.

## Features

- **Library** — browse all cards, client-side fuzzy search (title / tags / authors / summary), type filter
- **Card detail** — rendered markdown, `[[wiki-links]]` resolved to card links, Drive links, related cards, one-click "copy for your LLM"
- **Team ratings** — rate official literature for recommendation, innovation, and rigor; the aggregate 0–100 weight is stored in the card
- **New-card wizard** — choose a template, auto-fill metadata from a DOI (Crossref), optionally draft the English body with DeepSeek, then publish directly into `official/`
- **UI language toggle** — one-click EN / 中文 switch in the top-right; cards and classification stay English, only the interface chrome switches
- **导出 Export** — pick cards, bundle them into a prompt-ready markdown pack (with Drive full-text links and a token estimate) to paste into each member's own ChatGPT / Claude / Kimi — zero team API spend for literature research

## Local development

```bash
cd webapp
npm install
npm run dev          # http://localhost:3000
```

The app reads cards from the parent directory by default (`KB_PATH` env to override). No env vars are required for read-only browsing.

## Optional integrations (`.env.local`, see `.env.example`)

| Variable | Enables |
|---|---|
| `GITHUB_TOKEN` + `GITHUB_REPO` | Direct card publishing and team ratings through the GitHub Contents API. Use a fine-grained PAT with repository Contents read/write. |
| `DEEPSEEK_API_KEY` (+ `DEEPSEEK_MODEL`) | the "draft with DeepSeek" button. Frugal by design: one capped (3K tokens) non-streaming call per explicit click, nothing automatic. |
| `APP_PASSWORD` | Password-gates the whole site (login page + cookie). Unset = open access. Enforced in `middleware.ts`, so it also protects the write APIs (`/api/commit`, `/api/draft`), not just the UI. Changing it signs everyone out. |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub links in the UI (edit card, PR list) |

Without these, the wizard still works — download or copy the markdown and commit it yourself.

## Deployment (Vercel)

1. Push the whole repo (knowledge base + `webapp/`) to GitHub.
2. In Vercel: import the repo, set **Root Directory = `webapp`**.
3. Add the env vars above in Vercel project settings.
4. Every merge to `main` redeploys, so the site always reflects the latest cards. Content pages are statically generated at build time (`force-static`).

## Versioning

The app uses semantic versions from `webapp/package.json` and displays the
current version in the footer. Every non-bot push to `main` automatically bumps
the patch component (`0.1.0` -> `0.1.1`) in the `Maintain library` workflow,
commits the updated package files, and triggers the final Vercel deployment.
For a local/manual bump, run `npm run bump:patch` inside `webapp/`.

## Architecture notes

- Pages read markdown via `lib/kb.ts` (gray-matter) at build time; search runs client-side with Fuse.js over the serialized card index.
- Write paths never touch the local filesystem: `/api/commit` publishes validated cards directly to `official/`, while `/api/rate` updates rating metadata using the current GitHub file SHA.
- Rating commits trigger the normal GitHub/Vercel deployment, so the static library reflects the latest team weight after deployment.
