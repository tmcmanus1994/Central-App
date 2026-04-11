import { View, Text, TouchableOpacity, Alert, Linking, Platform, ActionSheetIOS } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Phone } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { Profile } from '../../types/database';

const ROLE_LABELS: Record<string, string> = {
  member: 'Member',
  staff: 'Staff',
  elder: 'Elder',
};

interface MemberCardProps {
  profile: Profile;
}

export function MemberCard({ profile }: MemberCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const options: { label: string; action: () => void }[] = [];
    if (profile.phone) {
      options.push({ label: `Call ${profile.full_name}`, action: () => Linking.openURL(`tel:${profile.phone}`) });
      options.push({ label: `Text ${profile.full_name}`, action: () => Linking.openURL(`sms:${profile.phone}`) });
    }
    if (profile.email) {
      options.push({ label: `Email ${profile.full_name}`, action: () => Linking.openURL(`mailto:${profile.email}`) });
    }

    if (options.length === 0) return; // no contact info — do nothing

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: profile.full_name,
          options: [...options.map(o => o.label), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (index) => {
          if (index < options.length) options[index].action();
        }
      );
    } else {
      Alert.alert(
        profile.full_name,
        undefined,
        [
          ...options.map(o => ({ text: o.label, onPress: o.action })),
          { text: 'Cancel', style: 'cancel' as const },
        ]
      );
    }
  };

  const visibleTags = profile.ministry_tags?.slice(0, 2) ?? [];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.bg.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${colors.gold}22`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 18, color: colors.gold }}>
          {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.text.primary }}>
            {profile.full_name}
          </Text>
          <View
            style={{
              paddingHorizontal: 7,
              paddingVertical: 1,
              borderRadius: 999,
              backgroundColor: `${colors.gold}22`,
            }}
          >
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: colors.gold }}>
              {ROLE_LABELS[profile.role] ?? profile.role}
            </Text>
          </View>
        </View>

        {visibleTags.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {visibleTags.map(tag => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: colors.bg.elevated,
                }}
              >
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: colors.text.secondary }}>
                  {tag}
                </Text>
              </View>
            ))}
            {(profile.ministry_tags?.length ?? 0) > 2 && (
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: colors.text.secondary, alignSelf: 'center' }}>
                +{(profile.ministry_tags?.length ?? 0) - 2} more
              </Text>
            )}
          </View>
        )}
      </View>

      {(profile.phone || profile.email) && (
        <Phone size={15} color={colors.text.secondary} />
      )}
    </TouchableOpacity>
  );
}
