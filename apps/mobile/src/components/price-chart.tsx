import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { C } from '@/lib/theme';
import { T } from './ui';

/** 월별 평균가 추이 */
export function PriceChart({ series, width }: { series: { month: string; price: number }[]; width: number }) {
  const h = 150;
  if (series.length < 2) {
    return (
      <View style={{ height: h, borderRadius: 12, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
        <T size={13} color={C.ter}>
          이 기간에는 거래가 적어 차트를 그릴 수 없어요
        </T>
      </View>
    );
  }
  const prices = series.map((p) => p.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const span = max - min || 1;
  const step = (width - 8) / (series.length - 1);
  const pts = series.map((p, i) => [i * step, h - 10 - ((p.price - min) / span) * (h - 30)] as const);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  const color = prices[prices.length - 1] >= prices[0] ? C.up : C.down;
  const labels = [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]].map((p) => p.month.slice(0, 7).replace('-', '.'));
  return (
    <View>
      <Svg width={width} height={h}>
        {[1, 2, 3].map((i) => (
          <Line key={i} x1={0} x2={width} y1={(h * i) / 4} y2={(h * i) / 4} stroke={C.line} strokeDasharray="3 4" />
        ))}
        <Path d={`${d} L${lx} ${h} L0 ${h} Z`} fill={color} fillOpacity={0.08} />
        <Path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <Circle cx={lx} cy={ly} r={5} fill={color} stroke="#fff" strokeWidth={2} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        {labels.map((l, i) => (
          <T key={i} size={11} color={C.ter}>
            {l}
          </T>
        ))}
      </View>
    </View>
  );
}
