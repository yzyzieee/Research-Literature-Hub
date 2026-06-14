"use client";

import { driveDownloadUrl } from "@/lib/export";
import { useLang } from "@/lib/i18n";

// Used inside a card <Link>; stop propagation so the click downloads instead
// of navigating to the literature record.
export default function DownloadButton({ link, compact }: { link: string; compact?: boolean }) {
  const { t } = useLang();
  const open = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(driveDownloadUrl(link), "_blank", "noopener");
  };
  if (compact) {
    return (
      <button className="dl-chip" onClick={open} title={t("card.download")} aria-label={t("card.download")}>
        ⬇ PDF
      </button>
    );
  }
  return (
    <button className="btn" onClick={open}>
      ⬇ {t("card.download")}
    </button>
  );
}
