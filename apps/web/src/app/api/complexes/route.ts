import { repo } from "@/lib/repo";

/** GET /api/complexes?ids=a,b,c → 단지 요약 목록 (관심 단지 화면용) */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 100);
  return Response.json(await repo.complexSummaries(ids));
}
