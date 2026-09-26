import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AREA_BANDS,
  SIDO_CODE,
  findRegion,
  formatCount,
  formatEok,
  pricePerPyeong,
  regionsOf,
  sidoFromCode,
  type AreaBand,
  type Sido,
} from "@core";
import { Breadcrumb, Footer, Gnb, Page } from "@/components/Layout";
import { Icon } from "@/components/Icon";
import { ChipLink } from "@/components/Tabs";
import { TradeRow } from "@/components/Trade";
import { repo } from "@/lib/repo";
import { cx, one, withParams } from "@/lib/ui";

const PAGE_SIZE = 20;

function resolve(code: string): { sido: Sido; name: string; sigunguCode?: string } | null {
  const sido = sidoFromCode(code);
  if (sido) return { sido, name: sido === "서울" ? "서울특별시" : "경기도" };
  const r = findRegion(code);
  return r ? { sido: r.sido, name: r.name, sigunguCode: r.code } : null;
}

export async function generateMetadata({ params }: PageProps<"/region/[code]">): Promise<Metadata> {
  const r = resolve((await params).code);
  return r ? { title: `${r.sido === "서울" && r.sigunguCode ? "서울 " : ""}${r.name} 아파트 실거래가` } : {};
}

export default async function RegionPage({ params, searchParams }: PageProps<"/region/[code]">) {
  const { code } = await params;
  const sp = await searchParams;
  const region = resolve(code);
  if (!region) notFound();

  const areaBand = (AREA_BANDS.some((b) => b.value === one(sp.area)) ? one(sp.area) : "all") as AreaBand;
  const page = Math.max(1, Number(one(sp.page)) || 1);
  const current = { area: areaBand === "all" ? undefined : areaBand };
  const path = `/region/${code}`;

  const [list, sample] = await Promise.all([
    repo.recentTrades({ sido: region.sido, sigunguCode: region.sigunguCode, areaBand, page, pageSize: PAGE_SIZE }),
    // 요약 통계용 (최근 3개월, 최대 1,000건)
    repo.recentTrades({ sido: region.sido, sigunguCode: region.sigunguCode, areaBand, page: 1, pageSize: 1000 }),
  ]);
  const n = sample.items.length;
  const avg = n ? sample.items.reduce((s, t) => s + t.price, 0) / n : 0;
  const ppy = n ? sample.items.reduce((s, t) => s + pricePerPyeong(t.price, t.area), 0) / n : 0;
  const pages = Math.max(1, Math.ceil(list.total / PAGE_SIZE));
  const first = Math.max(1, Math.min(page - 2, pages - 4));
  const pageNums = Array.from({ length: Math.min(5, pages) }, (_, i) => first + i);

  return (
    <Page>
      <Gnb />
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: region.sido, href: region.sigunguCode ? `/region/${SIDO_CODE[region.sido]}` : undefined },
          ...(region.sigunguCode ? [{ label: region.name }] : []),
        ]}
      />
      <div className="px-4 pt-2 pb-1">
        <h1 className="text-[22px] font-bold">{region.name} 아파트 실거래가</h1>
        <p className="mt-1.5 text-[13px] text-sub">최근 3개월 매매 {formatCount(list.total)}건</p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-2">
        {[
          ["평균 거래가", n ? formatEok(avg) : "-"],
          ["평당가", n ? `${formatCount(Math.round(ppy))}만` : "-"],
          ["거래량", `${formatCount(list.total)}건`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-soft p-3">
            <p className="text-xs text-sub">{k}</p>
            <p className="mt-1 text-[17px] font-bold">{v}</p>
          </div>
        ))}
      </div>

      {!region.sigunguCode && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 [scrollbar-width:none]">
          {regionsOf(region.sido).map((r) => (
            <ChipLink key={r.code} label={r.name} href={`/region/${r.code}`} />
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto border-b border-line px-4 py-3 [scrollbar-width:none]">
        {AREA_BANDS.map((b) => (
          <ChipLink key={b.value} label={b.label} active={b.value === areaBand} href={withParams(path, {}, { area: b.value === "all" ? undefined : b.value })} />
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pt-3.5 pb-0.5 text-[13px]">
        <span className="text-sub">총 {formatCount(list.total)}건</span>
        <span className="font-medium">최신순</span>
      </div>

      <div>
        {list.items.map((t) => (
          <TradeRow key={t.id} t={t} showRegion={!region.sigunguCode} />
        ))}
        {list.items.length === 0 && <p className="py-16 text-center text-sm text-ter">조건에 맞는 거래가 없어요</p>}
      </div>

      {pages > 1 && (
        <nav className="flex items-center justify-center gap-1.5 px-4 pt-5 pb-7" aria-label="페이지">
          <Link aria-label="이전" href={withParams(path, current, { page: String(Math.max(1, page - 1)) })} className="flex size-9 items-center justify-center text-ter">
            <Icon name="back" size={16} />
          </Link>
          {pageNums.map((p) => (
            <Link
              key={p}
              href={withParams(path, current, { page: p === 1 ? undefined : String(p) })}
              className={cx("flex size-9 items-center justify-center rounded-lg text-sm", p === page ? "bg-ink font-semibold text-white" : "font-medium text-sub")}
            >
              {p}
            </Link>
          ))}
          <Link aria-label="다음" href={withParams(path, current, { page: String(Math.min(pages, page + 1)) })} className="flex size-9 items-center justify-center text-ter">
            <Icon name="chev" size={16} />
          </Link>
        </nav>
      )}
      <Footer />
    </Page>
  );
}
