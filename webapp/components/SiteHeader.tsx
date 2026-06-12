"use client";

import Link from "next/link";
import { LangToggle, useLang } from "@/lib/i18n";

export default function SiteHeader({ repo }: { repo?: string }) {
  const { t } = useLang();
  return (
    <header className="topnav">
      <Link href="/" className="brand">🎧 Audio Research KB</Link>
      <nav>
        <Link href="/cards">{t("nav.library")}</Link>
        <Link href="/pending">{t("nav.review")}</Link>
        <Link href="/new">{t("nav.new")}</Link>
        <Link href="/export">{t("nav.export")}</Link>
        {repo && (
          <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        )}
        <LangToggle />
      </nav>
    </header>
  );
}
