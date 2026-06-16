# Changelog

All notable human-facing changes are summarized here. The app version is bumped
automatically by the maintenance workflow after changes land on `main`.

## v0.1.58 - 2026-06-16

- Added this changelog so release history is readable outside Git commit logs.
- Fixed AI-suggested Key Figure page handling: suggestions now use actual PDF
  file pages, and printed journal page numbers are mapped back to PDF pages when
  possible.

## v0.1.57 - 2026-06-16

- Consolidated PDF archive and re-read controls on the paper intake page.
- Restored compact detail for key related papers.
- Clarified labels around AI reading, archiving, and review actions.

## v0.1.56 - 2026-06-16

- Added `Luo2024Real-time` to the official literature library.

## v0.1.55 - 2026-06-16

- Fixed Key Figure preview navigation to jump to the AI-suggested figure page.
- Added visible AI extraction progress and timeout feedback.

## v0.1.54 - 2026-06-16

- Added an optional correction hint for AI re-reading so users can point out
  what the previous extraction got wrong.

## v0.1.53 - 2026-06-16

- Tightened metadata extraction rules so the AI does not fabricate venue, DOI,
  or year.
- Added Crossref recovery for real metadata when the PDF text is incomplete.

## Earlier v0.1.x Highlights

- Built the paper-first intake workflow with PDF upload, AI metadata extraction,
  Drive archiving, duplicate checks, and GitHub-backed literature records.
- Added team accounts, member settings, review queues, ratings, comments, and
  card governance.
- Added lightweight key related papers and automatic internal/external link
  synchronization.
- Added private Key Figure caching through Drive without storing paper images in
  the public repository.
- Added live GitHub reads so library pages update shortly after GitHub writes
  instead of waiting for a full Vercel redeploy.
- Added Guest Demo mode and bilingual project documentation.
