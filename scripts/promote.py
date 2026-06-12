"""Move cards in 90_pending/ with status: official into their official folder.

Run by CI after every merge to main — the reviewer flips status during PR review,
the merge triggers the move.
"""
from __future__ import annotations

from kblib import PENDING_DIR, ROOT, TYPE_TO_DIR, iter_cards, utf8_stdout


def main() -> None:
    utf8_stdout()
    moved = 0
    for card in iter_cards():
        if card.folder != PENDING_DIR or card.parse_error:
            continue
        if card.meta.get("status") != "official":
            continue
        target_dir = TYPE_TO_DIR.get(card.meta.get("type", ""))
        if not target_dir:
            print(f"WARN  {card.rel_path}: official but unknown type — skipped")
            continue
        (ROOT / target_dir).mkdir(exist_ok=True)
        target = ROOT / target_dir / card.path.name
        if target.exists():
            print(f"WARN  {card.rel_path}: {target_dir}/{card.path.name} already exists — skipped")
            continue
        card.path.rename(target)
        moved += 1
        print(f"Promoted {card.slug} -> {target_dir}/")
    print(f"Promoted {moved} card(s).")


if __name__ == "__main__":
    main()
