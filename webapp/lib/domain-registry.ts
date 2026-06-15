import registryJson from "@/data/domains.json";

export interface ApprovedDomain {
  id: string;
  label: string;
  description: string;
  created: string;
  created_by: string;
}

export type DomainProposalStatus = "pending" | "approved" | "rejected";

export interface DomainProposal {
  id: string;
  label: string;
  description: string;
  reason: string;
  proposed_by: string;
  proposed_at: string;
  status: DomainProposalStatus;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface DomainRegistry {
  version: number;
  approved: ApprovedDomain[];
  proposals: DomainProposal[];
}

export const DOMAIN_REGISTRY_FILE = "webapp/data/domains.json";
export const DEFAULT_DOMAIN_REGISTRY = registryJson as DomainRegistry;

export function normalizeDomainId(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function normalizedDomainRegistry(value: unknown): DomainRegistry {
  const source = value && typeof value === "object" ? value as Partial<DomainRegistry> : {};
  const approved = Array.isArray(source.approved) ? source.approved : [];
  const proposals = Array.isArray(source.proposals) ? source.proposals : [];
  return {
    version: 1,
    approved: approved.flatMap((item) => {
      const id = normalizeDomainId(item?.id);
      const label = String(item?.label || "").trim().slice(0, 80);
      if (!id || !label) return [];
      return [{
        id,
        label,
        description: String(item?.description || "").trim().slice(0, 500),
        created: String(item?.created || ""),
        created_by: String(item?.created_by || "unknown"),
      }];
    }),
    proposals: proposals.flatMap((item) => {
      const id = normalizeDomainId(item?.id);
      const label = String(item?.label || "").trim().slice(0, 80);
      if (!id || !label) return [];
      const status: DomainProposalStatus =
        item?.status === "approved" || item?.status === "rejected" ? item.status : "pending";
      return [{
        id,
        label,
        description: String(item?.description || "").trim().slice(0, 500),
        reason: String(item?.reason || "").trim().slice(0, 1000),
        proposed_by: String(item?.proposed_by || "unknown"),
        proposed_at: String(item?.proposed_at || ""),
        status,
        ...(item?.reviewed_by ? { reviewed_by: String(item.reviewed_by) } : {}),
        ...(item?.reviewed_at ? { reviewed_at: String(item.reviewed_at) } : {}),
      }];
    }),
  };
}
