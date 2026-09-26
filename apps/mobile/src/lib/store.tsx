import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AreaBand, Sido } from '@core';

const FAV_KEY = 'pilseung:favorites';

export interface MapFilter {
  sido: Sido;
  sigunguCode: string;
  areaBand: AreaBand;
}

interface Store {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  filter: MapFilter;
  setFilter: (f: MapFilter) => void;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;
}

const Ctx = createContext<Store | null>(null);

/** 관심 단지(기기에 저장), 지도 필터, 최근 검색어 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filter, setFilter] = useState<MapFilter>({ sido: '서울', sigunguCode: '11710', areaBand: 'all' });
  const [recentSearches, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((v) => v && setFavorites(JSON.parse(v)));
  }, []);

  const value = useMemo<Store>(
    () => ({
      favorites,
      toggleFavorite: (id) =>
        setFavorites((cur) => {
          const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
          AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
          return next;
        }),
      filter,
      setFilter,
      recentSearches,
      addRecentSearch: (q) => setRecent((cur) => [q, ...cur.filter((x) => x !== q)].slice(0, 8)),
      removeRecentSearch: (q) => setRecent((cur) => cur.filter((x) => x !== q)),
    }),
    [favorites, filter, recentSearches],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider 가 필요합니다');
  return s;
}
