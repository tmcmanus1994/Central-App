import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Calendar from 'expo-calendar';
import { MapPin, Clock, CalendarPlus } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { formatEventDate } from '../../lib/utils';
import type { Event } from '../../types/database';

interface FeaturedEventCardProps {
  event: Event;
}

export function FeaturedEventCard({ event }: FeaturedEventCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    if (event.event_type === 'general') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/event/${event.id}`);
  };

  const handleAddToCalendar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find((c) => c.allowsModifications) ?? calendars[0];
    if (!defaultCalendar) return;

    await Calendar.createEventAsync(defaultCalendar.id, {
      title: event.title,
      location: event.location,
      startDate: new Date(event.starts_at),
      endDate: new Date(event.ends_at),
      notes: event.description ?? undefined,
    });
  };

  const isInteractive = event.event_type !== 'general';

  return (
    <TouchableOpacity
      className="rounded-xl overflow-hidden mb-2"
      style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
      onPress={handlePress}
      activeOpacity={isInteractive ? 0.75 : 1}
    >
      {/* Gold accent header */}
      <View className="px-4 pt-4 pb-3" style={{ borderLeftWidth: 3, borderLeftColor: colors.gold }}>
        <View className="mb-1">
          <View
            className="self-start px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: colors.bg.elevated }}
          >
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.gold }}>
              Featured Event
            </Text>
          </View>
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 20, color: colors.text.primary }}>
            {event.title}
          </Text>
        </View>

        <View className="gap-1.5 mt-1">
          <View className="flex-row items-center gap-2">
            <Clock size={13} color={colors.text.secondary} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
              {formatEventDate(event.starts_at)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <MapPin size={13} color={colors.text.secondary} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
              {event.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={handleAddToCalendar}
          hitSlop={8}
        >
          <CalendarPlus size={14} color={colors.gold} />
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.gold }}>
            Add to Calendar
          </Text>
        </TouchableOpacity>

        {isInteractive && (
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 13, color: colors.text.secondary }}>
            {event.event_type === 'signup' ? 'Register →' : 'Details →'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
