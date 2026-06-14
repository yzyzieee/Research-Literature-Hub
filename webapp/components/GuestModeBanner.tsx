"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

export default function GuestModeBanner() {
  const { t } = useLang();
  const pathname = usePathname();
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setGuest(Boolean(data?.demo)))
      .catch(() => {});
  }, [pathname]);

  if (!guest || pathname === "/login") return null;
  return (
    <div className="guest-banner" role="status">
      <b>{t("guest.title")}</b>
      <span>{t("guest.banner")}</span>
    </div>
  );
}
