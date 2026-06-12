export type CardType = "concept" | "algorithm" | "paper" | "resource" | "synthesis";
export type CardStatus = "pending" | "reviewed" | "official";

export interface CardMeta {
  slug: string;
  folder: string;
  title: string;
  title_zh: string;
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
  summary_zh: string;
}

export interface Card extends CardMeta {
  body: string;
}

export const TYPE_LABELS: Record<CardType, string> = {
  concept: "概念 Concept",
  algorithm: "算法 Algorithm",
  paper: "论文 Paper",
  resource: "资源 Resource",
  synthesis: "综述 Synthesis",
};

export const TYPE_TO_DIR: Record<CardType, string> = {
  concept: "01_concepts",
  algorithm: "02_algorithms",
  paper: "03_papers",
  resource: "04_resources",
  synthesis: "05_synthesis",
};

export const STATUS_LABELS: Record<CardStatus, string> = {
  pending: "待审 pending",
  reviewed: "已审 reviewed",
  official: "正式 official",
};
