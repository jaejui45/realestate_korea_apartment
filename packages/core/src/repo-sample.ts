import { inAreaBand } from './format';
import { SAMPLE_COMPLEXES, SAMPLE_TRADES } from './sample';
import type { Complex, ComplexSummary, Repository, Sido, Trade, TradeQuery } from './types';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((s, x) => s + x, 0) / xs.length) : 0);

function summarize(c: Complex): ComplexSummary {
  const trades = SAMPLE_TRADES.filter((t) => t.complexId === c.id);
  const from = daysAgo(90);
  return { ...c, latest: trades[0] ?? null, tradeCount3m: trades.filter((t) => t.dealDate >= from).length };
}

export function createSampleRepository(): Repository {
  return {
    async sidoSummary(sido: Sido) {
      const trades = SAMPLE_TRADES.filter((t) => t.sido === sido);
      const week = trades.filter((t) => t.dealDate >= daysAgo(7));
      const prev = trades.filter((t) => t.dealDate < daysAgo(7) && t.dealDate >= daysAgo(14));
      return { sido, tradeCount: week.length, avgPrice: avg(week.map((t) => t.price)), prevAvgPrice: prev.length ? avg(prev.map((t) => t.price)) : null };
    },
    async regionStats(sido: Sido) {
      const groups = new Map<string, Trade[]>();
      for (const t of SAMPLE_TRADES) {
        if (t.sido !== sido || t.area < 80 || t.area > 90 || t.dealDate < daysAgo(180)) continue;
        groups.set(t.sigunguCode, [...(groups.get(t.sigunguCode) ?? []), t]);
      }
      return [...groups.values()]
        .map((ts) => {
          const recent = ts.filter((t) => t.dealDate >= daysAgo(90));
          const before = ts.filter((t) => t.dealDate < daysAgo(90));
          return {
            sigunguCode: ts[0].sigunguCode,
            sido,
            sigungu: ts[0].sigungu,
            avgPrice: avg(recent.map((t) => t.price)),
            prevAvgPrice: before.length ? avg(before.map((t) => t.price)) : null,
            tradeCount: recent.length,
          };
        })
        .filter((r) => r.tradeCount > 0)
        .sort((a, b) => b.avgPrice - a.avgPrice);
    },
    async recentTrades({ sido, sigunguCode, areaBand = 'all', page = 1, pageSize = 20 }: TradeQuery) {
      const from = daysAgo(90);
      const list = SAMPLE_TRADES.filter(
        (t) =>
          t.dealDate >= from &&
          (!sido || t.sido === sido) &&
          (!sigunguCode || t.sigunguCode === sigunguCode) &&
          inAreaBand(t.area, areaBand),
      );
      return { items: list.slice((page - 1) * pageSize, page * pageSize), total: list.length };
    },
    async complex(id: string) {
      return SAMPLE_COMPLEXES.find((c) => c.id === id) ?? null;
    },
    async complexTrades(id: string) {
      return SAMPLE_TRADES.filter((t) => t.complexId === id);
    },
    async complexSummaries(ids: string[]) {
      return SAMPLE_COMPLEXES.filter((c) => ids.includes(c.id)).map(summarize);
    },
    async complexesInRegion(sigunguCode: string, limit = 50) {
      return SAMPLE_COMPLEXES.filter((c) => c.sigunguCode === sigunguCode).slice(0, limit).map(summarize);
    },
    async searchComplexes(q: string, limit = 20) {
      const k = q.trim().replace(/\s+/g, '');
      if (!k) return [];
      return SAMPLE_COMPLEXES.filter((c) => `${c.name}${c.sigungu}${c.dong}`.replace(/\s+/g, '').includes(k))
        .slice(0, limit)
        .map(summarize);
    },
    async popularComplexes(limit = 10) {
      return SAMPLE_COMPLEXES.map(summarize)
        .sort((a, b) => b.tradeCount3m - a.tradeCount3m || (b.households ?? 0) - (a.households ?? 0))
        .slice(0, limit);
    },
  };
}
