import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '@/lib/store';
import { C } from '@/lib/theme';

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="complex/[id]" />
        <Stack.Screen name="filter" options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.85], sheetCornerRadius: 24 }} />
      </Stack>
    </StoreProvider>
  );
}
