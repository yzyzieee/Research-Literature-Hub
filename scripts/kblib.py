"""Shared helpers for knowledge-base maintenance scripts."""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent

TYPE_TO_DIR = {
    "concept": "01_concepts",
    "algorithm": "02_algorithms",
    "paper": "03_papers",
    "resource": "04_resources",
    "synthesis": "05_synthesis",
}
OFFICIAL_DIRS = list(TYPE_TO_DIR.values())
PENDING_DIR = "90_pending"
CARD_DIRS = OFFICIAL_DIRS + [PENDING_DIR]

TYPES = set(TYPE_TO_DIR)
STATUSES = {"pending", "reviewed", "official"}


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
