import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PERIODS,
  SIDO_CODE,
  areaKey,
  areasOf,
  delta,
  formatArea,
  formatCount,
  formatDate,
  formatPrice,
  monthlySeries,
  type Period,
} from "@core";
import { AppBanner, Breadcrumb, Divider, Footer, Gnb, Page, SectionHeader } from "@/components/Layout";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PriceChart } from "@/components/PriceChart";
import { PillTabs, UnderlineTabs } from "@/components/Tabs";
import { repo } from "@/lib/repo";
import { cx, dirText, one, withParams } from "@/lib/ui";

export async function generateMetadata({ params }: PageProps<"/apt/[id]">): Promise<Metadata> {
  const c = await repo.complex(decodeURIComponent((await params).id));
  return c ? { title: `${c.name} 실거래가 (${c.sigungu} ${c.dong})` } : {};
}

export default async function ComplexPage({ params, searchParams }: PageProps<"/apt/[id]">) {
  const id = decodeURIComponent((await params).id);
  const sp = await searchParams;
  const [c, trades] = await Promise.all([repo.complex(id), repo.complexTrades(id)]);
  if (!c) notFound();

  const areas = areasOf(trades);
  const defaultArea = areas.includes(84) ? 84 : (areas[0] ?? 0);
  const area = areas.includes(Number(one(sp.area))) ? Number(one(sp.area)) : defaultArea;
  const period = (PERIODS.some((p) => p.value === one(sp.period)) ? one(sp.period) : "1y") as Period;
  const showAll = one(sp.all) === "1";
  const current = { area: area === defaultArea ? undefined : String(area), period: period === "1y" ? undefined : period };
  const path = `/apt/${encodeURIComponent(id)}`;

  const areaTrades = trades.filter((t) => areaKey(t.area) === area);
  const latest = areaTrades[0];
  const d = latest ? delta(latest.price, latest.prevPrice) : null;
  const series = monthlySeries(areaTrades, period);
  const rising = series.length > 1 && series[series.length - 1].price >= series[0].price;
  const nearby = (await repo.complexesInRegion(c.sigunguCode, 8)).filter((n) => n.id !== c.id).slice(0, 4);

  return (
    <Page>
      <AppBanner />
      <Gnb />
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: c.sido, href: `/region/${SIDO_CODE[c.sido]}` },
          { label: c.sigungu, href: `/region/${c.sigunguCode}` },
          { label: c.name },
        ]}
      />
      <div className="flex items-start justify-between gap-3 px-4 pt-2 pb-1">
        <div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-semibold text-sub">
            <span className="rounded-md bg-soft px-2 py-1">
              {c.sigungu} {c.dong}
            </span>
            {c.households && <span className="rounded-md bg-soft px-2 py-1">{formatCount(c.households)}세대</span>}
            {c.buildYear && <span className="rounded-md bg-soft px-2 py-1">{c.buildYear}년 준공</span>}
          </div>
        </div>
        <FavoriteButton id={c.id} />
      </div>

      {areas.length > 0 ? (
        <>
          <div className="pt-4">
            <UnderlineTabs items={areas.map((a) => ({ label: `${a}㎡`, href: withParams(path, current, { area: a === defaultArea ? undefined : String(a) }), active: a === area }))} />
          </div>
          {latest && d && (
            <div className="px-4 pt-5">
              <p className="text-[13px] text-sub">
                {formatArea(latest.area)} 최근 실거래 · {formatDate(latest.dealDate)}
              </p>
              <p className="mt-1 text-[30px] font-bold">{formatPrice(latest.price)}</p>
              <p className={cx("text-sm font-medium", dirText[d.dir])}>
                {d.text}
                {d.pct && ` (${d.pct})`} <span className="text-ter">직전 거래 대비</span>
              </p>
            </div>
          )}
          <div className="px-4 pt-4">
            <PriceChart series={series} color={rising ? "var(--color-up)" : "var(--color-down)"} />
          </div>
          <PillTabs items={PERIODS.map((p) => ({ label: p.label, href: withParams(path, current, { period: p.value === "1y" ? undefined : p.value }), active: p.value === period }))} />
        </>
      ) : (
        <p className="py-16 text-center text-sm text-ter">아직 거래 기록이 없어요</p>
      )}

      <Divider />
      <SectionHeader title="실거래 내역" more={`${area}㎡ · ${areaTrades.length}건`} />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-ter">
            <th className="py-2.5 pl-4 font-normal">계약일</th>
            <th className="py-2.5 font-normal">면적</th>
            <th className="py-2.5 font-normal">층</th>
            <th className="py-2.5 pr-4 text-right font-normal">거래가</th>
          </tr>
        </thead>
        <tbody>
          {(showAll ? areaTrades : areaTrades.slice(0, 8)).map((t) => (
            <tr key={t.id} className="border-b border-line">
              <td className="py-3 pl-4">{formatDate(t.dealDate)}</td>
              <td className="py-3">{formatArea(t.area)}</td>
              <td className="py-3">{t.floor != null ? `${t.floor}층` : "-"}</td>
              <td className="py-3 pr-4 text-right font-semibold">{formatPrice(t.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && areaTrades.length > 8 && (
        <div className="px-4 pt-4 pb-6">
          <Link scroll={false} href={withParams(path, current, { all: "1" })} className="block rounded-[14px] border border-line py-4 text-center font-semibold">
            전체 거래 내역 보기
          </Link>
        </div>
      )}

      <Divider />
      <SectionHeader title="단지 정보" />
      <dl className="pb-2 text-sm">
        {[
          ["주소", `${c.sido} ${c.sigungu} ${c.dong}`],
          ["세대수", c.households ? `${formatCount(c.households)}세대` : "-"],
          ["준공", c.buildYear ? `${c.buildYear}년` : "-"],
          ["거래 면적", areas.map((a) => `${a}㎡`).join(", ") || "-"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-2.5">
            <dt className="text-sub">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {nearby.length > 0 && (
        <>
          <Divider />
          <SectionHeader title="주변 단지 시세" sub={c.sigungu} />
          <div className="grid grid-cols-2 gap-2.5 px-4 pt-1 pb-5">
            {nearby.map((n) => {
              const nd = n.latest ? delta(n.latest.price, n.latest.prevPrice) : null;
              return (
                <Link key={n.id} href={`/apt/${encodeURIComponent(n.id)}`} className="rounded-[14px] border border-line p-3.5 active:bg-soft">
                  <p className="font-semibold">{n.name}</p>
                  {n.latest && (
                    <p className="mt-1 text-[13px] text-sub">
                      {formatArea(n.latest.area)} · {formatPrice(n.latest.price)}
                    </p>
                  )}
                  {nd && <p className={cx("mt-1 text-[13px] font-semibold", dirText[nd.dir])}>{nd.text}</p>}
                </Link>
              );
            })}
          </div>
        </>
      )}
      <div id="app" className="px-4 pt-2 pb-8">
        <a href="#app" className="block rounded-[14px] bg-primary py-4 text-center font-semibold text-white">
          앱에서 시세 알림 받기
        </a>
      </div>
      <Footer />
    </Page>
  );
}
