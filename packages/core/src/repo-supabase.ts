/**
 * Supabase(PostgREST) 구현. supabase/schema.sql 의 테이블·뷰를 사용합니다.
 * core 패키지가 의존성을 갖지 않도록 클라이언트는 앱에서 만들어 넘깁니다.
 */
import type { Complex, ComplexSummary, Repository, Sido, Trade, TradeQuery } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Query = any;
export interface SupabaseLike {
  from(table: string): Query;
}

type Row = Record<string, unknown>;

const toTrade = (r: Row): Trade => ({
  id: String(r.id),
  complexId: r.complex_id as string,
  sigunguCode: r.sigungu_code as string,
  sido: r.sido as Sido,
  sigungu: r.sigungu as string,
  dong: r.dong as string,
  aptName: r.apt_name as string,
  area: Number(r.area),
  floor: (r.floor as number | null) ?? null,
  price: Number(r.price),
  dealDate: r.deal_date as string,
  prevPrice: r.prev_price == null ? null : Number(r.prev_price),
});

const toComplex = (r: Row): Complex => ({
  id: r.id as string,
  sigunguCode: r.sigungu_code as string,
  sido: r.sido as Sido,
  sigungu: r.sigungu as string,
  dong: r.dong as string,
  name: r.name as string,
  buildYear: (r.build_year as number | null) ?? null,
  households: (r.households as number | null) ?? null,
  lat: (r.lat as number | null) ?? null,
  lng: (r.lng as number | null) ?? null,
});

/** complex_latest 뷰 한 줄 → ComplexSummary */
const toSummary = (r: Row): ComplexSummary => ({
  ...toComplex({ ...r, id: r.complex_id, name: r.apt_name }),
  latest: toTrade(r),
  tradeCount3m: Number(r.trade_count_3m ?? 0),
});

const AREA_RANGE = { small: [0, 60], mid: [60, 85], large: [85, 10000] } as const;

async function run<T>(q: Promise<{ data: T | null; error: { message: string } | null; count?: number | null }>) {
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { data: data as T, count: count ?? 0 };
}

export function createSupabaseRepository(db: SupabaseLike): Repository {
  return {
    async sidoSummary(sido) {
      const { data } = await run<Row[]>(db.from('sido_weekly').select('*').eq('sido', sido));
      const r = data[0];
      return {
        sido,
        tradeCount: Number(r?.trade_count ?? 0),
        avgPrice: Number(r?.avg_price ?? 0),
        prevAvgPrice: r?.prev_avg_price == null ? null : Number(r.prev_avg_price),
      };
    },
    async regionStats(sido) {
      const { data } = await run<Row[]>(db.from('region_stats').select('*').eq('sido', sido).gt('trade_count', 0).order('avg_price', { ascending: false }));
      return data.map((r) => ({
        sigunguCode: r.sigungu_code as string,
        sido: r.sido as Sido,
        sigungu: r.sigungu as string,
        avgPrice: Number(r.avg_price),
        prevAvgPrice: r.prev_avg_price == null ? null : Number(r.prev_avg_price),
        tradeCount: Number(r.trade_count),
      }));
    },
    async recentTrades({ sido, sigunguCode, areaBand = 'all', page = 1, pageSize = 20 }: TradeQuery) {
      const from = new Date();
      from.setDate(from.getDate() - 90);
      let q = db
        .from('trades_with_prev')
        .select('*', { count: 'exact' })
        .gte('deal_date', from.toISOString().slice(0, 10))
        .order('deal_date', { ascending: false })
        .order('id', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (sido) q = q.eq('sido', sido);
      if (sigunguCode) q = q.eq('sigungu_code', sigunguCode);
      if (areaBand !== 'all') q = q.gte('area', AREA_RANGE[areaBand][0]).lt('area', AREA_RANGE[areaBand][1]);
      const { data, count } = await run<Row[]>(q);
      return { items: data.map(toTrade), total: count };
    },
    async complex(id) {
      const { data } = await run<Row[]>(db.from('complexes').select('*').eq('id', id).limit(1));
      return data[0] ? toComplex(data[0]) : null;
    },
    async complexTrades(id) {
      const { data } = await run<Row[]>(
        db.from('trades_with_prev').select('*').eq('complex_id', id).order('deal_date', { ascending: false }).limit(1000),
      );
      return data.map(toTrade);
    },
    async complexSummaries(ids) {
      if (!ids.length) return [];
      const { data } = await run<Row[]>(db.from('complex_latest').select('*').in('complex_id', ids));
      return data.map(toSummary);
    },
    async complexesInRegion(sigunguCode, limit = 50) {
      const { data } = await run<Row[]>(
        db.from('complex_latest').select('*').eq('sigungu_code', sigunguCode).order('trade_count_3m', { ascending: false }).limit(limit),
      );
      return data.map(toSummary);
    },
    async searchComplexes(q, limit = 20) {
      const k = q.trim();
      if (!k) return [];
      const like = `%${k.replace(/[%_,()]/g, '')}%`;
      const { data } = await run<Row[]>(
        db.from('complex_latest').select('*').or(`apt_name.ilike.${like},dong.ilike.${like},sigungu.ilike.${like}`).limit(limit),
      );
      return data.map(toSummary);
    },
    async popularComplexes(limit = 10) {
      const { data } = await run<Row[]>(db.from('complex_latest').select('*').order('trade_count_3m', { ascending: false }).limit(limit));
      return data.map(toSummary);
    },
  };
}
