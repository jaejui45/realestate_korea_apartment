-- 부동산 필승: 서울·경기 아파트 매매 실거래가 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.

-- 단지 (국토부 단지일련번호 aptSeq 기준)
create table if not exists public.complexes (
  id            text primary key,              -- aptSeq (예: 11710-6541)
  sido          text not null check (sido in ('서울', '경기')),
  sigungu_code  text not null,
  sigungu       text not null,
  dong          text not null,
  name          text not null,
  build_year    int,
  households    int,                           -- 공동주택 단지정보 API 등으로 보강 (선택)
  lat           double precision,              -- 지도 표시용, 지오코딩으로 보강 (선택)
  lng           double precision,
  updated_at    timestamptz not null default now()
);
create index if not exists complexes_sigungu_idx on public.complexes (sigungu_code);
create index if not exists complexes_name_idx on public.complexes (name);

-- 매매 실거래
create table if not exists public.trades (
  id            bigint generated always as identity primary key,
  complex_id    text not null references public.complexes (id) on delete cascade,
  sido          text not null check (sido in ('서울', '경기')),
  sigungu_code  text not null,
  sigungu       text not null,
  dong          text not null,
  apt_name      text not null,
  area          numeric(7, 2) not null,        -- 전용면적 ㎡
  floor         int,
  price         int not null,                  -- 거래금액 (만원)
  deal_date     date not null,
  canceled      boolean not null default false, -- 해제 신고된 거래
  created_at    timestamptz not null default now(),
  -- floor 가 null 이어도 중복 수집을 막도록 nulls not distinct (Postgres 15+)
  constraint trades_dedup unique nulls not distinct (complex_id, area, floor, deal_date, price)
);
create index if not exists trades_deal_date_idx on public.trades (deal_date desc);
create index if not exists trades_sigungu_date_idx on public.trades (sigungu_code, deal_date desc);
create index if not exists trades_complex_idx on public.trades (complex_id, deal_date desc);

-- 관심 단지 (로그인 기능을 붙일 때 사용)
create table if not exists public.favorites (
  user_id     uuid not null references auth.users (id) on delete cascade,
  complex_id  text not null references public.complexes (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, complex_id)
);

-- 직전 거래가 (같은 단지·같은 면적)
create or replace view public.trades_with_prev with (security_invoker = true) as
select t.*,
       lag(t.price) over (partition by t.complex_id, round(t.area) order by t.deal_date, t.id) as prev_price
from public.trades t
where not t.canceled;

-- 단지별 최신 거래 + 최근 3개월 거래 수 (검색·지도·인기 단지용)
create or replace view public.complex_latest with (security_invoker = true) as
select distinct on (p.complex_id)
       p.*,
       c.build_year, c.households, c.lat, c.lng,
       count(*) filter (where p.deal_date >= current_date - 90) over (partition by p.complex_id) as trade_count_3m
from public.trades_with_prev p
join public.complexes c on c.id = p.complex_id
order by p.complex_id, p.deal_date desc, p.id desc;

-- 시군구별 84㎡ 전후 평균가 (최근 3개월 vs 그 이전 3개월)
create or replace view public.region_stats with (security_invoker = true) as
select sigungu_code, sido, sigungu,
       round(avg(price) filter (where deal_date >= current_date - 90)) as avg_price,
       round(avg(price) filter (where deal_date <  current_date - 90)) as prev_avg_price,
       count(*)         filter (where deal_date >= current_date - 90) as trade_count
from public.trades
where not canceled and area between 80 and 90 and deal_date >= current_date - 180
group by sigungu_code, sido, sigungu;

-- 시도별 최근 7일 계약 요약
create or replace view public.sido_weekly with (security_invoker = true) as
select sido,
       count(*)         filter (where deal_date >= current_date - 7) as trade_count,
       round(avg(price) filter (where deal_date >= current_date - 7)) as avg_price,
       round(avg(price) filter (where deal_date <  current_date - 7)) as prev_avg_price
from public.trades
where not canceled and deal_date >= current_date - 14
group by sido;

-- 보안 규칙: 실거래·단지는 누구나 읽기만, 쓰기는 service_role(수집기)만
alter table public.complexes enable row level security;
alter table public.trades    enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "public read complexes" on public.complexes;
create policy "public read complexes" on public.complexes for select using (true);
drop policy if exists "public read trades" on public.trades;
create policy "public read trades" on public.trades for select using (true);
drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
