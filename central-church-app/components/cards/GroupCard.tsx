import { View, Text, TouchableOpacity, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Users } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { CommunityGroup } from '../../types/database';

interface GroupCardProps {
  group: CommunityGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleJoin = () => {
    if (!group.groupme_url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(group.groupme_url);
  };

  return (
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: group.is_featured ? colors.gold : colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Emoji */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: colors.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>{group.emoji ?? '🙌'}</Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.text.primary, flex: 1 }}>
              {group.name}
            </Text>
            {group.is_featured && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: `${colors.gold}22`,
                }}
              >
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: colors.gold }}>
                  FEATURED
                </Text>
              </View>
            )}
          </View>

          {/* Category badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: colors.bg.elevated,
              marginBottom: 6,
            }}
          >
            <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.text.secondary }}>
              {group.category}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary, lineHeight: 20 }}
          >
            {group.description}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Users size={13} color={colors.text.secondary} />
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary }}>
            {group.member_count} members
          </Text>
        </View>

        {group.groupme_url ? (
          <TouchableOpacity
            onPress={handleJoin}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: colors.gold,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF' }}>
              Join
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary }}>
            Coming soon
          </Text>
        )}
      </View>
    </View>
  );
}
