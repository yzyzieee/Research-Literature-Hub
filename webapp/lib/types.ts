import { DEFAULT_DOMAIN_REGISTRY } from "./domain-registry";

export type EntryType = "literature" | "legacy-note";
export type CardStatus = "pending" | "reviewed" | "official";
export type PublicationType =
  | "journal-paper"
  | "conference-paper"
  | "preprint"
  | "review-paper"
  | "book"
  | "book-chapter"
  | "patent"
  | "thesis"
  | "technical-report"
  | "dataset-paper"
  | "other";
export type TeamRole = "admin" | "member";
export const KEY_REFERENCE_ROLES = [
  "foundation",
  "method",
  "baseline",
  "dataset",
  "survey",
  "related_work",
] as const;
export type KeyReferenceRole = (typeof KEY_REFERENCE_ROLES)[number];
export type KeyReferenceStatus = "in_library" | "external";
export const KEY_FIGURE_STATUSES = ["none", "suggested", "cached", "missing"] as const;
export type KeyFigureStatus = (typeof KEY_FIGURE_STATUSES)[number];
export const KEY_FIGURE_ROLES = [
  "method_overview",
  "model_architecture",
  "system_setup",
  "main_result",
  "ablation_result",
  "dataset_overview",
] as const;
export type KeyFigureRole = (typeof KEY_FIGURE_ROLES)[number];

export interface KeyReference {
  title: string;
  doi: string;
  year: number | null;
  role: KeyReferenceRole | "";
  reason: string;
  status: KeyReferenceStatus;
  linked_card: string | null;
}

export interface KeyFigure {
  status: KeyFigureStatus;
  figure_id: string | null;
  page: number | null;
  role: KeyFigureRole | null;
  caption: string | null;
  reason: string | null;
  image_ref: string | null;
  image_private: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  domains: string[];
  active: boolean;
  created: string;
}

export interface TeamConfig {
  version: number;
  members: TeamMember[];
}

export interface RatingEntry {
  reviewer: string;
  recommendation: number;
  innovation: number;
  rigor: number;
  updated: string;
}

export interface RatingAggregate {
  recommendation: number;
  innovation: number;
  rigor: number;
  weight: number;
  count: number;
}

export interface ActivityEntry {
  action: string;
  by: string;
  at: string;
  detail?: string;
}

export interface CommentEntry {
  id: string;
  author: string;
  body: string;
  created: string;
  updated: string;
}

export interface CardMeta {
  slug: string;
  folder: string;
  title: string;
  entry_type: EntryType;
  publication_type: PublicationType | "";
  primary_domain: string;
  domains: string[];
  venue: string;
  doi: string;
  abstract: string;
  status: CardStatus;
  tags: string[];
  authors: string[];
  year: number | null;
  citation_key: string;
  key_references: KeyReference[];
  key_figure: KeyFigure;
  related: string[];
  drive: string[];
  created: string;
  summary: string;
  rating: RatingAggregate | null;
  ratings: RatingEntry[];
  comments: CommentEntry[];
  uploaded_by: string;
  uploaded_at: string;
  pdf_uploaded_by: string;
  pdf_uploaded_at: string;
  pdf_file_name: string;
  pdf_reused: boolean;
  activity: ActivityEntry[];
  legacy_type: string;
}

export interface Card extends CardMeta {
  body: string;
}

export type ExportCardMeta = Pick<
  CardMeta,
  | "slug"
  | "folder"
  | "title"
  | "publication_type"
  | "primary_domain"
  | "domains"
  | "venue"
  | "year"
  | "citation_key"
  | "key_references"
  | "tags"
  | "drive"
  | "summary"
  | "rating"
> & {
  comment_count: number;
};

export const STATUS_LABELS: Record<CardStatus, string> = {
  pending: "pending",
  reviewed: "reviewed",
  official: "official",
};

export const PUBLICATION_TYPES: PublicationType[] = [
  "journal-paper",
  "conference-paper",
  "preprint",
  "review-paper",
  "book",
  "book-chapter",
  "patent",
  "thesis",
  "technical-report",
  "dataset-paper",
  "other",
];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  "journal-paper": "Journal paper",
  "conference-paper": "Conference paper",
  preprint: "Preprint",
  "review-paper": "Review paper",
  book: "Book",
  "book-chapter": "Book chapter",
  patent: "Patent",
  thesis: "Thesis",
  "technical-report": "Technical report",
  "dataset-paper": "Dataset paper",
  other: "Other",
};

export function publicationTypeLabel(value: string): string {
  return PUBLICATION_TYPE_LABELS[value as PublicationType] || value || "Unspecified";
}

// Controlled taxonomy. Changes enter through the administrator-reviewed registry.
export const DOMAINS: string[] = DEFAULT_DOMAIN_REGISTRY.approved.map((domain) => domain.id);

export const DOMAIN_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_DOMAIN_REGISTRY.approved.map((domain) => [domain.id, domain.label]),
);

export function domainLabel(d: string): string {
  return DOMAIN_LABELS[d] || d || "Unsorted";
}

export function cardMatchesDomain(
  card: Pick<CardMeta, "primary_domain" | "domains">,
  domain: string,
): boolean {
  return card.primary_domain === domain || card.domains.includes(domain);
}

export function isLiterature(card: Pick<CardMeta, "entry_type">): boolean {
  return card.entry_type === "literature";
}
