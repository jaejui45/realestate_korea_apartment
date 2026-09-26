import Constants from 'expo-constants';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider, T } from '@/components/ui';
import { usingSample } from '@/lib/repo';
import { useStore } from '@/lib/store';
import { C } from '@/lib/theme';

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
      <T color={C.sub}>{k}</T>
      <T w="500">{v}</T>
    </View>
  );
}

export default function My() {
  const { favorites } = useStore();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <T size={22} w="700">
            MY
          </T>
        </View>
        <Row k="관심 단지" v={`${favorites.length}개`} />
        <Row k="시세 알림" v="준비 중" />
        <Divider />
        <Row k="데이터" v={usingSample ? '샘플 데이터' : 'Supabase 연결됨'} />
        <Row k="대상 지역" v="서울특별시 · 경기도" />
        <Row k="앱 버전" v={Constants.expoConfig?.version ?? '-'} />
        <T size={12} color={C.ter} style={{ paddingHorizontal: 20, paddingTop: 16, lineHeight: 18 }}>
          실거래가 정보는 국토교통부 실거래가 공개시스템 자료를 기반으로 하며, 신고 시점과 계약 해제 여부에 따라 실제와 차이가 있을 수 있습니다.
          {usingSample ? '\n현재 샘플 데이터로 표시 중이며 가격과 단지 정보는 실제와 다릅니다.' : ''}
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}
