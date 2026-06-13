export type CardType = "concept" | "algorithm" | "paper" | "resource" | "synthesis";
export type CardStatus = "pending" | "reviewed" | "official";
export type SourceType = "paper" | "conference" | "book" | "patent" | "other";

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
