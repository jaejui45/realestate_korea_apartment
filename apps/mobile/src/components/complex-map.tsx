import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { formatEok, type ComplexSummary } from '@core';
import { C } from '@/lib/theme';
import { T } from './ui';

interface Props {
  complexes: ComplexSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** 단지 가격 마커 지도 (iOS: Apple 지도, Android: Google 지도) */
export function ComplexMap({ complexes, selectedId, onSelect }: Props) {
  const ref = useRef<MapView>(null);
  const points = complexes.filter((c) => c.lat != null && c.lng != null);

  useEffect(() => {
    if (!points.length) return;
    ref.current?.fitToCoordinates(
      points.map((c) => ({ latitude: c.lat!, longitude: c.lng! })),
      { edgePadding: { top: 180, right: 60, bottom: 320, left: 60 }, animated: true },
    );
    // 지역이 바뀔 때만 화면을 다시 맞춤
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((c) => c.id).join()]);

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={{ latitude: 37.5, longitude: 127.05, latitudeDelta: 0.3, longitudeDelta: 0.3 }}
      showsPointsOfInterests={false}
      toolbarEnabled={false}>
      {points.map((c) => {
        const on = c.id === selectedId;
        return (
          <Marker key={c.id} coordinate={{ latitude: c.lat!, longitude: c.lng! }} onPress={() => onSelect(c.id)} zIndex={on ? 10 : 1} tracksViewChanges={false}>
            <View style={[s.marker, on && s.markerOn]}>
              <T size={14} w="700" color={on ? '#fff' : C.ink}>
                {c.latest ? formatEok(c.latest.price) : '-'}
              </T>
              <T size={11} w="500" color={on ? '#fff' : C.sub} numberOfLines={1}>
                {c.name}
              </T>
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const s = StyleSheet.create({
  marker: {
    alignItems: 'center',
    backgroundColor: C.bg,
    borderColor: C.line,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 120,
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
  },
  markerOn: { backgroundColor: C.primary, borderColor: C.primary },
});
