import type { Metadata } from "next";
import { regionsOf, type Sido } from "@core";
import { Divider, Footer, Gnb, Page, SectionHeader } from "@/components/Layout";
import { Icon } from "@/components/Icon";
import { ChipLink, UnderlineTabs } from "@/components/Tabs";
import { ComplexRow } from "@/components/Trade";
import { repo } from "@/lib/repo";
import { one } from "@/lib/ui";

export const metadata: Metadata = { title: "단지 검색" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim();
  const sido: Sido = one(sp.sido) === "경기" ? "경기" : "서울";
  const [results, popular] = await Promise.all([q ? repo.searchComplexes(q, 30) : Promise.resolve([]), repo.popularComplexes(5)]);

  return (
    <Page>
      <Gnb />
      <form action="/search" className="px-4 pt-4">
        <label className="flex items-center gap-2 rounded-xl bg-soft px-3.5 py-3">
          <Icon name="search" size={18} className="text-ter" />
          <input name="q" defaultValue={q} autoFocus placeholder="단지명, 지역 검색" className="w-full bg-transparent text-[15px] outline-none placeholder:text-ter" />
        </label>
      </form>

      {q ? (
        <>
          <SectionHeader title={`'${q}' 검색 결과`} sub={`${results.length}개 단지`} />
          {results.map((c) => (
            <ComplexRow key={c.id} c={c} />
          ))}
          {results.length === 0 && <p className="py-12 text-center text-sm text-ter">검색 결과가 없어요. 단지명이나 동 이름으로 검색해 보세요.</p>}
          <Divider />
        </>
      ) : null}

      <SectionHeader title="지역으로 찾기" />
      <UnderlineTabs
        items={(["서울", "경기"] as Sido[]).map((s) => ({
          label: s === "서울" ? "서울 25개 구" : "경기 시·군·구",
          href: `/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(s === "경기" ? { sido: s } : {}) })}`,
          active: s === sido,
        }))}
      />
      <div className="flex flex-wrap gap-2 px-4 pt-4 pb-6">
        {regionsOf(sido).map((r) => (
          <ChipLink key={r.code} label={r.name} href={`/region/${r.code}`} />
        ))}
      </div>

      <Divider />
      <SectionHeader title="지금 많이 찾는 단지" sub="최근 3개월 거래 많은 순" />
      <div className="pb-6">
        {popular.map((c, i) => (
          <ComplexRow key={c.id} c={c} rank={i + 1} />
        ))}
      </div>
      <Footer />
    </Page>
  );
}
