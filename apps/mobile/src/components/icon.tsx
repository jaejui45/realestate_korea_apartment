import Svg, { Circle, Path } from 'react-native-svg';
import { C } from '@/lib/theme';

const PATHS: Record<string, string[]> = {
  home: ['M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
  map: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z'],
  heart: ['M12 20s-7.5-4.6-9.2-9C1.6 7.8 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.4 3.3 4.2 6.5C19.5 15.4 12 20 12 20z'],
  search: ['M20 20l-4-4'],
  user: ['M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7'],
  bell: ['M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z', 'M10 21.5h4'],
  back: ['M15 5l-7 7 7 7'],
  chev: ['M9 5l7 7-7 7'],
  down: ['M6 9l6 6 6-6'],
  filter: ['M4 6h16M7 12h10M10 18h4'],
  close: ['M6 6l12 12M18 6L6 18'],
  share: ['M12 3v12M7 8l5-5 5 5', 'M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5'],
};
const CIRCLES: Record<string, [number, number, number]> = { map: [12, 9.5, 2.5], search: [11, 11, 7], user: [12, 8, 4] };

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, color = C.ink, filled = false }: { name: IconName; size?: number; color?: string; filled?: boolean }) {
  const circle = CIRCLES[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {circle && <Circle cx={circle[0]} cy={circle[1]} r={circle[2]} />}
      {PATHS[name].map((d) => (
        <Path key={d} d={d} />
      ))}
    </Svg>
  );
}
