"""Persist key-reference links after the library gains or loses papers."""
from __future__ import annotations

import re

import yaml

from kblib import OFFICIAL_DIR, iter_cards, utf8_stdout
from key_references import build_reference_indexes, resolve_key_references

TOP_LEVEL_FIELD = re.compile(r"^[A-Za-z_][A-Za-z0-9_-]*\s*:")


def replace_frontmatter_field(path, field: str, value: object) -> None:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        raise ValueError("missing frontmatter block")

    end = next(
        (index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---"),
        None,
    )
    if end is None:
        raise ValueError("unterminated frontmatter block")

    start = next(
        (
            index for index, line in enumerate(lines[1:end], start=1)
            if re.match(rf"^{re.escape(field)}\s*:", line)
        ),
        None,
    )
    rendered = yaml.safe_dump(
        {field: value},
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
        width=1000,
    )
    rendered_lines = [f"{line}\n" for line in rendered.rstrip().splitlines()]

    if start is None:
        lines[end:end] = rendered_lines
    else:
        stop = start + 1
        while stop < end and not TOP_LEVEL_FIELD.match(lines[stop]):
            stop += 1
        lines[start:stop] = rendered_lines
    path.write_text("".join(lines), encoding="utf-8")


def main() -> None:
    utf8_stdout()
    cards = [card for card in iter_cards() if not card.parse_error]
    official_literature = [
        {
            "slug": card.slug,
            "title": card.meta.get("title", card.slug),
            "doi": card.meta.get("doi", ""),
        }
        for card in cards
        if card.folder == OFFICIAL_DIR
        and (
            card.meta.get("entry_type") == "literature"
            or card.meta.get("type") == "paper"
        )
    ]
    indexes = build_reference_indexes(official_literature)
    changed = 0
    linked = 0
    unlinked = 0

    for card in cards:
        existing = card.meta.get("key_references")
        if not isinstance(existing, list):
            continue
        resolved = resolve_key_references(existing, indexes, card.slug)
        if resolved == existing:
            continue
        old_links = {
            str(item.get("linked_card"))
            for item in existing
            if isinstance(item, dict) and item.get("linked_card")
        }
        new_links = {
            str(item.get("linked_card"))
            for item in resolved
            if item.get("linked_card")
        }
        replace_frontmatter_field(card.path, "key_references", resolved)
        changed += 1
        linked += len(new_links - old_links)
        unlinked += len(old_links - new_links)
        print(f"Synced {card.rel_path}")

    print(
        f"Synced key references in {changed} card(s): "
        f"{linked} linked, {unlinked} returned to external."
    )


if __name__ == "__main__":
    main()
