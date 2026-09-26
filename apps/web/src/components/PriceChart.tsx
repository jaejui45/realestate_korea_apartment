import { formatEok } from "@core";

/** 월별 평균가 추이 (서버에서 SVG로 그림) */
export function PriceChart({ series, color = "var(--color-up)" }: { series: { month: string; price: number }[]; color?: string }) {
  const w = 343;
  const h = 150;
  if (series.length < 2) {
    return <div className="flex h-[150px] items-center justify-center rounded-xl bg-soft text-sm text-ter">이 기간에는 거래가 적어 차트를 그릴 수 없어요</div>;
  }
  const prices = series.map((s) => s.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const span = max - min || 1;
  const step = (w - 8) / (series.length - 1);
  const pts = series.map((s, i) => [i * step, h - 10 - ((s.price - min) / span) * (h - 30)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  const labels = [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]].map((s) => s.month.slice(0, 7).replace("-", "."));

  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`최저 ${formatEok(min)}, 최고 ${formatEok(max)}`}>
        {[1, 2, 3].map((i) => (
          <line key={i} x1={0} x2={w} y1={(h * i) / 4} y2={(h * i) / 4} stroke="var(--color-line)" strokeDasharray="3 4" />
        ))}
        <path d={`${d} L${lx} ${h} L0 ${h} Z`} fill={color} fillOpacity={0.08} />
        <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lx} cy={ly} r={5} fill={color} stroke="#fff" strokeWidth={2} />
      </svg>
      <figcaption className="mt-1.5 flex justify-between text-[11px] text-ter">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </figcaption>
    </figure>
  );
}
