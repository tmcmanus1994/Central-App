import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { PrayerCategory } from '../../types/database';

const CATEGORIES: PrayerCategory[] = ['Health', 'Church', 'Family', 'Community', 'Outreach'];

export default function SubmitPrayerScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, profile } = useAuth();

  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('Church');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) {
      setError('Please describe your prayer request.');
      return;
    }
    if (body.trim().length < 10) {
      setError('Please provide a bit more detail.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const displayName = isAnonymous
      ? 'Anonymous'
      : profile?.full_name ?? 'Anonymous';

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const weekOf = monday.toISOString().split('T')[0];

    const { error: insertError } = await supabase.from('prayer_requests').insert({
      user_id: user?.id ?? null,
      display_name: displayName,
      body: body.trim(),
      category,
      is_anonymous: isAnonymous,
      status: 'pending',
      week_of: weekOf,
    });

    setIsLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <View
        className="flex-1 px-4 justify-center items-center"
        style={{ backgroundColor: colors.bg.page, paddingBottom: insets.bottom }}
      >
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 28, color: colors.text.primary, textAlign: 'center', marginBottom: 12 }}>
          Request Received
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
          Your prayer request has been submitted. It will appear on the board once approved by staff.
        </Text>
        <Button label="Done" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.bg.page }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 22, color: colors.text.primary }}>
          Prayer Request
        </Text>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <X size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Prayer body */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 13, color: colors.text.secondary, marginBottom: 6 }}>
            Your Request
          </Text>
          <View
            className="rounded-xl p-4 min-h-[140px]"
            style={{ backgroundColor: colors.bg.elevated, borderWidth: 1, borderColor: colors.border }}
          >
            <Input
              label=""
              value={body}
              onChangeText={setBody}
              placeholder="Share what's on your heart..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120, paddingTop: 0 }}
            />
          </View>
        </View>

        {/* Category picker */}
        <View className="mb-5">
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 13, color: colors.text.secondary, marginBottom: 10 }}>
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                className="px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: category === cat ? colors.gold : colors.bg.elevated,
                  borderWidth: 1,
                  borderColor: category === cat ? colors.gold : colors.border,
                }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(cat);
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 13,
                    color: category === cat ? '#fff' : colors.text.secondary,
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Anonymous toggle */}
        <View
          className="flex-row items-center justify-between rounded-xl px-4 py-4 mb-5"
          style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
        >
          <View className="flex-1 mr-4">
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.text.primary }}>
              Post Anonymously
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
              Your name will be hidden on the board
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={(val) => {
              Haptics.selectionAsync();
              setIsAnonymous(val);
            }}
            trackColor={{ false: colors.border, true: colors.gold }}
            thumbColor="#fff"
          />
        </View>

        {error && (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#EF4444', marginBottom: 12 }}>
            {error}
          </Text>
        )}

        <Button label="Submit Request" onPress={handleSubmit} isLoading={isLoading} />

        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary, textAlign: 'center', marginTop: 12, lineHeight: 18 }}>
          Requests are reviewed by staff before appearing on the board.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
