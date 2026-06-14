# Audio Literature Hub Web App

Next.js interface for the paper-first research-group literature repository.
Markdown records in the parent repository remain the source of truth.

## Main workflows

- **Literature library**: fuzzy search plus domain and relative-year filters.
- **New literature**: choose a PDF, explicitly start AI extraction, select one
  primary domain and any cross-domains, then publish a structured record.
- **Flat PDF archive**: Drive stores globally numbered `NNNN_citationKey.pdf`
  originals; all classification remains in card metadata.
- **Original-PDF analysis**: after Drive upload, members may explicitly ask
  Gemini to re-read the original PDF, including figures, equations, and tables.
- **Duplicate prevention**: citation key, DOI, normalized title, and Drive metadata.
- **Ratings**: personal domain queue, history, recommended, innovative, rigorous,
  and disputed literature views.
- **Comments and audit**: attributed team comments and append-only activity history.
- **External LLM export**: bundle records, ratings, comments, GitHub sources, and
  direct PDF links for ChatGPT, Claude, Kimi, or another subscribed LLM.
- **Three-stage context delivery**: copy a GitHub catalog prompt, paste a filtered
  compact catalog, or prepare up to 25 selected full records for deep discussion.

Legacy concept and algorithm notes remain directly readable but are excluded from
the main Library, Ratings, and Export workflows.

## Local development

```bash
cd webapp
npm install
npm run dev
```

The app reads the repository parent directory by default. Set `KB_PATH` to override.

## Environment variables

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Fine-grained token with repository Contents read/write |
| `GITHUB_REPO` | `owner/repository` used for direct publication and updates |
| `NEXT_PUBLIC_GITHUB_REPO` | Public GitHub links in the UI |
| `AUTH_SECRET` | Signs team-account session cookies |
| `LLM_PROVIDER` | `gemini` or another configured provider |
| `GEMINI_API_KEY` | Structured metadata and original-PDF analysis |
| `GEMINI_MODEL` | Defaults to `gemini-2.5-flash-lite` |
| `DRIVE_FOLDER_ID` | Shared Drive root folder |
| `GOOGLE_*` | Owner OAuth or service-account credentials for Drive |
| `NEXT_PUBLIC_DRIVE_UPLOAD` | Set to `1` to enable Drive archiving |
| `NEXT_PUBLIC_DRIVE_FOLDER_URL` | Shared folder link shown in the UI |

## Vercel

Import the repository with **Root Directory = `webapp`**, configure the Production
environment variables, and deploy `main`. The footer displays the package version;
the maintenance workflow increments its patch version after each non-bot push.
