export type Sido = '서울' | '경기';

export const SIDO_LIST: Sido[] = ['서울', '경기'];
/** 시도 전체를 가리키는 가상 지역 코드 (서울 11, 경기 41) */
export const SIDO_CODE: Record<Sido, string> = { 서울: '11', 경기: '41' };

export interface Region {
  code: string; // 시군구 코드 (LAWD_CD 5자리)
  sido: Sido;
  name: string; // 예: '강남구', '성남시 분당구'
}

export interface Trade {
  id: string;
  complexId: string;
  sigunguCode: string;
  sido: Sido;
  sigungu: string;
  dong: string;
  aptName: string;
  area: number; // 전용면적 ㎡
  floor: number | null;
  price: number; // 거래금액 (만원)
  dealDate: string; // YYYY-MM-DD
  prevPrice: number | null; // 같은 단지·같은 면적의 직전 거래가
}

export interface Complex {
  id: string; // 국토부 단지일련번호(aptSeq)
  sigunguCode: string;
  sido: Sido;
  sigungu: string;
  dong: string;
  name: string;
  buildYear: number | null;
  households: number | null;
  lat: number | null;
  lng: number | null;
}

export interface ComplexSummary extends Complex {
  latest: Trade | null;
  tradeCount3m: number;
}

export interface RegionStat {
  sigunguCode: string;
  sido: Sido;
  sigungu: string;
  avgPrice: number; // 최근 3개월 84㎡ 전후 평균 (만원)
  prevAvgPrice: number | null; // 그 이전 3개월 평균
  tradeCount: number;
}

export interface SidoSummary {
  sido: Sido;
  tradeCount: number; // 최근 7일 계약
  avgPrice: number;
  prevAvgPrice: number | null;
}

export interface TradeQuery {
  sido?: Sido;
  sigunguCode?: string;
  /** 'all' | 'small'(~60㎡) | 'mid'(60~85㎡) | 'large'(85㎡~) */
  areaBand?: AreaBand;
  page?: number;
  pageSize?: number;
}

export type AreaBand = 'all' | 'small' | 'mid' | 'large';

export interface Paged<T> {
  items: T[];
  total: number;
}

export interface Repository {
  sidoSummary(sido: Sido): Promise<SidoSummary>;
  regionStats(sido: Sido): Promise<RegionStat[]>;
  recentTrades(q: TradeQuery): Promise<Paged<Trade>>;
  complex(id: string): Promise<Complex | null>;
  complexTrades(id: string): Promise<Trade[]>;
  complexSummaries(ids: string[]): Promise<ComplexSummary[]>;
  complexesInRegion(sigunguCode: string, limit?: number): Promise<ComplexSummary[]>;
  searchComplexes(q: string, limit?: number): Promise<ComplexSummary[]>;
  popularComplexes(limit?: number): Promise<ComplexSummary[]>;
}
