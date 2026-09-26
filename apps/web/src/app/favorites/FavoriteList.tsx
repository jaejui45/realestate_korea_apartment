"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { delta, formatArea, formatPrice, type ComplexSummary } from "@core";
import { FavoriteButton, useFavorites } from "@/components/FavoriteButton";
import { cx, dirText } from "@/lib/ui";

export function FavoriteList() {
  const { ids } = useFavorites();
  const key = ids.join(",");
  const [data, setData] = useState<{ key: string; items: ComplexSummary[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    fetch(`/api/complexes?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((items: ComplexSummary[]) => alive && setData({ key, items }));
    return () => {
      alive = false;
    };
  }, [key]);

  if (!key) return <p className="py-20 text-center text-sm text-ter">단지 상세에서 ♡ 를 누르면 여기에 모여요</p>;
  if (data?.key !== key) return <p className="py-20 text-center text-sm text-ter">불러오는 중…</p>;

  const order = new Map(ids.map((id, i) => [id, i]));
  const items = [...data.items].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return (
    <ul>
      {items.map((c) => {
        const d = c.latest ? delta(c.latest.price, c.latest.prevPrice) : null;
        return (
          <li key={c.id} className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <Link href={`/apt/${encodeURIComponent(c.id)}`} className="min-w-0 flex-1">
              <p className="truncate font-semibold">{c.name}</p>
              <p className="mt-0.5 text-[13px] text-sub">
                {c.sigungu} {c.dong}
                {c.latest && ` · ${formatArea(c.latest.area)}`}
              </p>
            </Link>
            {c.latest && d && (
              <div className="text-right">
                <p className="font-bold">{formatPrice(c.latest.price)}</p>
                <p className={cx("text-[13px] font-medium", dirText[d.dir])}>{d.text}</p>
              </div>
            )}
            <FavoriteButton id={c.id} />
          </li>
        );
      })}
    </ul>
  );
}
