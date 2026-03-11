import { View, Text, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarX2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useEvents } from '../../hooks/useEvents';
import { EventCard } from '../../components/cards/EventCard';
import type { EventOccurrence } from '../../types/app';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const eventsState = useEvents();

  function handleEventPress(event: EventOccurrence) {
    if (event.event_type === 'info_cta') {
      // Type B: open detail sheet with description + CTA
      router.push(`/event/${event.id}`);
    } else if (event.event_type === 'signup' && event.cta_value) {
      // Type C: register button on card opens URL directly — no detail modal
      Linking.openURL(event.cta_value);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-[#FDFAF4] dark:bg-[#0D0B08]"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
      }}
    >
      {/* Header */}
      <View className="px-4 mb-6">
        <Text className="font-['Lora_600SemiBold'] text-4xl text-[#1A1611] dark:text-[#F5F0E8]">
          Events
        </Text>
      </View>

      {/* Loading */}
      {eventsState.status === 'loading' && (
        <View className="items-center py-16">
          <ActivityIndicator color={colors.gold} />
        </View>
      )}

      {/* Error */}
      {eventsState.status === 'error' && (
        <View className="mx-4 rounded-xl p-4 bg-white dark:bg-[#1A1611]"
          style={{ borderWidth: 1, borderColor: colors.border }}>
          <Text className="font-['Poppins_500Medium'] text-[14px] text-[#5A5248] dark:text-[#B0A898] text-center">
            Couldn't load events. Pull down to retry.
          </Text>
        </View>
      )}

      {/* Empty */}
      {eventsState.status === 'success' && eventsState.data.length === 0 && (
        <View className="items-center py-16 px-4">
          <CalendarX2 size={40} color={colors.text.secondary} />
          <Text className="font-['Lora_600SemiBold'] text-[20px] text-[#1A1611] dark:text-[#F5F0E8] mt-4 text-center">
            No upcoming events
          </Text>
          <Text className="font-['Poppins_400Regular'] text-[15px] text-[#5A5248] dark:text-[#B0A898] mt-2 text-center">
            Check back soon — new events are added regularly.
          </Text>
        </View>
      )}

      {/* Event list */}
      {eventsState.status === 'success' && eventsState.data.length > 0 && (
        <View>
          {eventsState.data.map((event) => (
            <EventCard
              key={`${event.id}-${event.occurrence_date.getTime()}`}
              event={event}
              onPress={handleEventPress}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
