import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Bell } from 'lucide-react-native';
import {
  PUSH_CATEGORIES,
  savePushPreferences,
  type OneSignalSegment,
  ONESIGNAL_SEGMENTS,
} from '../lib/onesignal';
import { useColorScheme } from '../hooks/useColorScheme';
import { useAuthStore } from '../stores/authStore';
import { Colors } from '../constants/colors';

function CategoryRow({
  label,
  description,
  enabled,
  locked,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <TouchableOpacity
      onPress={locked ? undefined : onToggle}
      activeOpacity={locked ? 1 : 0.7}
      className="flex-row items-center py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
    >
      <View className="flex-1 mr-4">
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.text.primary }}>
          {label}
          {locked && <Text style={{ color: colors.text.accent }}> ✓</Text>}
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
          {description}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={locked ? undefined : onToggle}
        disabled={locked}
        trackColor={{ false: colors.border, true: colors.gold }}
        thumbColor="#FFFFFF"
      />
    </TouchableOpacity>
  );
}

export default function PushOptInScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, profile } = useAuthStore();

  const isStaff = profile?.role === 'staff' || profile?.role === 'elder';
  const visibleCategories = PUSH_CATEGORIES.filter((c) => !c.staffOnly || isStaff);

  // Pre-populate from saved preferences when re-visiting from Settings
  const savedSegments = profile?.push_categories as OneSignalSegment[] | null;
  const defaultSelected =
    savedSegments && savedSegments.length > 0
      ? savedSegments
      : visibleCategories.filter((c) => c.defaultOn).map((c) => c.segment);

  const [selected, setSelected] = useState<Set<OneSignalSegment>>(new Set(defaultSelected));
  const [isSaving, setIsSaving] = useState(false);

  function toggle(segment: OneSignalSegment) {
    Haptics.selectionAsync();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(segment)) next.delete(segment);
      else next.add(segment);
      return next;
    });
  }

  async function handleEnable() {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    await savePushPreferences(user.id, Array.from(selected) as OneSignalSegment[]);
    setIsSaving(false);
    router.replace('/(tabs)');
  }

  async function handleSkip() {
    if (!user) return;
    setIsSaving(true);
    // Save empty array so we don't prompt again
    await savePushPreferences(user.id, []);
    setIsSaving(false);
    router.replace('/(tabs)');
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg.page }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.bg.elevated }}
          >
            <Bell size={28} color={colors.gold} />
          </View>
          <Text
            style={{
              fontFamily: 'Lora_600SemiBold',
              fontSize: 28,
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Stay Connected
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 15,
              color: colors.text.secondary,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Choose which notifications you'd like to receive. You can always change this later in
            Settings.
          </Text>
        </View>

        {/* Category list */}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          {visibleCategories.map((cat) => (
            <CategoryRow
              key={cat.segment}
              label={cat.label}
              description={cat.description}
              enabled={selected.has(cat.segment) || cat.segment === ONESIGNAL_SEGMENTS.ALL_MEMBERS}
              locked={cat.segment === ONESIGNAL_SEGMENTS.ALL_MEMBERS}
              onToggle={() => toggle(cat.segment)}
            />
          ))}
        </View>

        {/* Actions */}
        <View className="mt-8 gap-3">
          <TouchableOpacity
            onPress={handleEnable}
            disabled={isSaving}
            className="rounded-xl items-center justify-center py-4"
            style={{ backgroundColor: colors.gold, minHeight: 52 }}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#FFFFFF' }}>
                Enable Notifications
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={isSaving}
            className="items-center py-3"
          >
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary }}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
