export type CardType = "concept" | "algorithm" | "paper" | "resource" | "synthesis";
export type CardStatus = "pending" | "reviewed" | "official";

export interface CardMeta {
  slug: string;
  folder: string;
  title: string;
  type: CardType;
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

export const TYPE_TO_DIR: Record<CardType, string> = {
  concept: "01_concepts",
  algorithm: "02_algorithms",
  paper: "03_papers",
  resource: "04_resources",
  synthesis: "05_synthesis",
};

export const STATUS_LABELS: Record<CardStatus, string> = {
  pending: "pending",
  reviewed: "reviewed",
  official: "official",
};
