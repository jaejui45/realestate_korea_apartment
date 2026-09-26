import type { Direction } from "@core";

export const dirText: Record<Direction, string> = {
  up: "text-up",
  down: "text-down",
  flat: "text-ter",
  new: "text-ter",
};

export const dirTag: Record<Direction, string> = {
  up: "bg-up-soft text-up",
  down: "bg-down-soft text-down",
  flat: "bg-soft text-sub",
  new: "bg-soft text-sub",
};

export function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

/** 쿼리스트링을 유지하면서 일부 값만 바꾼 링크 */
export function withParams(path: string, current: Record<string, string | undefined>, next: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...next })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${path}?${s}` : path;
}

export function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
