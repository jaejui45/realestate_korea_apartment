/** Figma "디자인 토큰" 과 같은 값 */
export const C = {
  bg: '#FFFFFF',
  soft: '#F2F4F6',
  line: '#E5E8EB',
  ink: '#191F28',
  sub: '#6B7684',
  ter: '#8B95A1',
  ter2: '#B0B8C1',
  primary: '#7C3AED',
  primarySoft: '#F3EEFE',
  up: '#F04452',
  upSoft: '#FEECEE',
  down: '#2F7BF5',
  downSoft: '#EAF2FE',
} as const;

export const dirColor = { up: C.up, down: C.down, flat: C.ter, new: C.ter } as const;
export const dirBg = { up: C.upSoft, down: C.downSoft, flat: C.soft, new: C.soft } as const;
