# 부동산 필승 — 프로젝트 안내 (Claude Code용)

서울·경기 아파트 **매매 실거래가** 서비스. 모바일 웹 + iOS/Android 앱 + Supabase(DB) + 매일 수집기.
사용자는 비개발자에 가깝고 한국어로 소통한다. 명령어는 복사해서 붙여넣을 수 있게 주고, 가능한 작업은 직접 실행한다.

## 구조
- `apps/web` — 모바일 웹. Next.js 16 (App Router, Turbopack) + Tailwind CSS 4. `AGENTS.md` 참고: 이 Next 버전은 학습 데이터와 다르니 `node_modules/next/dist/docs/`를 확인할 것.
- `apps/mobile` — 앱. Expo SDK 57 + expo-router (`src/app/`), react-native-maps, react-native-svg. 패키지 추가는 `npx expo install`.
- `packages/core` — 웹·앱 공통 순수 TS (의존성 없음): 타입, `regions.json`(지역 코드 단일 출처), 가격 포맷, `Repository`(Supabase 구현 + 샘플 데이터 구현).
  - 웹은 `next.config.ts`의 `turbopack.root`로, 앱은 `metro.config.js`의 `watchFolders`로 불러온다. 둘 다 tsconfig 경로 별칭 `@core`.
- `supabase/schema.sql` — 테이블(`complexes`, `trades`, `favorites`), 뷰(`trades_with_prev`, `complex_latest`, `region_stats`, `sido_weekly`), RLS. 이미 실행 완료.
- `collector/collect.py` — PublicDataReader(`translate=False`, 영문 컬럼)로 국토부 API → Supabase upsert. 단지 ID = 국토부 `aptSeq`.
- `.github/workflows/collect.yml` — 매일 06:00 KST, 최근 2개월 재수집. 수동 실행 시 `months` 입력.

## 디자인
- Figma: https://www.figma.com/design/gCK9Frv17ilOo17URuqz3g (페이지: 앱 / 모바일 웹)
- 브랜드 "부동산 필승", 메인 컬러 보라 `#7C3AED`(soft `#F3EEFE`), 상승 빨강 `#F04452`, 하락 파랑 `#2F7BF5`. 토큰은 `apps/web/src/app/globals.css`, `apps/mobile/src/lib/theme.ts`.
- 사용자의 Figma는 Starter 플랜이라 Figma MCP 호출이 월 20회 정도로 제한됨. 아껴 쓸 것.

## 실행
```bash
# 웹 (http://localhost:3000)
cd apps/web && npm install && npm run dev
# 앱 (아이폰 시뮬레이터)
cd apps/mobile && npm install && npx expo start --ios
```
- 환경변수가 없으면 두 앱 모두 **샘플 데이터**로 동작한다.
- 실제 데이터: `apps/web/.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `apps/mobile/.env`에 `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - URL은 `https://oplmfpvublutlueephoq.supabase.co`. anon 키는 사용자에게 받는다. 사용자가 레포에 커밋하지 않기를 원함.
- service_role 키와 공공데이터 키는 GitHub Secrets에만 있다(`PUBLIC_DATA_SERVICE_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). 절대 코드·앱에 넣지 말 것.

## 검증 명령
- core: `apps/web/node_modules/.bin/tsc -p packages/core`
- web: `cd apps/web && npx tsc --noEmit && npx eslint . && npx next build`
  - 라우트 타입(`PageProps`)이 없다고 나오면 `npx next typegen`
- mobile: `cd apps/mobile && npx tsc --noEmit && npx eslint .`
  - 번들 확인은 `npx expo export --platform ios`

## 현재 상태 (2026-09-26 기준)
- PR #1(전체 코드), #2(화성시 구 코드) main에 머지 완료.
- 1개월 테스트 수집 성공: 7,280건.
- 36개월 최초 적재 실행함. 결과 확인이 필요하다: Actions run 36247224187.
  - 확인할 것: 총 건수, 실패 지역, 화성시 새 구(41591/41593/41595/41597)와 개편 전 코드(41590, 41190) 건수.
- 화성시는 2026년에 4개 구로 개편, 부천시는 2024년에 3개 구로 개편. 개편 전 코드는 `regions.json`에 `legacy: true`로 수집만 하고 목록에서 숨긴다.

## 남은 작업
1. **아이폰 시뮬레이터에서 앱 실행 확인** ← 지금 할 일. 앱을 실제 기기에서 실행해 본 적은 아직 없음.
2. 웹 배포 (Vercel, Root Directory `apps/web`, 환경변수 2개).
3. 지도용 좌표: 실거래 API에 좌표가 없어 실제 데이터에서는 지도에 단지가 안 뜬다. `complexes.lat/lng`를 채워야 함(예: 카카오 로컬 API 지오코딩).
4. 시세 알림(푸시)은 버튼만 있고 기능 없음. 관심 단지는 기기/브라우저 로컬 저장 → 로그인 붙이면 `favorites` 테이블로.
5. 알려진 사소한 문제: 앱을 웹으로 볼 때 하단 탭 라벨이 살짝 잘려 보임(네이티브는 미확인).

## 작업 규칙
- 기본 브랜치 `main`. 작업은 브랜치에서 하고 PR로 머지한다.
- 커밋 전 위 검증 명령을 통과시킬 것.
