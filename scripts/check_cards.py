"""Validate every card: frontmatter schema, naming, duplicates, links, status/folder consistency.

Exit code 1 if any error is found (warnings do not fail the build).
"""
from __future__ import annotations

import re
import sys

from kblib import (DOMAINS, OFFICIAL_DIR, PENDING_DIR, SOURCE_TYPES, STATUSES,
                   TYPES, Card, iter_cards, utf8_stdout)

REQUIRED_ALWAYS = ["title", "type", "domain", "status", "tags", "created"]
REQUIRED_PAPER = ["citation_key", "authors", "year"]
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
TAG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
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
        domain = meta.get("domain")
        source_type = meta.get("source_type")
        status = meta.get("status")
        if ctype and ctype not in TYPES:
            errors.append(f"{where}: invalid type '{ctype}' (expected one of {sorted(TYPES)})")
        if domain and domain not in DOMAINS:
            errors.append(f"{where}: invalid domain '{domain}' (expected one of {DOMAINS})")
        if source_type and source_type not in SOURCE_TYPES:
            errors.append(f"{where}: invalid source_type '{source_type}' (expected one of {sorted(SOURCE_TYPES)})")
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
        elif isinstance(tags, list):
            for tag in tags:
                if not TAG_RE.match(str(tag)):
                    errors.append(f"{where}: tag '{tag}' must be lowercase kebab-case")
                if str(tag).isdigit():
                    errors.append(f"{where}: tag '{tag}' looks like a year — tags are domain keywords, not years")

        if card.folder == PENDING_DIR:
            if status == "official":
                warnings.append(f"{where}: status is official — will be promoted on next merge")
        elif status != "official":
            errors.append(f"{where}: card in {OFFICIAL_DIR}/ must have status official")

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
