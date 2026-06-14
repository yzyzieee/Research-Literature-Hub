"use client";

import { useEffect, useState } from "react";
import { DOMAIN_LABELS, DOMAINS } from "@/lib/types";
import type { TeamMember } from "@/lib/types";
import { useLang } from "@/lib/i18n";

function DomainPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (domains: string[]) => void;
}) {
  const toggle = (domain: string) => {
    onChange(selected.includes(domain) ? selected.filter((item) => item !== domain) : [...selected, domain]);
  };
  return (
    <div className="domain-picker">
      {DOMAINS.map((domain) => (
        <label key={domain}>
          <input type="checkbox" checked={selected.includes(domain)} onChange={() => toggle(domain)} />
          <span>{DOMAIN_LABELS[domain]}</span>
        </label>
      ))}
    </div>
  );
}

export default function AccountSettings() {
  const { t } = useLang();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDomains, setNewDomains] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "save" | "add">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/team")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMember(data.member);
        setDomains(data.member.domains || []);
        setMembers(data.members || []);
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));
  }, []);

  const save = async () => {
    setBusy("save");
    setMessage(null);
    try {
      const response = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMember(data.member);
      setMessage({ ok: true, text: t("settings.saved") });
    } catch (error) {
      setMessage({ ok: false, text: `${t("settings.failed")}: ${error instanceof Error ? error.message : error}` });
    } finally {
      setBusy("");
    }
  };

  const add = async () => {
    setBusy("add");
    setMessage(null);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newId, name: newName, domains: newDomains }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMembers(data.members || []);
      setNewId("");
      setNewName("");
      setNewDomains([]);
      setMessage({ ok: true, text: t("settings.memberAdded") });
    } catch (error) {
      setMessage({ ok: false, text: `${t("settings.failed")}: ${error instanceof Error ? error.message : error}` });
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>{member?.name || t("settings.loading")}</h2>
        <p className="subtitle">{t("settings.domainsHint")}</p>
        <DomainPicker selected={domains} onChange={setDomains} />
        <div className="btn-row">
          <button className="btn primary" onClick={save} disabled={!member || !domains.length || busy !== ""}>
            {busy === "save" ? t("settings.saving") : t("settings.save")}
          </button>
        </div>
      </div>

      {member?.role === "admin" && (
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("settings.addMember")}</h2>
          <p className="subtitle">{t("settings.addHint")}</p>
          <label>{t("settings.accountId")}</label>
          <input value={newId} onChange={(event) => setNewId(event.target.value.toUpperCase())} placeholder="ABC" />
          <label>{t("settings.displayName")}</label>
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Alice" />
          <label>{t("settings.initialDomains")}</label>
          <DomainPicker selected={newDomains} onChange={setNewDomains} />
          <div className="btn-row">
            <button className="btn primary" onClick={add} disabled={newId.length < 2 || busy !== ""}>
              {busy === "add" ? t("settings.adding") : t("settings.add")}
            </button>
          </div>
          {members.length > 0 && (
            <div className="member-list">
              {members.map((item) => (
                <span className="badge" key={item.id}>{item.name} · {item.role}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </>
  );
}
