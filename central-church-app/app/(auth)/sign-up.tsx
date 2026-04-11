import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (authError) {
      setIsLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'guest',
        is_verified: false,
        push_categories: null,
      });
    }

    setIsLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <View
        className="flex-1 px-4 justify-center items-center"
        style={{ backgroundColor: colors.bg.page, paddingBottom: insets.bottom }}
      >
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 28, color: colors.text.primary, textAlign: 'center', marginBottom: 12 }}>
          Check your email
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary, textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
          We sent a confirmation link to {email.trim().toLowerCase()}. Click it to activate your account.
        </Text>
        <Button
          label="Back to Sign In"
          onPress={() => router.replace('/(auth)/sign-in')}
          variant="secondary"
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.bg.page }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 6 }}>
            Join Central Church
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary }}>
            Create your account to get started
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            placeholder="Travelle Johnson"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />

          {error && (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#EF4444' }}>
              {error}
            </Text>
          )}

          <View className="mt-2">
            <Button label="Create Account" onPress={handleSignUp} isLoading={isLoading} />
          </View>
        </View>

        <View className="flex-row justify-center items-center mt-8">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary }}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.gold }}>
                Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
