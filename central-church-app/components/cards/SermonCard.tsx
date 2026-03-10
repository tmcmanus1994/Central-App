import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, BookOpen } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { Sermon } from '../../types/database';
import { format } from 'date-fns';

interface SermonCardProps {
  sermon: Sermon;
}

export function SermonCard({ sermon }: SermonCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/sermon/${sermon.id}`);
  };

  return (
    <TouchableOpacity
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View className="p-4">
        <View
          className="self-start px-2 py-0.5 rounded-full mb-3"
          style={{ backgroundColor: colors.bg.elevated }}
        >
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.gold }}>
            Latest Sermon
          </Text>
        </View>

        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 18, color: colors.text.primary, marginBottom: 4 }}>
          {sermon.title}
        </Text>

        {sermon.series_name && (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>
            {sermon.series_name}
          </Text>
        )}

        <View className="flex-row items-center gap-4">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
            {sermon.speaker}
          </Text>
          {sermon.scripture_reference && (
            <View className="flex-row items-center gap-1">
              <BookOpen size={12} color={colors.text.secondary} />
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
                {sermon.scripture_reference}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary }}>
          {format(new Date(sermon.sermon_date), 'MMMM d, yyyy')}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.gold }}
          >
            <Play size={10} color="#fff" fill="#fff" />
          </View>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.gold }}>
            Watch
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
