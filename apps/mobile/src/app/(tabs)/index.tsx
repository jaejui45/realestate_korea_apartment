import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { delta, formatArea, formatCount, formatPrice, pctChange, type Sido } from '@core';
import { Icon } from '@/components/icon';
import { Empty, SectionHeader, Segmented, T, Tag, TradeRow, openComplex } from '@/components/ui';
import { repo } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C, dirColor } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

export default function Home() {
  const [sido, setSido] = useState<Sido>('서울');
  const { favorites } = useStore();
  const summary = useAsync(() => repo.sidoSummary(sido), [sido]);
  const recent = useAsync(() => repo.recentTrades({ sido, pageSize: 10 }), [sido]);
  const favs = useAsync(() => repo.complexSummaries(favorites.slice(0, 6)), [favorites.join()]);
  const change = summary.data ? pctChange(summary.data.avgPrice, summary.data.prevAvgPrice) : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView>
        <View style={s.header}>
          <T size={22} w="700" color={C.primary}>
            부동산 필승
          </T>
          <View style={{ flexDirection: 'row', gap: 18 }}>
            <Pressable hitSlop={8} onPress={() => router.navigate('/search')}>
              <Icon name="search" />
            </Pressable>
            <Icon name="bell" />
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 }}>
          <Segmented items={[{ value: '서울', label: '서울' }, { value: '경기', label: '경기' }]} value={sido} onChange={setSido} />
        </View>

        <View style={s.card}>
          <T size={14} w="500" color={C.sub}>
            {sido} 아파트 · 최근 7일 계약
          </T>
          <T size={26} w="700" style={{ marginTop: 6 }}>
            매매 거래 {formatCount(summary.data?.tradeCount ?? 0)}건
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <T size={15} w="500">
              평균 거래가 {summary.data?.avgPrice ? formatPrice(summary.data.avgPrice) : '-'}
            </T>
            {change && change.dir !== 'new' && <Tag text={change.text} dir={change.dir} />}
          </View>
        </View>

        <SectionHeader title="관심 단지" more="전체" onMore={() => router.navigate('/favorites')} />
        {favs.data?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {favs.data.map((c) => {
              const d = c.latest ? delta(c.latest.price, c.latest.prevPrice) : null;
              return (
                <Pressable key={c.id} onPress={() => openComplex(c.id)} style={s.fav}>
                  <T w="700" numberOfLines={2}>
                    {c.name}
                  </T>
                  <T size={12} color={C.sub} style={{ marginTop: 4 }}>
                    {c.sigungu} {c.dong}
                    {c.latest ? ` · ${formatArea(c.latest.area)}` : ''}
                  </T>
                  <T size={18} w="700" style={{ marginTop: 12 }}>
                    {c.latest ? formatPrice(c.latest.price) : '-'}
                  </T>
                  {d && (
                    <T size={13} w="700" color={dirColor[d.dir]} style={{ marginTop: 2 }}>
                      {d.text}
                    </T>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Pressable onPress={() => router.navigate('/search')} style={[s.fav, { marginHorizontal: 20, width: undefined, alignItems: 'center' }]}>
            <T size={14} color={C.sub}>
              단지를 검색하고 ♡ 를 눌러 모아보세요
            </T>
          </Pressable>
        )}

        <SectionHeader title="최근 올라온 실거래" sub={recent.data?.items[0] ? `${sido} · ${recent.data.items[0].dealDate.replaceAll('-', '.')} 계약분까지` : sido} />
        {recent.data?.items.map((t) => <TradeRow key={t.id} t={t} />)}
        {recent.error && <Empty text={`불러오지 못했어요: ${recent.error.message}`} />}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 },
  card: { marginHorizontal: 20, backgroundColor: C.soft, borderRadius: 20, padding: 20 },
  fav: { width: 160, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 16 },
});
