import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { User, Bell, Shield, LogOut, ChevronRight, Info } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuth } from '../../hooks/useAuth';
import { Colors, DANGER_COLOR } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { logoutOneSignalUser } from '../../lib/onesignal';

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, danger = false }: RowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      className="flex-row items-center py-3.5 px-4"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View className="w-8 items-center mr-3">{icon}</View>
      <Text
        style={{
          fontFamily: 'Poppins_400Regular',
          fontSize: 15,
          color: danger ? DANGER_COLOR : colors.text.primary,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {value ? (
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary, marginRight: 4 }}>
          {value}
        </Text>
      ) : null}
      {onPress && !danger ? (
        <ChevronRight size={16} color={colors.text.secondary} />
      ) : null}
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View
      className="rounded-xl overflow-hidden mb-4"
      style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
    >
      {children}
    </View>
  );
}

function Separator() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 52 }} />;
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { profile } = useAuth();

  async function handleSignOut() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          logoutOneSignalUser();
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  const roleLabel: Record<string, string> = {
    guest: 'Guest',
    member: 'Member',
    staff: 'Staff',
    elder: 'Elder',
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg.page }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View className="mb-6">
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary }}>
          More
        </Text>
      </View>

      {/* Profile card */}
      {profile && (
        <View
          className="rounded-xl p-4 mb-6 flex-row items-center"
          style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
        >
          <View
            className="w-14 h-14 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${colors.gold}22` }}
          >
            <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 22, color: colors.gold }}>
              {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View className="flex-1">
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.text.primary }}>
              {profile.full_name}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
              {profile.email}
            </Text>
            <View
              className="self-start mt-1.5 rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${colors.gold}22` }}
            >
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.gold }}>
                {roleLabel[profile.role] ?? profile.role}
                {profile.is_verified ? ' · Verified' : ''}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Account section */}
      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
        Account
      </Text>
      <SectionCard>
        <SettingsRow
          icon={<User size={18} color={colors.text.secondary} />}
          label="Edit Profile"
          value="Coming soon"
        />
        <Separator />
        <SettingsRow
          icon={<Bell size={18} color={colors.text.secondary} />}
          label="Notification Preferences"
          onPress={() => router.push('/push-opt-in')}
        />
      </SectionCard>

      {/* App section */}
      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 }}>
        App
      </Text>
      <SectionCard>
        <SettingsRow
          icon={<Shield size={18} color={colors.text.secondary} />}
          label="Privacy Policy"
          value="Coming soon"
        />
        <Separator />
        <SettingsRow
          icon={<Info size={18} color={colors.text.secondary} />}
          label="Version"
          value="1.0.0"
        />
      </SectionCard>

      {/* Sign out */}
      <SectionCard>
        <SettingsRow
          icon={<LogOut size={18} color={DANGER_COLOR} />}
          label="Sign Out"
          onPress={handleSignOut}
          danger
        />
      </SectionCard>
    </ScrollView>
  );
}
