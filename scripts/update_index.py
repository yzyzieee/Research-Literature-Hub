"""Regenerate index/cards.json and index/INDEX.md from all records."""
from __future__ import annotations

import json
import os
import re
from datetime import date

from kblib import (DOMAINS, PENDING_DIR, ROOT, first_section_paragraphs,
                   iter_cards, utf8_stdout)

REPOSITORY = os.getenv(
    "GITHUB_REPOSITORY", "your-org/research-literature-hub")
KEY_REFERENCE_ROLES = {
    "foundation", "method", "baseline", "dataset", "survey", "related_work"}


def compact_summary(value: str, limit: int = 420) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    return text if len(text) <= limit else text[:limit - 1].rstrip() + "…"


def normalized_doi(value: object) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"^https?://(dx\.)?doi\.org/", "", text)
    return re.sub(r"^doi:\s*", "", text)


def normalized_title(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


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


def main() -> None:
    utf8_stdout()
    cards = [card for card in iter_cards() if not card.parse_error]
    index = []
    for card in cards:
        meta = card.meta
        paragraphs = first_section_paragraphs(card.body)
        legacy_type = meta.get("type", "")
        entry_type = meta.get("entry_type") or (
            "literature" if legacy_type == "paper" else "legacy-note")
        primary_domain = meta.get("primary_domain") or meta.get("domain", "")
        domains = meta.get("domains") or ([primary_domain] if primary_domain else [])
        index.append({
            "slug": card.slug,
            "path": card.rel_path,
            "folder": card.folder,
            "title": meta.get("title", card.slug),
            "entry_type": entry_type,
            "publication_type": meta.get("publication_type", ""),
            "primary_domain": primary_domain,
            "domains": domains,
            "venue": meta.get("venue", ""),
            "doi": meta.get("doi", ""),
            "abstract": meta.get("abstract", ""),
            "status": meta.get("status", ""),
            "tags": meta.get("tags") or [],
            "authors": meta.get("authors") or [],
            "year": meta.get("year"),
            "citation_key": meta.get("citation_key", ""),
            "key_references": parse_key_references(meta.get("key_references")),
            "related": meta.get("related") or [],
            "drive": meta.get("drive") or [],
            "created": str(meta.get("created", "")),
            "rating": meta.get("rating"),
            "comments": meta.get("comments") or [],
            "uploaded_by": meta.get("uploaded_by", ""),
            "uploaded_at": str(meta.get("uploaded_at", "")),
            "summary": paragraphs[0] if paragraphs else "",
            "legacy_type": legacy_type,
        })
    for item in index:
        for reference in item["key_references"]:
            candidates = [
                candidate for candidate in index
                if candidate["slug"] != item["slug"]
            ]
            doi = normalized_doi(reference["doi"])
            match = next(
                (
                    candidate for candidate in candidates
                    if doi and normalized_doi(candidate["doi"]) == doi
                ),
                None,
            )
            if match is None and not doi:
                title = normalized_title(reference["title"])
                matches = [
                    candidate for candidate in candidates
                    if len(title) > 12
                    and normalized_title(candidate["title"]) == title
                ]
                if len(matches) == 1:
                    match = matches[0]
            if match:
                reference["status"] = "in_library"
                reference["linked_card"] = match["slug"]
    index.sort(key=lambda item: (
        item["entry_type"] != "literature", item["primary_domain"], item["slug"]))

    out_dir = ROOT / "index"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "cards.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    catalog = []
    for item in index:
        if item["entry_type"] != "literature" or item["folder"] == PENDING_DIR:
            continue
        rating = item.get("rating")
        team_weight = rating.get("weight") if isinstance(rating, dict) else None
        catalog.append({
            "slug": item["slug"],
            "title": item["title"],
            "year": item["year"],
            "venue": item["venue"],
            "publication_type": item["publication_type"],
            "primary_domain": item["primary_domain"],
            "domains": item["domains"],
            "tags": item["tags"],
            "team_weight": team_weight,
            "summary": compact_summary(item["summary"]),
            "key_references": [
                {
                    "title": reference["title"],
                    "doi": reference["doi"],
                    "year": reference["year"],
                    "role": reference["role"],
                    "reason": reference["reason"],
                }
                for reference in item["key_references"]
            ],
            "card_url": (
                f"https://raw.githubusercontent.com/{REPOSITORY}/main/"
                f"{item['path']}"),
        })

    (out_dir / "llm_catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8")

    catalog_lines = [
        "# Research Literature Hub — LLM Catalog",
        "",
        "Use this file as the entry point for searching our internal literature library.",
        "Search this catalog first, then open only the most relevant literature record files.",
        "Do not assume private Google Drive PDFs are accessible.",
        "",
        f"Papers: {len(catalog)}",
        "",
        "## Papers",
        "",
    ]
    for item in catalog:
        weight = (
            str(item["team_weight"])
            if item["team_weight"] is not None else "unrated")
        catalog_lines += [
            f"### {item['slug']}",
            f"- Title: {item['title']}",
            f"- Year: {item['year'] or 'unknown'}",
            f"- Venue: {item['venue'] or 'unknown'}",
            f"- Publication type: {item['publication_type'] or 'unknown'}",
            f"- Primary domain: {item['primary_domain']}",
            f"- Domains: {', '.join(item['domains'])}",
            f"- Tags: {', '.join(item['tags'])}",
            f"- Team weight: {weight}",
            f"- Summary: {item['summary']}",
        ]
        if item["key_references"]:
            catalog_lines.append("- Key related papers:")
            for reference in item["key_references"]:
                details = []
                if reference["year"]:
                    details.append(str(reference["year"]))
                if reference["doi"]:
                    details.append(f"DOI: {reference['doi']}")
                suffix = f" ({', '.join(details)})" if details else ""
                role = reference["role"] or "related_work"
                catalog_lines.append(
                    f"  - [{role}] {reference['title']}{suffix} - "
                    f"{reference['reason']}")
        catalog_lines += [f"- Record: {item['card_url']}", ""]
    (out_dir / "llm_catalog.md").write_text(
        "\n".join(catalog_lines), encoding="utf-8")

    literature_count = sum(item["entry_type"] == "literature" for item in index)
    lines = [
        "# Literature index",
        "",
        f"Auto-generated by `scripts/update_index.py` on {date.today()}; do not edit by hand.",
        f"Literature records: {literature_count}",
        "",
    ]
    for domain in DOMAINS:
        official = [
            item for item in index
            if item["entry_type"] == "literature"
            and item["primary_domain"] == domain
            and item["folder"] != PENDING_DIR
        ]
        if not official:
            continue
        lines += [f"## {domain}", ""]
        for item in official:
            year = f" ({item['year']})" if item["year"] else ""
            publication = item["publication_type"] or "unspecified"
            lines.append(f"- [{item['title']}]({item['path']}) - _{publication}_{year}")
        lines.append("")

    pending = [
        item for item in index
        if item["entry_type"] == "literature" and item["folder"] == PENDING_DIR
    ]
    if pending:
        lines += ["## Pending review", ""]
        for item in pending:
            lines.append(
                f"- [{item['title']}]({item['path']}) - "
                f"_{item['primary_domain']}_ `{item['status']}`")
        lines.append("")

    legacy = [item for item in index if item["entry_type"] == "legacy-note"]
    if legacy:
        lines += ["## Legacy notes", ""]
        for item in legacy:
            lines.append(
                f"- [{item['title']}]({item['path']}) - _{item['legacy_type']}_")
        lines.append("")

    (out_dir / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")
    print(
        f"Indexed {len(index)} records -> index/cards.json, index/INDEX.md, "
        "index/llm_catalog.md, index/llm_catalog.json")


if __name__ == "__main__":
    main()
