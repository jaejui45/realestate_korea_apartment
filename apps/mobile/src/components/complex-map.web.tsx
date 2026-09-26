import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { formatEok, type ComplexSummary } from '@core';
import { C } from '@/lib/theme';
import { T } from './ui';

/** 웹 미리보기용: react-native-maps 는 웹을 지원하지 않아 목록으로 대신 보여줍니다. */
export function ComplexMap({ complexes, selectedId, onSelect }: { complexes: ComplexSummary[]; selectedId?: string; onSelect: (id: string) => void }) {
  return (
    <ScrollView style={[StyleSheet.absoluteFill, { backgroundColor: '#EEF1F4' }]} contentContainerStyle={{ paddingTop: 170, paddingBottom: 340, paddingHorizontal: 16, gap: 8 }}>
      <T size={12} color={C.ter}>
        지도는 iOS·Android 앱에서 표시됩니다
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {complexes.map((c) => {
          const on = c.id === selectedId;
          return (
            <Pressable key={c.id} onPress={() => onSelect(c.id)} style={[s.marker, on && { backgroundColor: C.primary }]}>
              <T size={14} w="700" color={on ? '#fff' : C.ink}>
                {c.latest ? formatEok(c.latest.price) : '-'}
              </T>
              <T size={11} color={on ? '#fff' : C.sub}>
                {c.name}
              </T>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  marker: { alignItems: 'center', backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
});
