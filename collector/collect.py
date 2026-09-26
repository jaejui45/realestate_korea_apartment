"""
국토교통부 아파트 매매 실거래가(서울·경기)를 받아 Supabase에 저장합니다.

환경변수
  PUBLIC_DATA_SERVICE_KEY    공공데이터포털 서비스키 (국토교통부_아파트 매매 실거래가 상세 자료)
  SUPABASE_URL               Supabase 프로젝트 URL
  SUPABASE_SERVICE_ROLE_KEY  service_role 키 (서버/CI 전용, 절대 앱에 넣지 말 것)

사용 예
  python collect.py                      # 서울·경기, 이번 달 포함 최근 2개월
  python collect.py --months 36          # 최근 3년 (최초 1회 적재)
  python collect.py --sido 경기 --months 3
  python collect.py --dry-run --codes 11710 --months 1
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import time
from pathlib import Path

import pandas as pd
from PublicDataReader import TransactionPrice

REGIONS_PATH = Path(__file__).resolve().parent.parent / "packages" / "core" / "src" / "regions.json"
BATCH = 500


def month_list(months: int, today: dt.date) -> list[str]:
    out, y, m = [], today.year, today.month
    for _ in range(months):
        out.append(f"{y}{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return out


def to_rows(df: pd.DataFrame, region: dict) -> tuple[list[dict], list[dict]]:
    """API 원본 컬럼(translate=False) → complexes / trades 행."""
    complexes: dict[str, dict] = {}
    trades: list[dict] = []
    for r in df.to_dict("records"):
        name = str(r.get("aptNm") or "").strip()
        dong = str(r.get("umdNm") or "").strip()
        seq = str(r.get("aptSeq") or "").strip()
        if not name or pd.isna(r.get("dealAmount")):
            continue
        cid = seq if seq and seq != "nan" else f"{region['code']}-{dong}-{name}"
        build_year = r.get("buildYear")
        complexes[cid] = {
            "id": cid,
            "sido": region["sido"],
            "sigungu_code": region["code"],
            "sigungu": region["name"],
            "dong": dong,
            "name": name,
            "build_year": None if pd.isna(build_year) else int(build_year),
            "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        }
        floor = r.get("floor")
        trades.append({
            "complex_id": cid,
            "sido": region["sido"],
            "sigungu_code": region["code"],
            "sigungu": region["name"],
            "dong": dong,
            "apt_name": name,
            "area": round(float(r["excluUseAr"]), 2),
            "floor": None if pd.isna(floor) else int(floor),
            "price": int(r["dealAmount"]),
            "deal_date": f"{int(r['dealYear']):04d}-{int(r['dealMonth']):02d}-{int(r['dealDay']):02d}",
            "canceled": str(r.get("cdealType") or "").strip().upper() == "O",
        })
    # 같은 배치 안의 중복은 upsert 오류를 내므로 제거
    uniq = {(t["complex_id"], t["area"], t["floor"], t["deal_date"], t["price"]): t for t in trades}
    return list(complexes.values()), list(uniq.values())


def check_key(key: str) -> None:
    """서비스키가 동작하는지 먼저 확인합니다.

    PublicDataReader는 HTTP 오류(401/403 등)를 출력만 하고 빈 결과를 돌려주기 때문에,
    키가 잘못돼도 '0건 수집'으로 조용히 끝나는 것을 막기 위함입니다.
    """
    import re
    import requests

    last_month = (dt.date.today().replace(day=1) - dt.timedelta(days=1)).strftime("%Y%m")
    res = requests.get(
        "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
        params={"serviceKey": requests.utils.unquote(key), "LAWD_CD": "11110", "DEAL_YMD": last_month, "numOfRows": "1"},
        timeout=30,
    )
    code = re.search(r"<(?:resultCode|returnReasonCode)>([^<]+)<", res.text)
    msg = next((m for tag in ("returnAuthMsg", "resultMsg", "errMsg") if (m := re.search(f"<{tag}>([^<]+)<", res.text))), None)
    if res.status_code != 200 or not code or code.group(1) not in ("00", "000"):
        detail = msg.group(1) if msg else res.text[:200].replace("\n", " ")
        raise SystemExit(
            f"서비스키 확인 실패 (HTTP {res.status_code}, 코드 {code.group(1) if code else '-'}): {detail}\n"
            "- 발급 직후라면 1~2시간 뒤 다시 실행해 보세요.\n"
            "- '국토교통부_아파트 매매 실거래가 상세 자료' 활용신청이 승인됐는지 확인하세요."
        )
    print("서비스키 확인 완료")


def upsert(db, table: str, rows: list[dict], conflict: str) -> None:
    for i in range(0, len(rows), BATCH):
        db.table(table).upsert(rows[i:i + BATCH], on_conflict=conflict).execute()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--months", type=int, default=2, help="이번 달부터 거꾸로 몇 개월 (신고 기한 30일 때문에 기본 2)")
    ap.add_argument("--sido", choices=["서울", "경기"], help="한 시도만 수집")
    ap.add_argument("--codes", nargs="*", help="특정 시군구 코드만 수집 (예: 11710 41135)")
    ap.add_argument("--dry-run", action="store_true", help="DB에 쓰지 않고 건수만 출력")
    args = ap.parse_args()

    key = os.environ.get("PUBLIC_DATA_SERVICE_KEY")
    if not key:
        print("PUBLIC_DATA_SERVICE_KEY 가 없습니다.", file=sys.stderr)
        return 1

    db = None
    if not args.dry_run:
        from supabase import create_client
        db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])

    regions = json.loads(REGIONS_PATH.read_text(encoding="utf-8"))
    if args.sido:
        regions = [r for r in regions if r["sido"] == args.sido]
    if args.codes:
        regions = [r for r in regions if r["code"] in args.codes]

    check_key(key)
    api = TransactionPrice(key)
    months = month_list(args.months, dt.date.today())
    total, failed = 0, []
    for region in regions:
        for ym in months:
            try:
                df = api.get_data(property_type="아파트", trade_type="매매",
                                  sigungu_code=region["code"], year_month=ym, translate=False)
            except Exception as e:  # 한 지역이 실패해도 나머지는 계속
                failed.append(f"{region['name']}({region['code']}) {ym}: {e}")
                continue
            complexes, trades = to_rows(df, region)
            total += len(trades)
            print(f"{region['sido']} {region['name']} {ym}: {len(trades)}건")
            if db and trades:
                upsert(db, "complexes", complexes, "id")
                upsert(db, "trades", trades, "complex_id,area,floor,deal_date,price")
            time.sleep(0.2)

    print(f"완료: 총 {total}건, 실패 {len(failed)}건")
    for f in failed:
        print("  실패:", f, file=sys.stderr)
    # 실패가 있거나 한 건도 못 받았으면 Actions 에서 빨간불로 보이도록
    return 1 if failed or total == 0 else 0


if __name__ == "__main__":
    sys.exit(main())
