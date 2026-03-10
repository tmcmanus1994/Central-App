import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { HeartHandshake } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { formatPrayerDate } from '../../lib/utils';
import type { PrayerRequest } from '../../types/database';

interface PrayerCardProps {
  prayer: PrayerRequest;
  hasPrayed: boolean;
  onPray: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: '#EF4444',
  Church: '#C8973A',
  Family: '#8B5CF6',
  Community: '#3B82F6',
  Outreach: '#10B981',
};

export function PrayerCard({ prayer, hasPrayed, onPray }: PrayerCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const categoryColor = CATEGORY_COLORS[prayer.category] ?? colors.gold;

  const handlePray = () => {
    if (hasPrayed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPray(prayer.id);
  };

  return (
    <View
      className="rounded-xl mb-3 overflow-hidden"
      style={{
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: prayer.is_pinned ? 3 : 1,
        borderLeftColor: prayer.is_pinned ? colors.gold : colors.border,
      }}
    >
      <View className="p-4">
        {/* Header row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.text.primary }}>
              {prayer.display_name}
            </Text>
            {prayer.is_pinned && (
              <View
                className="px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: colors.bg.elevated }}
              >
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: colors.gold }}>
                  PINNED
                </Text>
              </View>
            )}
          </View>

          {/* Category badge */}
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${categoryColor}18` }}
          >
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: categoryColor }}>
              {prayer.category}
            </Text>
          </View>
        </View>

        {/* Prayer body */}
        <Text
          style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 14,
            color: colors.text.secondary,
            lineHeight: 22,
            marginBottom: 12,
          }}
        >
          {prayer.body}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.text.secondary }}>
            {formatPrayerDate(prayer.created_at)}
          </Text>

          <TouchableOpacity
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: hasPrayed ? `${colors.gold}18` : colors.bg.elevated,
              borderWidth: 1,
              borderColor: hasPrayed ? colors.gold : colors.border,
            }}
            onPress={handlePray}
            disabled={hasPrayed}
            hitSlop={8}
          >
            <HeartHandshake
              size={14}
              color={hasPrayed ? colors.gold : colors.text.secondary}
            />
            <Text
              style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 12,
                color: hasPrayed ? colors.gold : colors.text.secondary,
              }}
            >
              {hasPrayed ? 'Prayed' : 'I Prayed'} · {prayer.prayed_count}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
