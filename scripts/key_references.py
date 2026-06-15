"""Shared key-reference parsing and conservative library-link resolution."""
from __future__ import annotations

import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass

KEY_REFERENCE_ROLES = {
    "foundation", "method", "baseline", "dataset", "survey", "related_work"}


@dataclass(frozen=True)
class ReferenceIndexes:
    doi: dict[str, str]
    title: dict[str, str]


def normalized_doi(value: object) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"^https?://(dx\.)?doi\.org/", "", text)
    return re.sub(r"^doi:\s*", "", text)


def normalized_title(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or "").lower())
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def parse_key_references(value: object) -> list[dict]:
    if not isinstance(value, list):
        return []
    output = []
    for item in value[:8]:
        if not isinstance(item, dict) or not str(item.get("title", "")).strip():
            continue
        role = str(item.get("role", "")).strip()
        output.append({
            "title": str(item.get("title", "")).strip(),
            "doi": str(item.get("doi", "")).strip(),
            "year": item.get("year"),
            "role": role if role in KEY_REFERENCE_ROLES else "",
            "reason": re.sub(r"\s+", " ", str(item.get("reason", ""))).strip(),
            "status": "external",
            "linked_card": None,
        })
    return output


def build_reference_indexes(records: list[dict]) -> ReferenceIndexes:
    doi_candidates: dict[str, list[str]] = defaultdict(list)
    title_candidates: dict[str, list[str]] = defaultdict(list)
    for record in records:
        slug = str(record.get("slug", "")).strip()
        if not slug:
            continue
        doi = normalized_doi(record.get("doi"))
        title = normalized_title(record.get("title"))
        if doi:
            doi_candidates[doi].append(slug)
        if len(title) > 12:
            title_candidates[title].append(slug)
    return ReferenceIndexes(
        doi={
            key: slugs[0]
            for key, slugs in doi_candidates.items()
            if len(slugs) == 1
        },
        title={
            key: slugs[0]
            for key, slugs in title_candidates.items()
            if len(slugs) == 1
        },
    )


def resolve_key_references(
    value: object,
    indexes: ReferenceIndexes,
    current_slug: str = "",
) -> list[dict]:
    references = parse_key_references(value)
    for reference in references:
        doi = normalized_doi(reference["doi"])
        linked = indexes.doi.get(doi) if doi else None
        if linked is None and not doi:
            title = normalized_title(reference["title"])
            linked = indexes.title.get(title) if len(title) > 12 else None
        if linked and linked != current_slug:
            reference["status"] = "in_library"
            reference["linked_card"] = linked
    return references
