# Changelog

All notable human-facing changes are summarized here. The app version is bumped
automatically by the maintenance workflow after changes land on `main`.

## v0.1.75 - 2026-06-17

- Set the literature library to 14 papers per page so figure-heavy cards remain
  easy to scan.
- Added labeled active filters with a clear-all action.
- Added a Key Figure focus view for larger image inspection.
- Hid the citation key line from the detail header; BibTeX export still keeps it.

## v0.1.73 - 2026-06-17

- Simplified the cached Key Figure header to a single edit action; remove and
  replacement controls now live inside the expanded editor.

## v0.1.63 - 2026-06-17

- Unified clickable library filter chips for domains, publication type, venue,
  year, and tags so linked badges keep the compact metadata size.
- Moved detail-page LLM/edit/delete actions into the main action row and made
  the abstract a compact expandable preview.

## v0.1.62 - 2026-06-16

- Fixed Key Figure candidate page selection more precisely: figure pages are now
  resolved from the figure label found in the PDF itself, so a mixed AI result
  such as `Fig. 1` on page 7 can be corrected to the actual PDF page without
  shifting already-correct candidates such as `Fig. 4` on page 8.

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
