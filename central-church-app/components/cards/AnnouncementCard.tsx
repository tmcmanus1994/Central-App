import { View, Text, TouchableOpacity, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Phone, ExternalLink } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { Announcement } from '../../types/database';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePhone = () => {
    if (!announcement.contact_phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${announcement.contact_phone}`);
  };

  const handleSignup = () => {
    if (!announcement.signup_url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(announcement.signup_url);
  };

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
    >
      {/* Audience badge */}
      <View
        className="self-start px-2 py-0.5 rounded-full mb-2"
        style={{ backgroundColor: colors.bg.elevated }}
      >
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.text.secondary }}>
          {announcement.audience_tag}
        </Text>
      </View>

      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.text.primary, marginBottom: 4 }}>
        {announcement.title}
      </Text>
      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}>
        {announcement.body}
      </Text>

      {/* CTAs */}
      {(announcement.contact_phone || announcement.signup_url) && (
        <View className="flex-row gap-3 mt-3">
          {announcement.contact_phone && (
            <TouchableOpacity
              className="flex-row items-center gap-1.5"
              onPress={handlePhone}
              hitSlop={8}
            >
              <Phone size={13} color={colors.gold} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.gold }}>
                {announcement.contact_name ?? 'Contact'}
              </Text>
            </TouchableOpacity>
          )}
          {announcement.signup_url && (
            <TouchableOpacity
              className="flex-row items-center gap-1.5"
              onPress={handleSignup}
              hitSlop={8}
            >
              <ExternalLink size={13} color={colors.gold} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.gold }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
