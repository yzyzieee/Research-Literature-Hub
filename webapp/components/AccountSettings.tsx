"use client";

import { useEffect, useState } from "react";
import { domainLabel, DOMAIN_LABELS, DOMAINS } from "@/lib/types";
import type { TeamMember } from "@/lib/types";
import type { DomainProposal } from "@/lib/domain-registry";
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
  const [displayName, setDisplayName] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [proposalId, setProposalId] = useState("");
  const [proposalLabel, setProposalLabel] = useState("");
  const [proposalReason, setProposalReason] = useState("");
  const [proposals, setProposals] = useState<DomainProposal[]>([]);
  const [guest, setGuest] = useState(false);
  const [busy, setBusy] = useState<"" | "save" | "add" | "propose" | "review">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/team")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMember(data.member);
        setDisplayName(data.member.name || "");
        setDomains(data.member.domains || []);
        setMembers(data.members || []);
        setGuest(Boolean(data.demo));
      })
      .catch((error) => setMessage({ ok: false, text: String(error) }));
    fetch("/api/domains")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setProposals(data.proposals || []);
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
        body: JSON.stringify({ name: displayName, domains }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMember(data.member);
      window.dispatchEvent(new CustomEvent("team-profile-updated", { detail: data.member.name }));
      setMembers((current) =>
        current.map((item) => (item.id === data.member.id ? data.member : item)),
      );
      setMessage({ ok: true, text: t(data.demo ? "settings.demoSaved" : "settings.saved") });
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
        body: JSON.stringify({ id: newId, name: newName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMembers((data.members || []).filter((item: TeamMember) => item.active));
      setNewId("");
      setNewName("");
      setMessage({ ok: true, text: t("settings.memberAdded") });
    } catch (error) {
      setMessage({ ok: false, text: `${t("settings.failed")}: ${error instanceof Error ? error.message : error}` });
    } finally {
      setBusy("");
    }
  };

  const proposeDomain = async () => {
    setBusy("propose");
    setMessage(null);
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposalId,
          label: proposalLabel,
          description: proposalReason,
          reason: proposalReason,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProposals((current) => [...current, data.proposal]);
      setProposalId("");
      setProposalLabel("");
      setProposalReason("");
      setMessage({
        ok: true,
        text: t(data.demo ? "settings.domainProposalDemo" : "settings.domainProposalSent"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("settings.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  const reviewDomain = async (id: string, action: "approve" | "reject") => {
    setBusy("review");
    setMessage(null);
    try {
      const response = await fetch("/api/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setProposals((current) =>
        current.map((proposal) => proposal.id === id ? data.proposal : proposal),
      );
      setMessage({
        ok: true,
        text: t(action === "approve"
          ? "settings.domainApproved"
          : "settings.domainRejected"),
      });
    } catch (error) {
      setMessage({
        ok: false,
        text: `${t("settings.failed")}: ${error instanceof Error ? error.message : error}`,
      });
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      {guest && <div className="notice guest">{t("settings.demoHint")}</div>}
      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>{member?.name || t("settings.loading")}</h2>
        <p className="subtitle">{t("settings.profileHint")}</p>
        <label>{t("settings.displayName")}</label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={60}
          placeholder={member?.id || ""}
        />
        <p className="subtitle">{t("settings.domainsHint")}</p>
        <DomainPicker selected={domains} onChange={setDomains} />
        <div className="btn-row">
          <button
            className="btn primary"
            onClick={save}
            disabled={!member || !displayName.trim() || !domains.length || busy !== ""}
          >
            {busy === "save" ? t("settings.saving") : t("settings.save")}
          </button>
        </div>
      </div>

      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>{t("settings.teamDirectory")}</h2>
        <p className="subtitle">{t("settings.teamDirectoryHint")}</p>
        <div className="team-directory">
          {members.map((item) => (
            <div className="team-member" key={item.id}>
              <div>
                <b>{item.name}</b>
                <span className="subtitle">
                  {item.id}{item.role === "admin" ? ` · ${t("settings.admin")}` : ""}
                </span>
              </div>
              <div className="meta-row">
                {item.domains.length ? (
                  item.domains.map((domain) => (
                    <span className="badge domain" key={domain}>{domainLabel(domain)}</span>
                  ))
                ) : (
                  <span className="badge">{t("settings.domainsPending")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-card">
        <h2 style={{ marginTop: 0 }}>{t("settings.proposeDomain")}</h2>
        <p className="subtitle">{t("settings.proposeDomainHint")}</p>
        <label>{t("settings.domainId")}</label>
        <input
          value={proposalId}
          onChange={(event) => setProposalId(event.target.value.toLowerCase())}
          placeholder="music-information-retrieval"
        />
        <label>{t("settings.domainLabel")}</label>
        <input
          value={proposalLabel}
          onChange={(event) => setProposalLabel(event.target.value)}
          placeholder="Music information retrieval"
        />
        <label>{t("settings.domainReason")}</label>
        <textarea
          rows={4}
          value={proposalReason}
          onChange={(event) => setProposalReason(event.target.value)}
          placeholder={t("settings.domainReasonPlaceholder")}
        />
        <div className="btn-row">
          <button
            className="btn"
            onClick={proposeDomain}
            disabled={
              proposalId.length < 3 ||
              proposalLabel.length < 3 ||
              proposalReason.length < 10 ||
              busy !== ""
            }
          >
            {busy === "propose" ? t("settings.domainSubmitting") : t("settings.domainSubmit")}
          </button>
        </div>
      </div>

      {member?.role === "admin" && (
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("settings.domainReview")}</h2>
          <p className="subtitle">{t("settings.domainReviewHint")}</p>
          <div className="domain-proposal-list">
            {proposals.filter((proposal) => proposal.status === "pending").map((proposal) => (
              <article className="domain-proposal" key={proposal.id}>
                <div>
                  <b>{proposal.label}</b> <code>{proposal.id}</code>
                  <p>{proposal.reason}</p>
                  <span className="subtitle">
                    {proposal.proposed_by} · {proposal.proposed_at.slice(0, 10)}
                  </span>
                </div>
                <div className="btn-row">
                  <button
                    className="btn primary"
                    onClick={() => reviewDomain(proposal.id, "approve")}
                    disabled={busy !== ""}
                  >
                    {t("settings.domainApprove")}
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => reviewDomain(proposal.id, "reject")}
                    disabled={busy !== ""}
                  >
                    {t("settings.domainReject")}
                  </button>
                </div>
              </article>
            ))}
            {!proposals.some((proposal) => proposal.status === "pending") && (
              <p className="subtitle">{t("settings.domainReviewEmpty")}</p>
            )}
          </div>
        </div>
      )}

      {member?.role === "admin" && (
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("settings.addMember")}</h2>
          <p className="subtitle">{t("settings.addHint")}</p>
          <label>{t("settings.accountId")}</label>
          <input value={newId} onChange={(event) => setNewId(event.target.value.toUpperCase())} placeholder="ABC" />
          <label>{t("settings.displayName")}</label>
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Alice" />
          <div className="btn-row">
            <button className="btn primary" onClick={add} disabled={newId.length < 2 || busy !== ""}>
              {busy === "add" ? t("settings.adding") : t("settings.add")}
            </button>
          </div>
        </div>
      )}

      {message && <div className={`notice ${message.ok ? "ok" : "warn"}`}>{message.text}</div>}
    </>
  );
}
