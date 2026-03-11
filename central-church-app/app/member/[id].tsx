import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Phone, Mail, Tag } from 'lucide-react-native';
import { format } from 'date-fns';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/database';

const ROLE_LABELS: Record<string, string> = {
  guest: 'Guest',
  member: 'Member',
  staff: 'Staff',
  elder: 'Elder',
};

export default function MemberCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      // Only fetch verified members — RLS enforces this at the DB level too
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('is_verified', true)
        .single();
      if (err || !data) {
        setError(true);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg.page }}>
      {/* Back button */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 44, height: 44, justifyContent: 'center' }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}
          >
            Member not found.{'\n'}Go back and try again.
          </Text>
        </View>
      )}

      {profile && !loading && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        >
          {/* Avatar + name */}
          <View className="items-center py-6">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.gold}22` }}
            >
              <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 36, color: colors.gold }}>
                {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text
              style={{ fontFamily: 'Lora_600SemiBold', fontSize: 26, color: colors.text.primary, textAlign: 'center' }}
            >
              {profile.full_name}
            </Text>
            <View
              className="mt-2 self-center rounded-full px-3 py-1"
              style={{ backgroundColor: `${colors.gold}22` }}
            >
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: colors.gold }}>
                {ROLE_LABELS[profile.role] ?? profile.role}
              </Text>
            </View>
            {profile.member_since ? (
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary, marginTop: 6 }}
              >
                Member since {format(new Date(profile.member_since), 'MMMM yyyy')}
              </Text>
            ) : null}
          </View>

          {/* Bio */}
          {profile.bio ? (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.primary, lineHeight: 24 }}
              >
                {profile.bio}
              </Text>
            </View>
          ) : null}

          {/* Ministry tags */}
          {profile.ministry_tags && profile.ministry_tags.length > 0 ? (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
            >
              <View className="flex-row items-center mb-3">
                <Tag size={14} color={colors.text.secondary} />
                <Text
                  style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: colors.text.secondary, marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  Ministries
                </Text>
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {profile.ministry_tags.map((tag) => (
                  <View
                    key={tag}
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: colors.bg.elevated }}
                  >
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.primary }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Contact */}
          {(profile.phone || profile.email) ? (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
            >
              <Text
                style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: colors.text.secondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Contact
              </Text>
              {profile.phone ? (
                <TouchableOpacity
                  className="flex-row items-center mb-3"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(`tel:${profile.phone}`);
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${colors.gold}22` }}
                  >
                    <Phone size={16} color={colors.gold} />
                  </View>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.gold }}>
                    {profile.phone}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {profile.email ? (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(`mailto:${profile.email}`);
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${colors.gold}22` }}
                  >
                    <Mail size={16} color={colors.gold} />
                  </View>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.gold }}>
                    {profile.email}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
