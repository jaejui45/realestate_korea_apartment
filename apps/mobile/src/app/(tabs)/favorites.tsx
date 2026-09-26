import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { delta, formatArea, formatPrice } from '@core';
import { Icon } from '@/components/icon';
import { Empty, T, openComplex } from '@/components/ui';
import { repo } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C, dirColor } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

export default function Favorites() {
  const { favorites, toggleFavorite } = useStore();
  const { data = [] } = useAsync(() => repo.complexSummaries(favorites), [favorites.join()]);
  const order = new Map(favorites.map((id, i) => [id, i]));
  const items = [...data].filter((c) => order.has(c.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <T size={22} w="700">
          관심 단지
        </T>
        <T size={13} color={C.sub} style={{ marginTop: 4 }}>
          이 기기에 저장돼요
        </T>
      </View>
      <ScrollView>
        {items.map((c) => {
          const d = c.latest ? delta(c.latest.price, c.latest.prevPrice) : null;
          return (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line }}>
              <Pressable style={{ flex: 1 }} onPress={() => openComplex(c.id)}>
                <T size={16} w="600" numberOfLines={1}>
                  {c.name}
                </T>
                <T size={13} color={C.sub} style={{ marginTop: 3 }}>
                  {c.sigungu} {c.dong}
                  {c.latest ? ` · ${formatArea(c.latest.area)}` : ''}
                </T>
              </Pressable>
              {c.latest && d && (
                <View style={{ alignItems: 'flex-end' }}>
                  <T size={16} w="700">
                    {formatPrice(c.latest.price)}
                  </T>
                  <T size={13} w="500" color={dirColor[d.dir]}>
                    {d.text}
                  </T>
                </View>
              )}
              <Pressable hitSlop={8} onPress={() => toggleFavorite(c.id)}>
                <Icon name="heart" color={C.up} filled />
              </Pressable>
            </View>
          );
        })}
        {favorites.length === 0 && <Empty text="단지 상세에서 ♡ 를 누르면 여기에 모여요" style={{ paddingVertical: 120 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}
