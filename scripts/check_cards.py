"""Validate every card: frontmatter schema, naming, duplicates, links, status/folder consistency.

Exit code 1 if any error is found (warnings do not fail the build).
"""
from __future__ import annotations

import re
import sys

from kblib import (PENDING_DIR, STATUSES, TYPE_TO_DIR, TYPES, Card, iter_cards,
                   utf8_stdout)

REQUIRED_ALWAYS = ["title", "type", "status", "tags", "created"]
REQUIRED_PAPER = ["citation_key", "authors", "year"]
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")
REQUIRED_SECTIONS = ["## Summary", "## Key points"]


def main() -> int:
    utf8_stdout()
    cards = iter_cards()
    errors: list[str] = []
    warnings: list[str] = []
    slugs: dict[str, Card] = {}

    for card in cards:
        where = card.rel_path
        if card.parse_error:
            errors.append(f"{where}: {card.parse_error}")
            continue
        meta = card.meta

        if card.slug in slugs:
            errors.append(f"{where}: duplicate slug '{card.slug}' (also {slugs[card.slug].rel_path})")
        else:
            slugs[card.slug] = card

        if not SLUG_RE.match(card.slug):
            errors.append(f"{where}: file name must be lowercase kebab-case")

        for key in REQUIRED_ALWAYS:
            if not meta.get(key):
                errors.append(f"{where}: missing required field '{key}'")

        ctype = meta.get("type")
        status = meta.get("status")
        if ctype and ctype not in TYPES:
            errors.append(f"{where}: invalid type '{ctype}' (expected one of {sorted(TYPES)})")
        if status and status not in STATUSES:
            errors.append(f"{where}: invalid status '{status}' (expected one of {sorted(STATUSES)})")

        if ctype == "paper":
            for key in REQUIRED_PAPER:
                if not meta.get(key):
                    errors.append(f"{where}: paper card missing '{key}'")
            ck = meta.get("citation_key")
            if ck and ck != card.slug:
                errors.append(f"{where}: file name must equal citation_key '{ck}'")

        tags = meta.get("tags")
        if tags is not None and not isinstance(tags, list):
            errors.append(f"{where}: 'tags' must be a list")

        if card.folder == PENDING_DIR:
            if status == "official":
                warnings.append(f"{where}: status is official — will be promoted on next merge")
        else:
            if status != "official":
                errors.append(f"{where}: card in {card.folder} must have status official")
            if ctype and TYPE_TO_DIR.get(ctype) != card.folder:
                errors.append(f"{where}: type '{ctype}' belongs in {TYPE_TO_DIR.get(ctype)}, not {card.folder}")

        for section in REQUIRED_SECTIONS:
            if section not in card.body:
                errors.append(f"{where}: missing required section '{section}'")

    all_slugs = set(slugs)
    for card in cards:
        if card.parse_error:
            continue
        where = card.rel_path
        related = card.meta.get("related") or []
        if not isinstance(related, list):
            errors.append(f"{where}: 'related' must be a list")
            related = []
        targets = {str(r) for r in related} | set(WIKILINK_RE.findall(card.body))
        for target in sorted(targets):
            target = target.strip()
            if target and target not in all_slugs:
                level = warnings if card.folder == PENDING_DIR else errors
                level.append(f"{where}: link to unknown card '{target}'")

    for msg in warnings:
        print(f"WARN  {msg}")
    for msg in errors:
        print(f"ERROR {msg}")
    print(f"\nChecked {len(cards)} cards: {len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
