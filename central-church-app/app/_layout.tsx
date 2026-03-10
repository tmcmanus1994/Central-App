import '../global.css';

import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Lora_400Regular, Lora_600SemiBold } from '@expo-google-fonts/lora';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useColorScheme } from '../hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Lora_400Regular,
    Lora_600SemiBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="prayer/submit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="member/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="sermon/[id]" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
