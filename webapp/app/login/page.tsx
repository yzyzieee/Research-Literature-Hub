"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n";

function LoginForm() {
  const { t } = useLang();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const enter = async (account: string) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: account }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(response.status === 401 ? t("login.wrong") : data.error || t("login.wrong"));
      }
      const requested = params.get("from");
      window.location.assign(data.needs_setup ? "/settings" : requested || "/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      setBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await enter(username);
  };

  return (
    <div className="login-wrap">
      <form className="form-card login-card" onSubmit={submit}>
        <h1>Research Literature Hub</h1>
        <p className="subtitle">{t("login.subtitle")}</p>
        <label>{t("login.account")}</label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={t("login.placeholder")}
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          autoFocus
        />
        {error && <div className="notice warn">{error}</div>}
        <div className="btn-row">
          <button className="btn primary" type="submit" disabled={!username || busy}>
            {busy ? t("login.entering") : t("login.submit")}
          </button>
        </div>
        <div className="guest-login">
          <span>{t("login.guestOr")}</span>
          <button className="btn guest" type="button" onClick={() => enter("GUEST")} disabled={busy}>
            {t("login.guest")}
          </button>
          <small>{t("login.guestHint")}</small>
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
