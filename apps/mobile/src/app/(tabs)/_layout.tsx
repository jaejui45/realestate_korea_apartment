import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components/icon';
import { C } from '@/lib/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: '홈', icon: 'home' },
  { name: 'map', title: '지도', icon: 'map' },
  { name: 'favorites', title: '관심', icon: 'heart' },
  { name: 'search', title: '검색', icon: 'search' },
  { name: 'my', title: 'MY', icon: 'user' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.ter2,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: C.line, backgroundColor: C.bg },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color }) => <Icon name={t.icon} color={color as string} /> }} />
      ))}
    </Tabs>
  );
}
