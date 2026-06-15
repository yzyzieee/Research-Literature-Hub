import {
  KEY_FIGURE_ROLES,
  KEY_FIGURE_STATUSES,
  type KeyFigure,
  type KeyFigureRole,
  type KeyFigureStatus,
} from "./types";

export const EMPTY_KEY_FIGURE: KeyFigure = {
  status: "none",
  figure_id: null,
  page: null,
  role: null,
  caption: null,
  reason: null,
  image_ref: null,
  image_private: true,
};

function nullableText(value: unknown, limit = 1200): string | null {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, limit) : null;
}

export function parseKeyFigure(value: unknown): KeyFigure {
  if (!value || typeof value !== "object") return { ...EMPTY_KEY_FIGURE };
  const input = value as Record<string, unknown>;
  const status = KEY_FIGURE_STATUSES.includes(input.status as KeyFigureStatus)
    ? (input.status as KeyFigureStatus)
    : "none";
  const pageNumber = Number(input.page);
  const role = KEY_FIGURE_ROLES.includes(input.role as KeyFigureRole)
    ? (input.role as KeyFigureRole)
    : null;
  const imageRef = nullableText(input.image_ref, 300);
  const parsed: KeyFigure = {
    status,
    figure_id: nullableText(input.figure_id, 120),
    page: Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : null,
    role,
    caption: nullableText(input.caption),
    reason: nullableText(input.reason, 600),
    image_ref: imageRef,
    image_private: input.image_private !== false,
  };

  if (parsed.status === "cached" && !parsed.image_ref) parsed.status = "missing";
  if (parsed.status === "none") return { ...EMPTY_KEY_FIGURE };
  if (parsed.status === "suggested") {
    parsed.image_ref = null;
    parsed.image_private = true;
  }
  return parsed;
}

export function aiKeyFigure(value: unknown): KeyFigure {
  const parsed = parseKeyFigure(value);
  if (
    parsed.status !== "suggested" ||
    !parsed.page ||
    !parsed.role ||
    !parsed.reason
  ) {
    return { ...EMPTY_KEY_FIGURE };
  }
  return {
    ...parsed,
    status: "suggested",
    image_ref: null,
    image_private: true,
  };
}
