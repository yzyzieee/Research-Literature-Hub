"use client";

import { driveDownloadUrl, driveViewUrl } from "@/lib/export";
import { useLang } from "@/lib/i18n";

// Used inside a card <Link>; stop propagation so the click opens the PDF instead
// of navigating to the literature record. "view" opens it inline in the app
// (server-proxied, no download); "download" forces a download.
export default function DownloadButton({
  link,
  compact,
  variant = "download",
}: {
  link: string;
  compact?: boolean;
  variant?: "view" | "download";
}) {
  const { t } = useLang();
  const url = variant === "view" ? driveViewUrl(link) : driveDownloadUrl(link);
  const label = variant === "view" ? t("card.view") : t("card.download");
  const icon = variant === "view" ? "👁" : "⬇";
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener");
  };
  if (compact) {
    return (
      <button className="dl-chip" onClick={open} title={label} aria-label={label}>
        {icon} {variant === "view" ? t("card.view") : "PDF"}
      </button>
    );
  }
  return (
    <button className="btn" onClick={open}>
      {icon} {label}
    </button>
  );
}
