import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.bg.page }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          className="flex-row items-center mb-10 self-start"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <ChevronLeft size={20} color={colors.gold} />
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 14, color: colors.gold, marginLeft: 2 }}>
            Back
          </Text>
        </TouchableOpacity>

        {sent ? (
          <View className="flex-1 justify-center">
            <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 28, color: colors.text.primary, marginBottom: 12 }}>
              Email sent
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary, lineHeight: 24, marginBottom: 32 }}>
              Check {email.trim().toLowerCase()} for a password reset link.
            </Text>
            <Button
              label="Back to Sign In"
              onPress={() => router.replace('/(auth)/sign-in')}
              variant="secondary"
            />
          </View>
        ) : (
          <>
            <View className="mb-10">
              <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 6 }}>
                Reset password
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary }}>
                Enter your email and we'll send you a reset link
              </Text>
            </View>

            <View className="gap-4">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="you@example.com"
              />

              {error && (
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#EF4444' }}>
                  {error}
                </Text>
              )}

              <View className="mt-2">
                <Button label="Send Reset Link" onPress={handleReset} isLoading={isLoading} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
