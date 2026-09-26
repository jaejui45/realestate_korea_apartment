# 부동산 필승

서울·경기 아파트 매매 실거래가를 보여주는 **모바일 웹 + iOS/Android 앱**입니다.
데이터는 공공데이터포털(국토교통부 아파트 매매 실거래가)에서 매일 수집해 Supabase(PostgreSQL)에 저장합니다.

- 디자인: [Figma](https://www.figma.com/design/gCK9Frv17ilOo17URuqz3g)
- Supabase를 연결하지 않아도 **샘플 데이터로 바로 실행**됩니다. 샘플 가격과 단지 정보는 실제와 다릅니다.

## 구조

```
apps/web          모바일 웹 (Next.js 16 · Tailwind CSS 4)
apps/mobile       앱 (Expo 57 · React Native · expo-router)
packages/core     웹·앱 공통 코드: 타입, 지역 코드, 가격 포맷, 데이터 조회(Supabase/샘플)
supabase          DB 스키마 (schema.sql)
collector         실거래가 수집기 (Python · PublicDataReader)
.github/workflows 매일 06:00(KST) 자동 수집
```

```
[모바일 웹 / 앱] ──읽기(anon key)──▶ [Supabase: trades, complexes + 집계 뷰]
                                              ▲
                     [collector: GitHub Actions 매일] ◀── 국토교통부 실거래가 API
```

## 실행

Node.js 20 이상이 필요합니다.

```bash
# 모바일 웹 → http://localhost:3000
cd apps/web && npm install && npm run dev

# 앱 → 휴대폰에 Expo Go 설치 후 QR 스캔
cd apps/mobile && npm install && npx expo start
```

지도는 `react-native-maps`를 씁니다. Expo Go에서 바로 확인할 수 있고, 스토어 배포용 Android 빌드에는 Google Maps API 키가 필요합니다.

## 실제 데이터 연결

1. **공공데이터포털 키 발급:** [공공데이터포털](https://www.data.go.kr)에서 "국토교통부_아파트 매매 실거래가 상세 자료"를 검색해 활용신청을 하고 서비스키를 받습니다.
2. **Supabase 프로젝트 생성:** 리전은 Seoul(`ap-northeast-2`)을 선택합니다. SQL Editor에 `supabase/schema.sql` 내용을 붙여넣고 실행합니다.
3. **GitHub Secrets 등록:** 레포 Settings → Secrets and variables → Actions에 아래 3개를 등록합니다.
   - `PUBLIC_DATA_SERVICE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **최초 적재:** Actions → "실거래가 수집" → Run workflow에서 `months`를 `36`으로 실행하면 최근 3년치를 넣습니다. 이후에는 매일 최근 2개월치를 다시 받아 늦게 신고된 거래와 해제 신고를 반영합니다.
5. **앱/웹 환경변수:** 각 앱의 `.env.example`을 복사해 Supabase URL과 **anon key**를 넣습니다.
   - 웹: `apps/web/.env.local`
   - 앱: `apps/mobile/.env`

   service_role 키는 절대 앱이나 웹에 넣으면 안 됩니다.

로컬에서 수집기만 따로 실행할 수도 있습니다.

```bash
pip install -r collector/requirements.txt
PUBLIC_DATA_SERVICE_KEY=... python collector/collect.py --dry-run --codes 11710 --months 1   # DB 저장 없이 건수만 확인
```

## 참고

- 지역 코드는 `packages/core/src/regions.json` 한 곳에서 관리합니다. 서울 25개 구와 경기 시·군·구가 들어 있고, 수집기와 앱이 같은 파일을 씁니다.
  - 부천시(2024년 구 재설치)와 화성시(2026년 구 설치)는 행정구역이 바뀐 곳이라, 수집 로그에서 실패하면 코드를 확인해 주세요.
- 실거래 API에는 **좌표와 세대수가 없어요.** 그래서 실제 데이터로 지도를 띄우려면 `complexes.lat/lng`를 채우는 작업이 필요합니다(예: 카카오 로컬 API 지오코딩). 좌표가 없는 단지는 지도에 표시되지 않습니다.
- 관심 단지는 지금 기기/브라우저에 저장됩니다. 로그인을 붙이면 `favorites` 테이블(RLS 적용)로 옮기면 됩니다.
- 시세 알림(푸시)은 아직 버튼만 있고 기능은 없습니다.
