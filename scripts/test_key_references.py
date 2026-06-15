"""Tests for persistent key-reference synchronization."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from kblib import parse_card
from key_references import build_reference_indexes, resolve_key_references
from sync_key_references import replace_frontmatter_field


def reference(**overrides) -> dict:
    value = {
        "title": "Paper B",
        "doi": "10.1000/b",
        "year": 2024,
        "role": "baseline",
        "reason": "Used as the main baseline.",
        "status": "external",
        "linked_card": None,
    }
    value.update(overrides)
    return value


class KeyReferenceTests(unittest.TestCase):
    def test_external_reference_becomes_internal(self) -> None:
        indexes = build_reference_indexes([
            {
                "slug": "paperB",
                "title": "Paper B",
                "doi": "https://doi.org/10.1000/B",
            },
        ])
        resolved = resolve_key_references([reference()], indexes, "paperA")
        self.assertEqual(resolved[0]["status"], "in_library")
        self.assertEqual(resolved[0]["linked_card"], "paperB")

    def test_missing_card_returns_to_external(self) -> None:
        resolved = resolve_key_references([
            reference(status="in_library", linked_card="removedPaper"),
        ], build_reference_indexes([]), "paperA")
        self.assertEqual(resolved[0]["status"], "external")
        self.assertIsNone(resolved[0]["linked_card"])

    def test_ambiguous_identifiers_do_not_link(self) -> None:
        indexes = build_reference_indexes([
            {"slug": "paperB1", "title": "A sufficiently long duplicate title", "doi": "10.1000/dup"},
            {"slug": "paperB2", "title": "A sufficiently long duplicate title", "doi": "10.1000/dup"},
        ])
        resolved = resolve_key_references([
            reference(
                title="A sufficiently long duplicate title",
                doi="10.1000/dup",
            ),
        ], indexes, "paperA")
        self.assertEqual(resolved[0]["status"], "external")
        self.assertIsNone(resolved[0]["linked_card"])

    def test_only_key_reference_block_is_rewritten(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "paperA.md"
            path.write_text(
                "---\n"
                "title: Paper A\n"
                "key_references: []\n"
                "tags: [test]\n"
                "---\n\n"
                "## Summary\n\nKeep this body unchanged.\n",
                encoding="utf-8",
            )
            replace_frontmatter_field(path, "key_references", [
                reference(status="in_library", linked_card="paperB"),
            ])
            card = parse_card(path)
            self.assertEqual(card.meta["title"], "Paper A")
            self.assertEqual(card.meta["tags"], ["test"])
            self.assertEqual(card.meta["key_references"][0]["linked_card"], "paperB")
            self.assertEqual(card.body, "## Summary\n\nKeep this body unchanged.\n")


if __name__ == "__main__":
    unittest.main()
