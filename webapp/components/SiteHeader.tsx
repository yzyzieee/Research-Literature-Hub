"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LangToggle, useLang } from "@/lib/i18n";

export default function SiteHeader({ repo }: { repo?: string }) {
  const { t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/login";
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (onLogin) return;
    const profileUpdated = (event: Event) => {
      setUsername((event as CustomEvent<string>).detail || "");
    };
    fetch("/api/me")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUsername(data?.member?.name || ""))
      .catch(() => {});
    window.addEventListener("team-profile-updated", profileUpdated);
    return () => window.removeEventListener("team-profile-updated", profileUpdated);
  }, [onLogin]);

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="topnav">
      <Link href="/" className="brand">Research Literature Hub</Link>
      <nav>
        {!onLogin && (
          <>
            <Link href="/cards">{t("nav.library")}</Link>
            <Link href="/review">{t("nav.review")}</Link>
            <Link href="/new">{t("nav.new")}</Link>
            <Link href="/export">{t("nav.export")}</Link>
            <Link href="/settings">{t("nav.settings")}</Link>
            {repo && (
              <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
            {username && <span className="user-chip">{username}</span>}
            <button className="lang-toggle" onClick={logout}>
              {t("login.logout")}
            </button>
          </>
        )}
        <LangToggle />
      </nav>
    </header>
  );
}
