# Using Research Literature Hub with an LLM

Research Literature Hub is an LLM context provider. Team members continue using their
own ChatGPT, Claude, Gemini, Kimi, or other subscription.

## Mode 1: Repository access prompt

Use this when the LLM can browse public GitHub raw files.

The prompt points to `index/llm_catalog.md`, asks the model to retrieve candidates from
the internal library first, and tells it to open only the most relevant literature
records. This is the lowest-cost way to work with a large library.

## Mode 2: Compact catalog pack

Use this when the LLM cannot reliably access GitHub.

Filter the library by domain or search terms, then paste compact metadata and one-line
summaries directly into the conversation. For 100-500+ papers, narrow the catalog before
copying to stay within the model's context window.

## Mode 3: Selected full paper pack

Use this after the catalog has identified a small relevant set.

The pack includes structured summaries, team ratings, attributed comments, record URLs,
and available external PDF links. It is intentionally capped so the LLM can reason over
the selected records instead of receiving the entire library.

## Grounding rules

Ask the LLM to:

- Distinguish source-paper claims from team comments.
- Cite the title, citation key, and literature record URL.
- State when the internal library does not cover a question.
- Avoid inventing papers, results, links, or quotations.
- Treat inaccessible PDF links as references, not as evidence it has read the full text.

## Privacy

Do not paste confidential comments, unpublished manuscripts, private PDF links, or
personal data into an external LLM unless your organization permits it and the provider's
data controls are appropriate.
