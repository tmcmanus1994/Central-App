import { View, Text, Pressable } from 'react-native';
import { MapPin, Clock, ChevronRight, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { formatEventDate } from '../../lib/utils';
import type { EventOccurrence } from '../../types/app';

interface Props {
  event: EventOccurrence;
  onPress?: (event: EventOccurrence) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Worship: '#C8973A',
  Ministry: '#7C6F5E',
  Teen: '#5A8FA8',
  Womens: '#A87C8F',
  Mens: '#5A7CA8',
  Recreation: '#5A9E6F',
  Outreach: '#9E7A5A',
  General: '#7C6F5E',
};

function formatTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function EventCard({ event, onPress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const isInteractive = event.event_type === 'info_cta';
  const isSignup = event.event_type === 'signup';
  const categoryColor = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.General;

  function handlePress() {
    if (!isInteractive && !isSignup) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInteractive && !isSignup}
      className="bg-white dark:bg-[#1A1611] rounded-xl p-4 mb-3 mx-4"
      style={{ borderWidth: 1, borderColor: colors.border }}
    >
      {/* Category badge + chevron row */}
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="rounded-full px-3 py-0.5"
          style={{ backgroundColor: `${categoryColor}22` }}
        >
          <Text
            className="font-['Poppins_500Medium'] text-[10px]"
            style={{ color: categoryColor }}
          >
            {event.category.toUpperCase()}
          </Text>
        </View>
        {isInteractive && (
          <ChevronRight size={16} color={colors.text.secondary} />
        )}
        {isSignup && (
          <ExternalLink size={14} color={colors.gold} />
        )}
      </View>

      {/* Title */}
      <Text
        className="font-['Lora_600SemiBold'] text-[17px] text-[#1A1611] dark:text-[#F5F0E8] mb-2"
        numberOfLines={2}
      >
        {event.title}
      </Text>

      {/* Date + Time */}
      <View className="flex-row items-center mb-1.5">
        <Clock size={13} color={colors.text.secondary} />
        <Text className="font-['Poppins_400Regular'] text-[13px] text-[#5A5248] dark:text-[#B0A898] ml-1.5">
          {formatEventDate(event.occurrence_date)} · {formatTimeRange(event.starts_at, event.ends_at)}
        </Text>
      </View>

      {/* Location */}
      {event.location ? (
        <View className="flex-row items-center">
          <MapPin size={13} color={colors.text.secondary} />
          <Text
            className="font-['Poppins_400Regular'] text-[13px] text-[#5A5248] dark:text-[#B0A898] ml-1.5"
            numberOfLines={1}
          >
            {event.location}
          </Text>
        </View>
      ) : null}

      {/* Signup CTA — Type C shows button on the card itself */}
      {isSignup && event.cta_value ? (
        <View
          className="mt-3 rounded-lg py-2.5 items-center"
          style={{ backgroundColor: colors.gold }}
        >
          <Text className="font-['Poppins_600SemiBold'] text-[13px] text-white">
            Register
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
