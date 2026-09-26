import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pctChange, regionsOf, type ComplexSummary, type Sido } from '@core';
import { Icon } from '@/components/icon';
import { Chip, Divider, Empty, SectionHeader, Segmented, T, Tag, openComplex } from '@/components/ui';
import { repo } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

function ComplexItem({ c, rank }: { c: ComplexSummary; rank?: number }) {
  const d = c.latest ? pctChange(c.latest.price, c.latest.prevPrice) : null;
  return (
    <Pressable onPress={() => openComplex(c.id)} style={({ pressed }) => [s.item, pressed && { backgroundColor: C.soft }]}>
      {rank != null && (
        <T size={17} w="700" color={C.primary} style={{ width: 16 }}>
          {rank}
        </T>
      )}
      <View style={{ flex: 1 }}>
        <T size={16} w="600" numberOfLines={1}>
          {c.name}
        </T>
        <T size={13} color={C.sub} style={{ marginTop: 3 }}>
          {c.sido} {c.sigungu} {c.dong}
        </T>
      </View>
      {d && d.dir !== 'new' && <Tag text={d.text} dir={d.dir} />}
    </Pressable>
  );
}

export default function Search() {
  const { recentSearches, addRecentSearch, removeRecentSearch, filter, setFilter } = useStore();
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [sido, setSido] = useState<Sido>('서울');
  const results = useAsync(() => repo.searchComplexes(q, 30), [q]);
  const popular = useAsync(() => repo.popularComplexes(5), []);

  const submit = (v: string) => {
    const k = v.trim();
    setText(k);
    setQ(k);
    if (k) addRecentSearch(k);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.bar}>
        <Icon name="search" size={18} color={C.ter} />
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={(e) => submit(e.nativeEvent.text)}
          placeholder="단지명, 지역 검색"
          placeholderTextColor={C.ter}
          returnKeyType="search"
          style={{ flex: 1, fontSize: 15, color: C.ink, padding: 0 }}
        />
        {text ? (
          <Pressable hitSlop={8} onPress={() => submit('')}>
            <Icon name="close" size={16} color={C.ter} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        {q ? (
          <>
            <SectionHeader title={`'${q}' 검색 결과`} sub={`${results.data?.length ?? 0}개 단지`} />
            {results.data?.map((c) => <ComplexItem key={c.id} c={c} />)}
            {results.data?.length === 0 && <Empty text="검색 결과가 없어요. 단지명이나 동 이름으로 검색해 보세요." />}
          </>
        ) : (
          <>
            <SectionHeader title="지역으로 찾기" />
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Segmented items={[{ value: '서울', label: '서울 25개 구' }, { value: '경기', label: '경기 시·군·구' }]} value={sido} onChange={setSido} />
            </View>
            <View style={s.wrap}>
              {regionsOf(sido).map((r) => (
                <Chip
                  key={r.code}
                  label={r.name}
                  active={r.code === filter.sigunguCode}
                  onPress={() => {
                    setFilter({ ...filter, sido: r.sido, sigunguCode: r.code });
                    router.navigate('/map');
                  }}
                />
              ))}
            </View>
            <Divider />
            {recentSearches.length > 0 && (
              <>
                <SectionHeader title="최근 검색" />
                <View style={s.wrap}>
                  {recentSearches.map((r) => (
                    <View key={r} style={s.recent}>
                      <Pressable onPress={() => submit(r)}>
                        <T size={14} w="500" color={C.sub}>
                          {r}
                        </T>
                      </Pressable>
                      <Pressable hitSlop={8} onPress={() => removeRecentSearch(r)}>
                        <Icon name="close" size={14} color={C.ter2} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}
            <SectionHeader title="지금 많이 찾는 단지" sub="최근 3개월 거래 많은 순" />
            {popular.data?.map((c, i) => <ComplexItem key={c.id} c={c} rank={i + 1} />)}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 8, marginBottom: 4, backgroundColor: C.soft, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingBottom: 20 },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.line, borderRadius: 100, paddingVertical: 7, paddingLeft: 14, paddingRight: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 11 },
});
