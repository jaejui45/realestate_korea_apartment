import Link from "next/link";
import { cx } from "@/lib/ui";

/** 밑줄 탭 (링크) */
export function UnderlineTabs({ items }: { items: { label: string; href: string; active: boolean }[] }) {
  return (
    <div className="flex border-b border-line px-4">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          scroll={false}
          className={cx(
            "flex-1 py-3 text-center text-base",
            it.active ? "border-b-2 border-ink font-bold" : "font-medium text-ter",
          )}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}

/** 알약 모양 칩 (링크) */
export function ChipLink({ label, href, active, soft }: { label: string; href: string; active?: boolean; soft?: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cx(
        "rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap",
        active ? "bg-ink font-semibold text-white" : soft ? "bg-soft font-medium text-sub" : "border border-line font-medium text-sub",
      )}
    >
      {label}
    </Link>
  );
}

/** 기간 선택 (1개월 … 전체) */
export function PillTabs({ items }: { items: { label: string; href: string; active: boolean }[] }) {
  return (
    <div className="flex gap-1.5 px-4 pt-3.5 pb-2">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          scroll={false}
          className={cx("flex-1 rounded-lg py-2 text-center text-sm", it.active ? "bg-soft font-bold" : "font-medium text-ter")}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
