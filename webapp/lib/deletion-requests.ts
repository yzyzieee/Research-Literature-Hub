export type DeletionRequestStatus = "pending" | "approved" | "rejected";

export interface CardDeletionRequest {
  id: string;
  slug: string;
  title: string;
  requested_by: string;
  reason: string;
  requested_at: string;
  status: DeletionRequestStatus;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface CardDeletionRegistry {
  version: number;
  requests: CardDeletionRequest[];
}

export const CARD_DELETION_REQUESTS_FILE = "team/card-deletion-requests.json";

export const EMPTY_CARD_DELETION_REGISTRY: CardDeletionRegistry = {
  version: 1,
  requests: [],
};

export function normalizeDeletionRegistry(value: unknown): CardDeletionRegistry {
  const source = value && typeof value === "object"
    ? value as Partial<CardDeletionRegistry>
    : {};
  const requests = Array.isArray(source.requests) ? source.requests : [];
  return {
    version: 1,
    requests: requests.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const request = item as Partial<CardDeletionRequest>;
      const id = String(request.id || "").trim();
      const slug = String(request.slug || "").trim();
      const requestedBy = String(request.requested_by || "").trim();
      const reason = String(request.reason || "").trim().slice(0, 500);
      if (!id || !slug || !requestedBy || !reason) return [];
      const status: DeletionRequestStatus =
        request.status === "approved" || request.status === "rejected"
          ? request.status
          : "pending";
      return [{
        id,
        slug,
        title: String(request.title || slug).trim().slice(0, 300),
        requested_by: requestedBy,
        reason,
        requested_at: String(request.requested_at || ""),
        status,
        ...(request.reviewed_by ? { reviewed_by: String(request.reviewed_by) } : {}),
        ...(request.reviewed_at ? { reviewed_at: String(request.reviewed_at) } : {}),
      }];
    }),
  };
}
