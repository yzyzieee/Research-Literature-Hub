"""Move cards in pending/ with status: official into official/.

Run by CI after every merge to main — the reviewer flips status during PR review,
the merge triggers the move.
"""
from __future__ import annotations

from kblib import OFFICIAL_DIR, PENDING_DIR, ROOT, iter_cards, utf8_stdout


def main() -> None:
    utf8_stdout()
    moved = 0
    (ROOT / OFFICIAL_DIR).mkdir(exist_ok=True)
    for card in iter_cards():
        if card.folder != PENDING_DIR or card.parse_error:
            continue
        if card.meta.get("status") != "official":
            continue
        target = ROOT / OFFICIAL_DIR / card.path.name
        if target.exists():
            print(f"WARN  {card.rel_path}: {OFFICIAL_DIR}/{card.path.name} already exists — skipped")
            continue
        card.path.rename(target)
        moved += 1
        print(f"Promoted {card.slug} -> {OFFICIAL_DIR}/")
    print(f"Promoted {moved} card(s).")


if __name__ == "__main__":
    main()
