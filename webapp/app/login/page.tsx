"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n";

function LoginForm() {
  const { t } = useLang();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setErr(true);
        setBusy(false);
        return;
      }
      // Full-page navigation forces a fresh middleware check with the new cookie.
      const from = params.get("from") || "/";
      window.location.assign(from);
    } catch {
      setErr(true);
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="form-card login-card" onSubmit={submit}>
        <h1>🎧 Audio Research KB</h1>
        <p className="subtitle">{t("login.subtitle")}</p>
        <label>{t("login.password")}</label>
        <input
          type="password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="notice warn">{t("login.wrong")}</div>}
        <div className="btn-row">
          <button className="btn primary" type="submit" disabled={!password || busy}>
            {busy ? "…" : t("login.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
