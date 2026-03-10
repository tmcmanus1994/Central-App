import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PenLine } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { usePrayer } from '../../hooks/usePrayer';
import { Colors } from '../../constants/colors';
import { PrayerCard } from '../../components/cards/PrayerCard';

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { state, prayedIds, markPrayed, refresh } = usePrayer();

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/prayer/submit');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg.page }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={state.status === 'loading'}
            onRefresh={refresh}
            tintColor={colors.gold}
          />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary }}>
            Prayer Board
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
            This week's prayer requests
          </Text>
        </View>

        {/* Loading */}
        {state.status === 'loading' && (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.gold} />
          </View>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <View className="items-center justify-center py-16">
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
              Couldn't load prayers.{'\n'}Pull down to try again.
            </Text>
          </View>
        )}

        {/* Prayer list */}
        {state.status === 'success' && state.data.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text style={{ fontFamily: 'Lora_400Regular', fontSize: 18, color: colors.text.secondary, textAlign: 'center', lineHeight: 28 }}>
              No prayers this week yet.{'\n'}Be the first to share.
            </Text>
          </View>
        )}

        {state.status === 'success' && state.data.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            prayer={prayer}
            hasPrayed={prayedIds.has(prayer.id)}
            onPray={markPrayed}
          />
        ))}
      </ScrollView>

      {/* Floating submit button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 rounded-xl h-[52px]"
          style={{ backgroundColor: colors.gold }}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <PenLine size={16} color="#fff" />
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#fff' }}>
            Submit a Prayer Request
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
