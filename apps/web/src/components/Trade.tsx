import Link from "next/link";
import { delta, formatArea, formatPrice, formatShortDate, type ComplexSummary, type Trade } from "@core";
import { cx, dirText } from "@/lib/ui";

export function TradeRow({ t, showRegion = true }: { t: Trade; showRegion?: boolean }) {
  const d = delta(t.price, t.prevPrice);
  const meta = [showRegion ? `${t.sigungu} ${t.dong}` : t.dong, formatArea(t.area), t.floor != null ? `${t.floor}층` : null, formatShortDate(t.dealDate)]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={`/apt/${encodeURIComponent(t.complexId)}`} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 active:bg-soft">
      <div className="min-w-0">
        <p className="truncate font-semibold">{t.aptName}</p>
        <p className="mt-1 truncate text-[13px] text-sub">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold">{formatPrice(t.price)}</p>
        <p className={cx("mt-1 text-[13px] font-medium", dirText[d.dir])}>{d.text}</p>
      </div>
    </Link>
  );
}

export function ComplexRow({ c, rank }: { c: ComplexSummary; rank?: number }) {
  const d = c.latest ? delta(c.latest.price, c.latest.prevPrice) : null;
  return (
    <Link href={`/apt/${encodeURIComponent(c.id)}`} className="flex items-center gap-3.5 px-4 py-3 active:bg-soft">
      {rank != null && <span className="w-4 text-[17px] font-bold text-primary">{rank}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{c.name}</p>
        <p className="mt-0.5 truncate text-[13px] text-sub">
          {c.sido} {c.sigungu} {c.dong}
        </p>
      </div>
      {c.latest && d && (
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-bold">{formatPrice(c.latest.price)}</p>
          <p className={cx("text-xs font-medium", dirText[d.dir])}>
            {formatArea(c.latest.area)} · {d.text}
          </p>
        </div>
      )}
    </Link>
  );
}
