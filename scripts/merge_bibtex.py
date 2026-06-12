"""Merge bib/personal/*.bib into bib/library.bib, deduplicating by citation key."""
from __future__ import annotations

import re
from datetime import date

from kblib import ROOT, utf8_stdout

ENTRY_START = re.compile(r"@(\w+)\s*\{\s*([^,\s]+)\s*,")


def split_entries(text: str) -> list[tuple[str, str]]:
    """Return (key, entry_text) pairs using brace counting."""
    entries = []
    for match in ENTRY_START.finditer(text):
        start = match.start()
        depth = 0
        end = start
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        entries.append((match.group(2), text[start:end].strip()))
    return entries


def main() -> None:
    utf8_stdout()
    personal = ROOT / "bib" / "personal"
    merged: dict[str, str] = {}
    sources: dict[str, str] = {}
    for path in sorted(personal.glob("*.bib")):
        for key, entry in split_entries(path.read_text(encoding="utf-8")):
            if key in merged:
                if merged[key] != entry:
                    print(f"WARN  duplicate key '{key}' in {path.name} differs from {sources[key]} — keeping first")
                continue
            merged[key] = entry
            sources[key] = path.name

    header = (
        f"% library.bib — merged from bib/personal/*.bib by scripts/merge_bibtex.py on {date.today()}\n"
        f"% Do not edit by hand. 自动合并生成，请勿手改。\n\n"
    )
    body = "\n\n".join(merged[k] for k in sorted(merged))
    (ROOT / "bib" / "library.bib").write_text(header + body + "\n", encoding="utf-8")
    print(f"Merged {len(merged)} entries from {len(list(personal.glob('*.bib')))} file(s) -> bib/library.bib")


if __name__ == "__main__":
    main()
