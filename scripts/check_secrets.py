"""Fail when tracked files contain common credential formats or private file types."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_ENV_FILES = {".env.example"}
BLOCKED_SUFFIXES = {".pdf", ".pem", ".key", ".p12", ".pfx"}
BLOCKED_NAME_PARTS = {
    "client_secret",
    "credentials",
    "service-account",
    "service_account",
}
SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}\b"),
    "Google API key": re.compile(r"\bAIza[A-Za-z0-9_-]{30,}\b"),
    "OpenAI-style API key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "Google OAuth refresh token": re.compile(r"\b1//[A-Za-z0-9_-]{20,}\b"),
}


def tracked_files() -> list[Path]:
    output = subprocess.check_output(
        ["git", "ls-files", "-co", "--exclude-standard", "-z"],
        cwd=ROOT,
    )
    return [
        ROOT / item.decode("utf-8")
        for item in output.split(b"\0")
        if item
    ]


def main() -> int:
    errors: list[str] = []
    for path in tracked_files():
        relative = path.relative_to(ROOT).as_posix()
        lower_name = path.name.lower()
        if path.suffix.lower() in BLOCKED_SUFFIXES:
            errors.append(f"{relative}: blocked file type")
            continue
        if lower_name.startswith(".env") and lower_name not in ALLOWED_ENV_FILES:
            errors.append(f"{relative}: environment file must not be tracked")
            continue
        if path.suffix.lower() == ".json" and any(
            part in lower_name for part in BLOCKED_NAME_PARTS
        ):
            errors.append(f"{relative}: credential JSON must not be tracked")
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if relative == "scripts/check_secrets.py":
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"{relative}: possible {label}")

    for error in errors:
        print(f"ERROR {error}")
    if errors:
        print(f"\nSecret scan failed with {len(errors)} issue(s).")
        return 1
    print("Secret scan passed: no blocked tracked files or common credential formats found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
