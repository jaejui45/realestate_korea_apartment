import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { delta, formatArea, formatPrice, formatShortDate, type Direction, type Trade } from '@core';
import { C, dirBg, dirColor } from '@/lib/theme';

type W = '400' | '500' | '600' | '700';

export function T({ size = 15, w = '400', color = C.ink, style, ...rest }: TextProps & { size?: number; w?: W; color?: string }) {
  return <Text {...rest} style={[{ fontSize: size, fontWeight: w, color, letterSpacing: -0.2 }, style]} />;
}

export function Chip({ label, active, onPress, primary, style }: { label: string; active?: boolean; onPress?: () => void; primary?: boolean; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active ? { backgroundColor: primary ? C.primary : C.ink, borderColor: 'transparent' } : null, style]}>
      <T size={13} w={active ? '700' : '500'} color={active ? '#fff' : C.sub}>
        {label}
      </T>
    </Pressable>
  );
}

export function Tag({ text, dir }: { text: string; dir: Direction }) {
  return (
    <View style={[s.tag, { backgroundColor: dirBg[dir] }]}>
      <T size={13} w="700" color={dirColor[dir]}>
        {text}
      </T>
    </View>
  );
}

/** 서울 | 경기 같은 세그먼트 */
export function Segmented<V extends string>({ items, value, onChange }: { items: { value: V; label: string }[]; value: V; onChange: (v: V) => void }) {
  return (
    <View style={s.seg}>
      {items.map((it) => {
        const on = it.value === value;
        return (
          <Pressable key={it.value} onPress={() => onChange(it.value)} style={[s.segItem, on && s.segOn]}>
            <T w={on ? '700' : '500'} color={on ? C.ink : C.ter}>
              {it.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionHeader({ title, sub, more, onMore }: { title: string; sub?: string; more?: string; onMore?: () => void }) {
  return (
    <View style={s.section}>
      <View style={{ flex: 1 }}>
        <T size={18} w="700">
          {title}
        </T>
        {sub ? (
          <T size={13} color={C.ter} style={{ marginTop: 4 }}>
            {sub}
          </T>
        ) : null}
      </View>
      {more ? (
        <Pressable onPress={onMore} hitSlop={8}>
          <T size={14} w="500" color={C.ter}>
            {more}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 8, backgroundColor: C.soft }, style]} />;
}

export function Button({ label, onPress, kind = 'primary', style }: { label: string; onPress?: () => void; kind?: 'primary' | 'outline'; style?: ViewStyle }) {
  const primary = kind === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.btn, primary ? { backgroundColor: C.primary } : { borderWidth: 1, borderColor: C.line }, pressed && { opacity: 0.85 }, style]}>
      <T size={16} w="700" color={primary ? '#fff' : C.ink}>
        {label}
      </T>
    </Pressable>
  );
}

export function openComplex(id: string) {
  router.push({ pathname: '/complex/[id]', params: { id } });
}

export function TradeRow({ t, showRegion = true }: { t: Trade; showRegion?: boolean }) {
  const d = delta(t.price, t.prevPrice);
  const meta = [showRegion ? `${t.sigungu} ${t.dong}` : t.dong, formatArea(t.area), t.floor != null ? `${t.floor}층` : null, formatShortDate(t.dealDate)]
    .filter(Boolean)
    .join(' · ');
  return (
    <Pressable onPress={() => openComplex(t.complexId)} style={({ pressed }) => [s.row, pressed && { backgroundColor: C.soft }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <T size={16} w="600" numberOfLines={1}>
          {t.aptName}
        </T>
        <T size={13} color={C.sub} numberOfLines={1} style={{ marginTop: 4 }}>
          {meta}
        </T>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T size={16} w="700">
          {formatPrice(t.price)}
        </T>
        <T size={13} w="500" color={dirColor[d.dir]} style={{ marginTop: 4 }}>
          {d.text}
        </T>
      </View>
    </Pressable>
  );
}

export function Empty({ text, style }: { text: string; style?: TextStyle }) {
  return (
    <T size={14} color={C.ter} style={[{ textAlign: 'center', paddingVertical: 40 }, style]}>
      {text}
    </T>
  );
}

const s = StyleSheet.create({
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 100, paddingVertical: 7, paddingHorizontal: 13, backgroundColor: C.bg },
  tag: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 7, alignSelf: 'flex-start' },
  seg: { flexDirection: 'row', backgroundColor: C.soft, borderRadius: 12, padding: 4, gap: 4 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segOn: { backgroundColor: C.bg, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  section: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  btn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
});
