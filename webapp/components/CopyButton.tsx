"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label,
  primary,
}: {
  text: string;
  label: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`btn${primary ? " primary" : ""}`}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "✓ 已复制" : label}
    </button>
  );
}
