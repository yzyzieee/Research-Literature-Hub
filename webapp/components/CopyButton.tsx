"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";

export default function CopyButton({
  text,
  label,
  labelKey,
  primary,
}: {
  text: string;
  label?: string;
  labelKey?: string;
  primary?: boolean;
}) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const resolved = labelKey ? t(labelKey) : (label ?? "");
  return (
    <button
      className={`btn${primary ? " primary" : ""}`}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? t("copy.copied") : resolved}
    </button>
  );
}
