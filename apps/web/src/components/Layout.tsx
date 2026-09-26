import Link from "next/link";
import { usingSample } from "@/lib/repo";
import { Icon } from "./Icon";

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)]">{children}</div>;
}

export function AppBanner() {
  return (
    <div className="flex items-center justify-between bg-primary-soft px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white">필승</div>
        <div>
          <p className="text-[13px] font-semibold">부동산 필승 앱</p>
          <p className="text-xs text-sub">관심 단지 시세 알림을 받아보세요</p>
        </div>
      </div>
      <a href="#app" className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
        앱 열기
      </a>
    </div>
  );
}

export function Gnb() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3">
      <Link href="/" className="text-xl font-bold text-primary">
        부동산 필승
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/search" aria-label="검색">
          <Icon name="search" />
        </Link>
        <details className="relative">
          <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden" aria-label="메뉴">
            <Icon name="menu" />
          </summary>
          <div className="absolute right-0 mt-3 w-40 overflow-hidden rounded-xl border border-line bg-white py-1 text-sm shadow-lg">
            <Link className="block px-4 py-2.5 hover:bg-soft" href="/region/11">서울 실거래가</Link>
            <Link className="block px-4 py-2.5 hover:bg-soft" href="/region/41">경기 실거래가</Link>
            <Link className="block px-4 py-2.5 hover:bg-soft" href="/favorites">관심 단지</Link>
            <Link className="block px-4 py-2.5 hover:bg-soft" href="/search">단지 검색</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 px-4 pt-3.5 pb-1.5 text-[13px]">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {it.href ? (
            <Link href={it.href} className="text-ter">
              {it.label}
            </Link>
          ) : (
            <span className="font-semibold">{it.label}</span>
          )}
          {i < items.length - 1 && <Icon name="chev" size={12} className="text-ter2" />}
        </span>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto space-y-2.5 bg-soft px-4 pt-7 pb-10">
      <p className="font-bold text-sub">부동산 필승</p>
      <p className="space-x-3 text-[13px] font-medium text-sub">
        <span>서비스 소개</span>
        <span>이용약관</span>
        <span>개인정보처리방침</span>
        <span>문의</span>
      </p>
      <p className="text-xs leading-relaxed text-ter">
        실거래가 정보는 국토교통부 실거래가 공개시스템 자료를 기반으로 하며, 신고 시점과 계약 해제 여부에 따라 실제와 차이가 있을 수 있습니다.
      </p>
      {usingSample && (
        <p className="text-xs font-semibold text-primary">현재 샘플 데이터로 표시 중입니다. 가격과 단지 정보는 실제와 다릅니다.</p>
      )}
      <p className="text-xs text-ter">© 2026 부동산 필승</p>
    </footer>
  );
}

export function Divider() {
  return <div className="h-2 bg-soft" />;
}

export function SectionHeader({ title, sub, more, moreHref }: { title: string; sub?: string; more?: string; moreHref?: string }) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-2.5">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-ter">{sub}</p>}
      </div>
      {more &&
        (moreHref ? (
          <Link href={moreHref} className="text-sm font-medium text-ter">
            {more}
          </Link>
        ) : (
          <span className="text-sm font-medium text-ter">{more}</span>
        ))}
    </div>
  );
}
