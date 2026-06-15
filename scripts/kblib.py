"""Shared helpers for knowledge-base maintenance scripts."""
from __future__ import annotations

import sys
import json
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent

# Flat storage: cards live in official/ once approved, pending/ while in review.
# Organisation by domain/publication type is metadata-driven.
OFFICIAL_DIR = "official"
PENDING_DIR = "pending"
CARD_DIRS = [OFFICIAL_DIR, PENDING_DIR]

# New records are literature-first. Legacy note types remain readable during migration.
ENTRY_TYPES = {"literature"}
LEGACY_TYPES = {"concept", "algorithm", "resource", "synthesis"}
STATUSES = {"pending", "reviewed", "official"}

# Research domains are administrator-approved in the shared registry.
DOMAIN_REGISTRY = ROOT / "webapp" / "data" / "domains.json"
with DOMAIN_REGISTRY.open(encoding="utf-8") as domain_file:
    DOMAINS = [
        str(item["id"])
        for item in json.load(domain_file).get("approved", [])
        if item.get("id")
    ]

# Publication kind is literature-record metadata only; Drive remains a flat PDF repository.
PUBLICATION_TYPES = {
    "journal-paper",
    "conference-paper",
    "preprint",
    "review-paper",
    "book",
    "book-chapter",
    "patent",
    "thesis",
    "technical-report",
    "dataset-paper",
    "other",
}


def utf8_stdout() -> None:
    """Avoid UnicodeEncodeError on Windows consoles."""
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")


@dataclass
class Card:
    path: Path
    slug: str
    meta: dict
    body: str
    parse_error: str | None = None

    @property
    def rel_path(self) -> str:
        return self.path.relative_to(ROOT).as_posix()

    @property
    def folder(self) -> str:
        return self.path.relative_to(ROOT).parts[0]


def parse_card(path: Path) -> Card:
    slug = path.stem
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return Card(path, slug, {}, text, parse_error="missing frontmatter block")
    end = text.find("\n---", 3)
    if end == -1:
        return Card(path, slug, {}, text, parse_error="unterminated frontmatter block")
    raw_meta = text[3:end]
    body = text[end + 4:].lstrip("\n")
    try:
        meta = yaml.safe_load(raw_meta) or {}
    except yaml.YAMLError as exc:
        return Card(path, slug, {}, body, parse_error=f"invalid YAML: {exc}")
    if not isinstance(meta, dict):
        return Card(path, slug, {}, body, parse_error="frontmatter is not a mapping")
    return Card(path, slug, meta, body)


def iter_cards() -> list[Card]:
    cards: list[Card] = []
    for dirname in CARD_DIRS:
        folder = ROOT / dirname
        if not folder.is_dir():
            continue
        for path in sorted(folder.glob("*.md")):
            cards.append(parse_card(path))
    return cards


def first_section_paragraphs(body: str, heading_prefix: str = "## Summary") -> list[str]:
    """Return the paragraphs of the Summary section (used for index excerpts)."""
    lines = body.splitlines()
    out: list[str] = []
    in_section = False
    para: list[str] = []
    for line in lines:
        if line.startswith("## "):
            if in_section:
                break
            in_section = line.startswith(heading_prefix)
            continue
        if not in_section:
            continue
        if line.strip():
            para.append(line.strip())
        elif para:
            out.append(" ".join(para))
            para = []
    if para:
        out.append(" ".join(para))
    return out
