"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LangToggle, useLang } from "@/lib/i18n";

export default function SiteHeader({ repo, gated }: { repo?: string; gated?: boolean }) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/login";

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="topnav">
      <Link href="/" className="brand">🎧 Audio Research KB</Link>
      <nav>
        {!onLogin && (
          <>
            <Link href="/cards">{t("nav.library")}</Link>
            <Link href="/review">{t("nav.review")}</Link>
            <Link href="/new">{t("nav.new")}</Link>
            <Link href="/export">{t("nav.export")}</Link>
            {repo && (
              <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
            {gated && (
              <button className="lang-toggle" onClick={logout}>
                {t("login.logout")}
              </button>
            )}
          </>
        )}
        <LangToggle />
      </nav>
    </header>
  );
}
