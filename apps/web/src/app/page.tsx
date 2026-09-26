import Link from "next/link";
import { SIDO_CODE, formatEok, pctChange, type Sido } from "@core";
import { AppBanner, Divider, Footer, Gnb, Page, SectionHeader } from "@/components/Layout";
import { Icon } from "@/components/Icon";
import { ChipLink, UnderlineTabs } from "@/components/Tabs";
import { TradeRow } from "@/components/Trade";
import { repo } from "@/lib/repo";
import { cx, dirText, one } from "@/lib/ui";

const QUICK = ["강남구", "분당", "광교", "송파구", "수지"];

export default async function Home({ searchParams }: PageProps<"/">) {
  const sido: Sido = one((await searchParams).sido) === "경기" ? "경기" : "서울";
  const [stats, recent] = await Promise.all([repo.regionStats(sido), repo.recentTrades({ sido, pageSize: 5 })]);
  const updated = recent.items[0]?.dealDate.replaceAll("-", ".");

  return (
    <Page>
      <AppBanner />
      <Gnb />
      <section className="space-y-2.5 px-4 pt-7 pb-6">
        <h1 className="text-[26px] leading-[1.35] font-bold">
          서울·경기 아파트
          <br />
          실거래가를 한눈에
        </h1>
        <p className="text-sm text-sub">국토교통부 실거래가 공개 데이터 · 매일 오전 업데이트</p>
        <form action="/search" className="!mt-4 flex items-center gap-2.5 rounded-xl border-[1.5px] border-primary px-4 py-3.5">
          <Icon name="search" size={20} className="text-primary" />
          <input name="q" placeholder="단지명 또는 지역을 입력하세요" className="w-full text-[15px] outline-none placeholder:text-ter" />
        </form>
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK.map((q) => (
            <ChipLink key={q} label={`#${q}`} href={`/search?q=${encodeURIComponent(q)}`} soft />
          ))}
        </div>
      </section>

      <UnderlineTabs
        items={(["서울", "경기"] as Sido[]).map((s) => ({ label: s, href: s === "서울" ? "/" : "/?sido=경기", active: s === sido }))}
      />

      <SectionHeader title="지역별 평균 시세" sub="84㎡ 전후 · 최근 3개월 · 직전 3개월 대비" more="전체" moreHref={`/region/${SIDO_CODE[sido]}`} />
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-1 pb-6">
        {stats.slice(0, 8).map((r) => {
          const d = pctChange(r.avgPrice, r.prevAvgPrice);
          return (
            <Link key={r.sigunguCode} href={`/region/${r.sigunguCode}`} className="rounded-[14px] border border-line p-3.5 active:bg-soft">
              <p className="truncate text-sm font-medium text-sub">{r.sigungu}</p>
              <p className="mt-1 text-xl font-bold">{formatEok(r.avgPrice)}</p>
              <p className={cx("mt-1 text-[13px] font-semibold", dirText[d.dir])}>{d.text}</p>
            </Link>
          );
        })}
        {stats.length === 0 && <p className="col-span-2 py-6 text-center text-sm text-ter">아직 집계된 거래가 없어요</p>}
      </div>

      <Divider />
      <SectionHeader title="최근 실거래" sub={updated ? `${sido} · ${updated} 계약분까지` : sido} more="전체보기" moreHref={`/region/${SIDO_CODE[sido]}`} />
      <div className="border-t border-line">
        {recent.items.map((t) => (
          <TradeRow key={t.id} t={t} />
        ))}
      </div>
      <div className="px-4 pt-4 pb-8">
        <Link href={`/region/${SIDO_CODE[sido]}`} className="block rounded-[14px] border border-line py-4 text-center font-semibold">
          실거래 더보기
        </Link>
      </div>
      <Footer />
    </Page>
  );
}
