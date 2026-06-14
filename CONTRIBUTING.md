# Contributing

Thank you for contributing to Research Literature Hub.

## Before you start

- Open an issue for substantial behavior, schema, or architecture changes.
- Keep pull requests focused and explain the user-facing reason for the change.
- Never commit credentials, private links, confidential material, or paper PDFs.
- Confirm that any sample content is original, openly licensed, or clearly fictional.

## Development setup

```bash
cd webapp
npm install
copy .env.example .env.local
npm run dev
```

Use placeholder values locally until you intentionally test an external integration.

## Required checks

Run these before opening a pull request:

```bash
python scripts/check_secrets.py
python scripts/check_cards.py
python scripts/update_index.py
cd webapp
npm run build
```

Generated index changes should be committed when literature records change.

## Literature record contributions

- Do not upload or commit the source PDF.
- Do not include private Google Drive links in public examples.
- Use the schema in `docs/LITERATURE_RECORD_SPEC.md`.
- Verify title, authors, year, venue, DOI, citation key, and technical claims.
- Write summaries in your own words and keep quotations short and attributed.
- Separate paper claims from team interpretation.
- Use one primary domain and only relevant cross-domains.
- Use one to six lowercase kebab-case technical tags.

## Pull requests

A good pull request includes:

- What changed.
- Why it changed.
- How it was tested.
- Any migration, deployment, or environment-variable impact.
- Screenshots for meaningful UI changes.

By contributing, you agree that your contribution may be distributed under the
repository's MIT License and that you have the right to submit it.
