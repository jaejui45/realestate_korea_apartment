/**
 * Supabase가 연결되지 않았을 때 쓰는 샘플 데이터.
 * 실제 단지명을 쓰지만 가격·세대수·좌표는 화면 확인용 예시 값이며 실제 거래와 다릅니다.
 */
import { formatPrice } from './format';
import type { Complex, Sido, Trade } from './types';

interface Seed {
  id: string;
  sigunguCode: string;
  sido: Sido;
  sigungu: string;
  dong: string;
  name: string;
  buildYear: number;
  households: number;
  lat: number;
  lng: number;
  /** 면적(㎡) → 현재 시세(만원) */
  areas: [number, number][];
  maxFloor: number;
}

const SEEDS: Seed[] = [
  { id: '11710-S01', sigunguCode: '11710', sido: '서울', sigungu: '송파구', dong: '가락동', name: '헬리오시티', buildYear: 2018, households: 9510, lat: 37.4972, lng: 127.1072, areas: [[59.9, 190000], [84.9, 235000], [110.2, 285000]], maxFloor: 35 },
  { id: '11710-S02', sigunguCode: '11710', sido: '서울', sigungu: '송파구', dong: '신천동', name: '파크리오', buildYear: 2008, households: 6864, lat: 37.5195, lng: 127.103, areas: [[59.8, 175000], [84.8, 218000]], maxFloor: 35 },
  { id: '11710-S03', sigunguCode: '11710', sido: '서울', sigungu: '송파구', dong: '잠실동', name: '잠실엘스', buildYear: 2008, households: 5678, lat: 37.5117, lng: 127.0797, areas: [[59.9, 210000], [84.8, 260000]], maxFloor: 34 },
  { id: '11710-S04', sigunguCode: '11710', sido: '서울', sigungu: '송파구', dong: '문정동', name: '올림픽훼밀리타운', buildYear: 1988, households: 4494, lat: 37.4906, lng: 127.1181, areas: [[84.6, 192000], [136.1, 265000]], maxFloor: 15 },
  { id: '11710-S05', sigunguCode: '11710', sido: '서울', sigungu: '송파구', dong: '가락동', name: '가락쌍용1차', buildYear: 1997, households: 2064, lat: 37.4964, lng: 127.1197, areas: [[59.9, 112000], [84.9, 135000]], maxFloor: 25 },
  { id: '11680-S01', sigunguCode: '11680', sido: '서울', sigungu: '강남구', dong: '대치동', name: '래미안 대치팰리스', buildYear: 2015, households: 1608, lat: 37.4957, lng: 127.0626, areas: [[59.9, 235000], [84.9, 285000], [114.1, 350000]], maxFloor: 35 },
  { id: '11680-S02', sigunguCode: '11680', sido: '서울', sigungu: '강남구', dong: '대치동', name: '은마', buildYear: 1979, households: 4424, lat: 37.499, lng: 127.0654, areas: [[76.8, 243000], [84.4, 268000]], maxFloor: 14 },
  { id: '11650-S01', sigunguCode: '11650', sido: '서울', sigungu: '서초구', dong: '반포동', name: '래미안 원베일리', buildYear: 2023, households: 2990, lat: 37.5075, lng: 127.002, areas: [[59.9, 330000], [84.9, 420000]], maxFloor: 35 },
  { id: '11440-S01', sigunguCode: '11440', sido: '서울', sigungu: '마포구', dong: '아현동', name: '마포래미안푸르지오', buildYear: 2014, households: 3885, lat: 37.5541, lng: 126.9577, areas: [[59.9, 168000], [84.9, 205000]], maxFloor: 30 },
  { id: '11200-S01', sigunguCode: '11200', sido: '서울', sigungu: '성동구', dong: '옥수동', name: '래미안 옥수 리버젠', buildYear: 2012, households: 1511, lat: 37.5436, lng: 127.0144, areas: [[59.9, 150000], [84.9, 185000]], maxFloor: 25 },
  { id: '11170-S01', sigunguCode: '11170', sido: '서울', sigungu: '용산구', dong: '이촌동', name: '한가람', buildYear: 1998, households: 2036, lat: 37.5237, lng: 126.9612, areas: [[59.8, 180000], [84.7, 225000]], maxFloor: 25 },
  { id: '41117-S01', sigunguCode: '41117', sido: '경기', sigungu: '수원시 영통구', dong: '이의동', name: '광교 자연앤힐스테이트', buildYear: 2012, households: 1764, lat: 37.2921, lng: 127.0461, areas: [[84.9, 132000], [101.9, 159000], [130.6, 195000]], maxFloor: 49 },
  { id: '41117-S02', sigunguCode: '41117', sido: '경기', sigungu: '수원시 영통구', dong: '하동', name: '광교 중흥S클래스', buildYear: 2019, households: 2231, lat: 37.2856, lng: 127.0527, areas: [[84.9, 158000], [109.9, 198000]], maxFloor: 49 },
  { id: '41117-S03', sigunguCode: '41117', sido: '경기', sigungu: '수원시 영통구', dong: '이의동', name: 'e편한세상 광교', buildYear: 2016, households: 1970, lat: 37.2998, lng: 127.0469, areas: [[84.9, 121000], [99.8, 139000]], maxFloor: 29 },
  { id: '41135-S01', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '정자동', name: '파크뷰', buildYear: 2004, households: 1829, lat: 37.3629, lng: 127.1101, areas: [[84.9, 198000], [131.2, 265000]], maxFloor: 37 },
  { id: '41135-S02', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '서현동', name: '시범단지 우성', buildYear: 1991, households: 1874, lat: 37.3857, lng: 127.1283, areas: [[84.5, 155000], [128.1, 205000]], maxFloor: 20 },
  { id: '41135-S03', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '삼평동', name: '봇들마을 7단지', buildYear: 2009, households: 585, lat: 37.4003, lng: 127.108, areas: [[84.9, 182000], [101.9, 215000]], maxFloor: 20 },
  { id: '41135-S04', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '정자동', name: '정든마을 한진6차', buildYear: 1995, households: 1100, lat: 37.3668, lng: 127.1164, areas: [[59.9, 114000], [84.9, 142000]], maxFloor: 15 },
  { id: '41135-S05', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '정자동', name: '느티마을 3단지', buildYear: 1994, households: 770, lat: 37.3701, lng: 127.1152, areas: [[67.4, 130000], [84.9, 150000]], maxFloor: 15 },
  { id: '41135-S06', sigunguCode: '41135', sido: '경기', sigungu: '성남시 분당구', dong: '백현동', name: '판교 푸르지오 그랑블', buildYear: 2011, households: 948, lat: 37.3924, lng: 127.1098, areas: [[97.9, 235000], [117.5, 275000]], maxFloor: 25 },
  { id: '41465-S01', sigunguCode: '41465', sido: '경기', sigungu: '용인시 수지구', dong: '성복동', name: '성복역 롯데캐슬 골드타운', buildYear: 2019, households: 2356, lat: 37.314, lng: 127.08, areas: [[84.9, 125000], [101.9, 148000]], maxFloor: 35 },
  { id: '41287-S01', sigunguCode: '41287', sido: '경기', sigungu: '고양시 일산서구', dong: '대화동', name: '킨텍스 원시티', buildYear: 2019, households: 2038, lat: 37.666, lng: 126.752, areas: [[84.9, 95000], [101.9, 112000]], maxFloor: 49 },
];

/** 재현 가능한 난수 (단지별로 항상 같은 샘플이 나오도록) */
function rng(seedText: string) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

function buildTrades(today: Date): Trade[] {
  const out: Trade[] = [];
  for (const s of SEEDS) {
    for (const [area, current] of s.areas) {
      const rand = rng(`${s.id}:${area}`);
      const list: Omit<Trade, 'prevPrice'>[] = [];
      // 최근 36개월 동안 월 0~2건, 가격은 36개월 전보다 약 18% 오른 흐름
      for (let m = 36; m >= 0; m--) {
        const n = m === 0 ? 1 + Math.floor(rand() * 2) : Math.floor(rand() * 3);
        for (let k = 0; k < n; k++) {
          const d = new Date(today);
          d.setMonth(d.getMonth() - m);
          d.setDate(m === 0 ? Math.max(1, today.getDate() - Math.floor(rand() * 10)) : 1 + Math.floor(rand() * 27));
          if (d > today) d.setTime(today.getTime());
          const trend = 1 - 0.18 * (m / 36);
          const noise = 1 + (rand() - 0.5) * 0.06;
          const price = Math.round((current * trend * noise) / 500) * 500;
          list.push({
            id: `${s.id}-${Math.round(area)}-${m}-${k}`,
            complexId: s.id,
            sigunguCode: s.sigunguCode,
            sido: s.sido,
            sigungu: s.sigungu,
            dong: s.dong,
            aptName: s.name,
            area,
            floor: 1 + Math.floor(rand() * s.maxFloor),
            price,
            dealDate: iso(d),
          });
        }
      }
      list.sort((a, b) => a.dealDate.localeCompare(b.dealDate));
      list.forEach((t, i) => out.push({ ...t, prevPrice: i > 0 ? list[i - 1].price : null }));
    }
  }
  return out.sort((a, b) => b.dealDate.localeCompare(a.dealDate) || a.id.localeCompare(b.id));
}

export const SAMPLE_COMPLEXES: Complex[] = SEEDS.map(({ areas, maxFloor, ...c }) => c);
export const SAMPLE_TRADES: Trade[] = buildTrades(new Date());

/** 샘플 데이터 설명 문구 (화면 하단 안내용) */
export const SAMPLE_NOTICE = `샘플 데이터로 표시 중입니다. 예: ${SAMPLE_COMPLEXES[0].name} ${formatPrice(SEEDS[0].areas[1][1])}`;
