import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AREA_BANDS, regionsOf, type Sido } from '@core';
import { Button, Chip, Segmented, T } from '@/components/ui';
import { useStore } from '@/lib/store';
import { C } from '@/lib/theme';

/** 지도 필터 (바텀시트) */
export default function Filter() {
  const { filter, setFilter } = useStore();
  const [draft, setDraft] = useState(filter);
  const changeSido = (sido: Sido) => setDraft({ ...draft, sido, sigunguCode: regionsOf(sido)[0].code });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.head}>
        <T size={20} w="700">
          필터
        </T>
        <Pressable onPress={() => setDraft({ sido: '서울', sigunguCode: '11710', areaBand: 'all' })}>
          <T size={14} w="500" color={C.ter}>
            초기화
          </T>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <T w="700" style={s.label}>
          지역
        </T>
        <Segmented items={[{ value: '서울', label: '서울' }, { value: '경기', label: '경기' }]} value={draft.sido} onChange={changeSido} />
        <View style={s.wrap}>
          {regionsOf(draft.sido).map((r) => (
            <Chip key={r.code} label={r.name} primary active={r.code === draft.sigunguCode} onPress={() => setDraft({ ...draft, sigunguCode: r.code })} />
          ))}
        </View>
        <T w="700" style={s.label}>
          거래 유형
        </T>
        <View style={s.wrap}>
          <Chip label="매매" primary active />
          <Chip label="전세 (준비 중)" />
        </View>
        <T w="700" style={s.label}>
          전용면적
        </T>
        <View style={s.wrap}>
          {AREA_BANDS.map((b) => (
            <Chip key={b.value} label={b.label} primary active={b.value === draft.areaBand} onPress={() => setDraft({ ...draft, areaBand: b.value })} />
          ))}
        </View>
      </ScrollView>
      <View style={{ padding: 20, paddingBottom: 34 }}>
        <Button
          label="적용하기"
          onPress={() => {
            setFilter(draft);
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
  label: { marginTop: 20, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
});
