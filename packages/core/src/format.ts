import type { AreaBand, Trade } from './types';

const comma = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 만원 단위 금액 → '23억 5,000' / '42억' / '9,800' */
export function formatPrice(manwon: number): string {
  const v = Math.round(Math.abs(manwon));
  const eok = Math.floor(v / 10000);
  const rest = v % 10000;
  if (eok === 0) return comma(rest);
  if (rest === 0) return `${eok}억`;
  return `${eok}억 ${comma(rest)}`;
}

/** 만원 → '23.5억' (카드·지도 마커용 짧은 표기) */
export function formatEok(manwon: number): string {
  if (manwon < 10000) return `${comma(manwon)}만`;
  const v = Math.round(manwon / 1000) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)}억`;
}

export function formatCount(n: number): string {
  return comma(n);
}

export type Direction = 'up' | 'down' | 'flat' | 'new';

export interface Delta {
  dir: Direction;
  text: string; // '▲ 5,000'
  pct: string; // '2.2%'
}

export function delta(price: number, prev: number | null): Delta {
  if (prev == null || prev === 0) return { dir: 'new', text: '신규 거래', pct: '' };
  const diff = price - prev;
  if (diff === 0) return { dir: 'flat', text: '보합', pct: '0.0%' };
  const pct = `${Math.abs((diff / prev) * 100).toFixed(1)}%`;
  return { dir: diff > 0 ? 'up' : 'down', text: `${diff > 0 ? '▲' : '▼'} ${formatPrice(diff)}`, pct };
}

export function pctChange(now: number, prev: number | null): Delta {
  if (prev == null || prev === 0) return { dir: 'new', text: '-', pct: '' };
  const p = ((now - prev) / prev) * 100;
  const dir: Direction = Math.abs(p) < 0.05 ? 'flat' : p > 0 ? 'up' : 'down';
  const sign = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '';
  return { dir, text: `${sign} ${Math.abs(p).toFixed(1)}%`.trim(), pct: `${Math.abs(p).toFixed(1)}%` };
}

/** 전용면적을 흔히 부르는 정수 ㎡로 (84.97 → 84) */
export function areaKey(area: number): number {
  return Math.floor(area);
}

/** 전용면적 → '84㎡' */
export function formatArea(area: number): string {
  return `${areaKey(area)}㎡`;
}

/** 'YYYY-MM-DD' → '2026.09.12' */
export function formatDate(d: string): string {
  return d.replaceAll('-', '.');
}

/** 'YYYY-MM-DD' → '09.12' */
export function formatShortDate(d: string): string {
  return d.slice(5).replace('-', '.');
}

/** 평당가 (만원/3.3㎡) */
export function pricePerPyeong(price: number, area: number): number {
  return price / (area / 3.3058);
}

export function inAreaBand(area: number, band: AreaBand = 'all'): boolean {
  if (band === 'small') return area < 60;
  if (band === 'mid') return area >= 60 && area < 85;
  if (band === 'large') return area >= 85;
  return true;
}

export const AREA_BANDS: { value: AreaBand; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'small', label: '~60㎡' },
  { value: 'mid', label: '60~85㎡' },
  { value: 'large', label: '85㎡~' },
];

export type Period = '1m' | '3m' | '1y' | '3y' | 'all';

export const PERIODS: { value: Period; label: string; months: number }[] = [
  { value: '1m', label: '1개월', months: 1 },
  { value: '3m', label: '3개월', months: 3 },
  { value: '1y', label: '1년', months: 12 },
  { value: '3y', label: '3년', months: 36 },
  { value: 'all', label: '전체', months: 1200 },
];

/** 차트용: 기간 내 거래를 월별 평균가로 묶기 */
export function monthlySeries(trades: Trade[], period: Period): { month: string; price: number }[] {
  const months = PERIODS.find((p) => p.value === period)?.months ?? 12;
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  const fromStr = from.toISOString().slice(0, 10);
  const byMonth = new Map<string, number[]>();
  for (const t of trades) {
    if (t.dealDate < fromStr) continue;
    const key = months <= 3 ? t.dealDate : t.dealDate.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), t.price]);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, ps]) => ({ month, price: ps.reduce((s, p) => s + p, 0) / ps.length }));
}

/** 단지의 대표 면적 목록 (거래가 있는 면적을 ㎡ 정수로) */
export function areasOf(trades: Trade[]): number[] {
  return [...new Set(trades.map((t) => areaKey(t.area)))].sort((a, b) => a - b);
}
