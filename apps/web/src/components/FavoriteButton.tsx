"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { cx } from "@/lib/ui";

const KEY = "pilseung:favorites";
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // 저장 공간을 쓸 수 없는 환경(시크릿 모드 등)에서는 무시
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
}

const snapshot = () => (typeof window === "undefined" ? "[]" : (localStorage.getItem(KEY) ?? "[]"));

/** 브라우저에 저장된 관심 단지 목록 (로그인 기능을 붙이면 Supabase favorites 테이블로 옮기면 됨) */
export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let ids: string[] = [];
  try {
    ids = JSON.parse(raw);
  } catch {}
  const toggle = (id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
  };
  return { ids, toggle };
}

export function FavoriteButton({ id, variant = "icon" }: { id: string; variant?: "icon" | "box" }) {
  const { ids, toggle } = useFavorites();
  const on = ids.includes(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      aria-label={on ? "관심 단지 해제" : "관심 단지 추가"}
      className={cx(variant === "box" && "rounded-[14px] border border-line p-3.5", on ? "text-up" : "text-ink")}
    >
      <Icon name="heart" filled={on} />
    </button>
  );
}
