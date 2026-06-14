import { DOMAINS } from "./types";
import type { TeamMember } from "./types";

export const GUEST_ID = "GUEST";

export const GUEST_MEMBER: TeamMember = {
  id: GUEST_ID,
  name: "Guest Demo",
  role: "member",
  domains: [...DOMAINS],
  active: true,
  created: "2026-06-15",
};

export function isGuest(username?: string | null): boolean {
  return String(username || "").toUpperCase() === GUEST_ID;
}

export function guestLiteratureDraft(seed = "") {
  const firstLine = seed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length >= 12 && line.length <= 180);
  const title = firstLine || "Guest demonstration literature record";
  const year = new Date().getFullYear();
  return {
    entry_type: "literature",
    primary_domain: "active-noise-control",
    domains: ["active-noise-control", "fundamentals-dsp"],
    publication_type: "journal-paper",
    title,
    authors: ["Guest Demo Author"],
    year,
    venue: "Guest Sandbox",
    doi: "",
    abstract:
      "This record is generated locally for the public guest demonstration. It is not extracted by an external LLM and is never published to the team library.",
    tags: ["anc", "adaptive-filter", "demo"],
    citation_key: `Guest${year}Demo`,
    body: [
      "## Summary",
      "",
      "Guest sandbox summary generated to demonstrate the literature intake workflow. Replace it with verified paper content in a real team account.",
      "",
      "## Problem",
      "",
      "Demonstrates how a research problem is recorded in a structured literature entry.",
      "",
      "## Method",
      "",
      "Demonstrates the method section without calling an external LLM.",
      "",
      "## Key results",
      "",
      "No scientific result is claimed in guest mode.",
      "",
      "## Strengths",
      "",
      "Shows the complete review and publishing interface safely.",
      "",
      "## Limitations",
      "",
      "This is demonstration content and must not be cited or used as research evidence.",
      "",
      "## Relevance to our group",
      "",
      "Illustrates how team-facing relevance can be captured.",
      "",
      "## Notes",
      "",
      "Guest actions remain temporary and do not change GitHub, Drive, ratings, or comments.",
      "",
      "## References",
      "",
      "- Guest sandbox record; no external reference.",
    ].join("\n"),
  };
}
