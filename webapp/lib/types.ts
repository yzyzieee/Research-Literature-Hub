export type CardType = "concept" | "algorithm" | "paper" | "resource" | "synthesis";
export type CardStatus = "pending" | "reviewed" | "official";
export type SourceType = "paper" | "conference" | "book" | "patent" | "other";
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

export interface CardMeta {
  slug: string;
  folder: string;
  title: string;
  type: CardType;
  domain: string;
  source_type: string;
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
  uploaded_by: string;
  uploaded_at: string;
  pdf_uploaded_by: string;
  pdf_uploaded_at: string;
  pdf_file_name: string;
  pdf_reused: boolean;
  activity: ActivityEntry[];
}

export interface Card extends CardMeta {
  body: string;
}

export const TYPE_LABELS: Record<CardType, string> = {
  concept: "Concept",
  algorithm: "Algorithm",
  paper: "Paper",
  resource: "Resource",
  synthesis: "Synthesis",
};

export const STATUS_LABELS: Record<CardStatus, string> = {
  pending: "pending",
  reviewed: "reviewed",
  official: "official",
};

export const SOURCE_TYPES: SourceType[] = ["paper", "conference", "book", "patent", "other"];

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
