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

// Research domains — keep in sync with scripts/kblib.py DOMAINS.
export const DOMAINS: string[] = [
  "active-noise-control",
  "acoustic-echo-cancellation",
  "speech-enhancement",
  "source-separation",
  "beamforming-arrays",
  "spatial-audio",
  "audio-coding",
  "room-acoustics",
  "machine-learning-audio",
  "fundamentals-dsp",
  "other",
];

export const DOMAIN_LABELS: Record<string, string> = {
  "active-noise-control": "Active noise control",
  "acoustic-echo-cancellation": "Acoustic echo cancellation",
  "speech-enhancement": "Speech enhancement",
  "source-separation": "Source separation",
  "beamforming-arrays": "Beamforming & arrays",
  "spatial-audio": "Spatial audio",
  "audio-coding": "Audio coding",
  "room-acoustics": "Room acoustics",
  "machine-learning-audio": "Machine learning for audio",
  "fundamentals-dsp": "Fundamentals & DSP",
  other: "Other",
};

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
