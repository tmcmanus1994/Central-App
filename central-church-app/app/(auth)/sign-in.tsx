import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setIsLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(tabs)');
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
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 6 }}>
            Welcome back
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.secondary }}>
            Sign in to your Central Church account
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
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoComplete="password"
            placeholder="••••••••"
          />

          {error && (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#EF4444' }}>
              {error}
            </Text>
          )}

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="self-end -mt-1">
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 13, color: colors.gold }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </Link>

          <View className="mt-2">
            <Button label="Sign In" onPress={handleSignIn} isLoading={isLoading} />
          </View>
        </View>

        <View className="flex-row justify-center items-center mt-8">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.gold }}>
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
