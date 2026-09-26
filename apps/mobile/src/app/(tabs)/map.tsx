import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AREA_BANDS, delta, findRegion, formatArea, formatCount, formatDate, formatPrice, inAreaBand } from '@core';
import { ComplexMap } from '@/components/complex-map';
import { Icon } from '@/components/icon';
import { Button, Chip, T, Tag, openComplex } from '@/components/ui';
import { repo } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

export default function MapScreen() {
  const { filter, favorites, toggleFavorite } = useStore();
  const [selectedId, setSelectedId] = useState<string>();
  const { data = [] } = useAsync(() => repo.complexesInRegion(filter.sigunguCode, 100), [filter.sigunguCode]);
  const complexes = data.filter((c) => !c.latest || inAreaBand(c.latest.area, filter.areaBand));
  const selected = complexes.find((c) => c.id === selectedId) ?? complexes[0];
  const region = findRegion(filter.sigunguCode);
  const d = selected?.latest ? delta(selected.latest.price, selected.latest.prevPrice) : null;
  const fav = selected ? favorites.includes(selected.id) : false;

  return (
    <View style={{ flex: 1, backgroundColor: '#EEF1F4' }}>
      <ComplexMap complexes={complexes} selectedId={selected?.id} onSelect={setSelectedId} />

      <SafeAreaView edges={['top']} style={s.top} pointerEvents="box-none">
        <Pressable onPress={() => router.navigate('/search')} style={s.search}>
          <Icon name="search" size={20} color={C.ter} />
          <T color={C.ter} style={{ flex: 1 }}>
            지역, 단지명 검색
          </T>
          <Pressable hitSlop={8} onPress={() => router.push('/filter')}>
            <Icon name="filter" size={20} />
          </Pressable>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Chip label={`${filter.sido} · ${region?.name ?? ''}`} active onPress={() => router.push('/filter')} style={s.shadow} />
          <Chip label="매매" style={s.shadow} />
          <Chip label={AREA_BANDS.find((b) => b.value === filter.areaBand)?.label === '전체' ? '전체 면적' : AREA_BANDS.find((b) => b.value === filter.areaBand)!.label} onPress={() => router.push('/filter')} style={s.shadow} />
          <Chip label="최근 3개월" style={s.shadow} />
        </ScrollView>
      </SafeAreaView>

      <View style={s.sheet}>
        <View style={s.grabber} />
        {selected ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <T size={20} w="700">
                  {selected.name}
                </T>
                <T size={13} color={C.sub} style={{ marginTop: 4 }}>
                  {[`${selected.sigungu} ${selected.dong}`, selected.households && `${formatCount(selected.households)}세대`, selected.buildYear && `${selected.buildYear}년 준공`]
                    .filter(Boolean)
                    .join(' · ')}
                </T>
              </View>
              <Pressable hitSlop={8} onPress={() => toggleFavorite(selected.id)}>
                <Icon name="heart" color={fav ? C.up : C.ink} filled={fav} />
              </Pressable>
            </View>
            {selected.latest && d && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <T size={26} w="700">
                    {formatPrice(selected.latest.price)}
                  </T>
                  <Tag text={d.pct ? `${d.text} (${d.pct})` : d.text} dir={d.dir} />
                </View>
                <T size={13} color={C.ter} style={{ marginTop: 4 }}>
                  {formatArea(selected.latest.area)} · {selected.latest.floor ?? '-'}층 · {formatDate(selected.latest.dealDate)} 계약
                </T>
              </>
            )}
            <Button label="단지 상세 보기" onPress={() => openComplex(selected.id)} style={{ marginTop: 14 }} />
          </>
        ) : (
          <T color={C.ter} style={{ textAlign: 'center', paddingVertical: 24 }}>
            이 지역에 표시할 단지가 없어요
          </T>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: C.bg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  shadow: { boxShadow: '0 1px 6px rgba(0,0,0,0.1)', borderColor: 'transparent' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
  },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: C.line },
});
