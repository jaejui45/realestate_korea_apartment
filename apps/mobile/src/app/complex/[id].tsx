import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PERIODS, areaKey, areasOf, delta, formatArea, formatCount, formatDate, formatPrice, monthlySeries, type Period } from '@core';
import { Icon } from '@/components/icon';
import { PriceChart } from '@/components/price-chart';
import { Button, Chip, Divider, Empty, SectionHeader, T } from '@/components/ui';
import { repo } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C, dirColor } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

export default function ComplexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { favorites, toggleFavorite } = useStore();
  const { data } = useAsync(() => Promise.all([repo.complex(id), repo.complexTrades(id)]), [id]);
  const [pickedArea, setArea] = useState<number>();
  const [period, setPeriod] = useState<Period>('1y');
  const [showAll, setShowAll] = useState(false);

  const [c, trades = []] = data ?? [];
  const areas = areasOf(trades);
  const area = pickedArea ?? (areas.includes(84) ? 84 : areas[0]);
  const list = trades.filter((t) => areaKey(t.area) === area);
  const latest = list[0];
  const d = latest ? delta(latest.price, latest.prevPrice) : null;
  const fav = favorites.includes(id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.nav}>
        <Pressable hitSlop={10} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Icon name="back" />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 18 }}>
          <Pressable hitSlop={8} onPress={() => c && Share.share({ message: `${c.name} 실거래가 - 부동산 필승` })}>
            <Icon name="share" />
          </Pressable>
          <Pressable hitSlop={8} onPress={() => toggleFavorite(id)}>
            <Icon name="heart" color={fav ? C.up : C.ink} filled={fav} />
          </Pressable>
        </View>
      </View>

      {!data ? (
        <Empty text="불러오는 중…" />
      ) : !c ? (
        <Empty text="단지를 찾을 수 없어요" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
            <T size={24} w="700">
              {c.name}
            </T>
            <T size={14} color={C.sub} style={{ marginTop: 6 }}>
              {[`${c.sigungu} ${c.dong}`, c.households && `${formatCount(c.households)}세대`, c.buildYear && `${c.buildYear}년 준공`].filter(Boolean).join(' · ')}
            </T>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 14 }}>
            {areas.map((a) => (
              <Chip key={a} label={`${a}㎡`} active={a === area} onPress={() => (setArea(a), setShowAll(false))} />
            ))}
          </ScrollView>

          {latest && d ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
              <T size={13} color={C.sub}>
                {formatArea(latest.area)} 최근 실거래 · {formatDate(latest.dealDate)}
              </T>
              <T size={32} w="700" style={{ marginTop: 4 }}>
                {formatPrice(latest.price)}
              </T>
              <T size={14} w="500" color={dirColor[d.dir]}>
                {d.text}
                {d.pct ? ` (${d.pct})` : ''}
                <T size={14} color={C.ter}>
                  {'  '}직전 거래 대비
                </T>
              </T>
            </View>
          ) : (
            <Empty text="아직 거래 기록이 없어요" />
          )}

          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <PriceChart series={monthlySeries(list, period)} width={width - 40} />
          </View>
          <View style={s.periods}>
            {PERIODS.map((p) => (
              <Pressable key={p.value} onPress={() => setPeriod(p.value)} style={[s.period, p.value === period && { backgroundColor: C.soft }]}>
                <T size={14} w={p.value === period ? '700' : '500'} color={p.value === period ? C.ink : C.ter}>
                  {p.label}
                </T>
              </Pressable>
            ))}
          </View>

          <Divider />
          <SectionHeader title="실거래 내역" more={`${area}㎡ · ${list.length}건`} />
          <View style={[s.tr, { paddingVertical: 10 }]}>
            <T size={12} color={C.ter} style={{ width: 110 }}>
              계약일
            </T>
            <T size={12} color={C.ter} style={{ width: 60 }}>
              층
            </T>
            <T size={12} color={C.ter} style={{ flex: 1, textAlign: 'right' }}>
              거래가
            </T>
          </View>
          {(showAll ? list : list.slice(0, 8)).map((t) => (
            <View key={t.id} style={s.tr}>
              <T size={14} style={{ width: 110 }}>
                {formatDate(t.dealDate)}
              </T>
              <T size={14} style={{ width: 60 }}>
                {t.floor != null ? `${t.floor}층` : '-'}
              </T>
              <T size={14} w="700" style={{ flex: 1, textAlign: 'right' }}>
                {formatPrice(t.price)}
              </T>
            </View>
          ))}
          {!showAll && list.length > 8 && <Button kind="outline" label="전체 거래 내역 보기" onPress={() => setShowAll(true)} style={{ margin: 20 }} />}
        </ScrollView>
      )}

      <SafeAreaView edges={['bottom']} style={s.cta}>
        <Pressable onPress={() => toggleFavorite(id)} style={s.heartBox}>
          <Icon name="heart" color={fav ? C.up : C.ink} filled={fav} />
        </Pressable>
        <Button label="시세 알림 받기" style={{ flex: 1 }} onPress={() => Alert.alert('시세 알림', '새 실거래가 등록되면 알려드리는 기능은 곧 제공될 예정이에요.')} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  periods: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12 },
  period: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderColor: C.line },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: C.bg, borderTopWidth: 1, borderColor: C.line },
  heartBox: { borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14 },
});
