"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

export default function CopyButton({
  text,
  label,
  labelKey,
  primary,
  compact,
}: {
  text: string;
  label?: string;
  labelKey?: string;
  primary?: boolean;
  compact?: boolean;
}) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const resolved = labelKey ? t(labelKey) : (label ?? "");
  const copy = async (event: React.MouseEvent) => {
    // Compact chips live inside a card <Link>; don't navigate on copy.
    if (compact) {
      event.preventDefault();
      event.stopPropagation();
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (compact) {
    return (
      <button className="dl-chip" onClick={copy} title={resolved} aria-label={resolved}>
        {copied ? "✓ BibTeX" : "📑 BibTeX"}
      </button>
    );
  }
  return (
    <button className={`btn${primary ? " primary" : ""}`} onClick={copy}>
      {copied ? t("copy.copied") : resolved}
    </button>
  );
}
