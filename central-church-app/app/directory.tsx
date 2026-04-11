import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Search, Users } from 'lucide-react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/colors';
import { useMembers } from '../hooks/useMembers';
import { MemberCard } from '../components/cards/MemberCard';
import type { Profile } from '../types/database';

export default function DirectoryScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [query, setQuery] = useState('');

  const { state, refresh } = useMembers();

  const filteredMembers = useMemo<Profile[]>(() => {
    if (state.status !== 'success') return [];
    const q = query.trim().toLowerCase();
    if (!q) return state.data;
    return state.data.filter(p =>
      p.full_name?.toLowerCase().includes(q) ||
      p.ministry_tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [state, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.page }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 44, height: 44, justifyContent: 'center', marginBottom: 4 }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 16 }}>
          Directory
        </Text>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 10,
          }}
        >
          <Search size={16} color={colors.text.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or ministry…"
            placeholderTextColor={colors.text.secondary}
            style={{
              flex: 1,
              fontFamily: 'Poppins_400Regular',
              fontSize: 14,
              color: colors.text.primary,
              padding: 0,
            }}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Loading */}
      {state.status === 'loading' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Text style={{
            fontFamily: 'Poppins_400Regular',
            fontSize: 15,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {state.message}
          </Text>
          <TouchableOpacity
            onPress={refresh}
            style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.gold }}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success */}
      {state.status === 'success' && (
        <FlatList<Profile>
          data={filteredMembers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MemberCard profile={item} />}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 16,
          }}
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
          onRefresh={refresh}
          refreshing={state.status === 'loading'}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
              <Users size={48} color={colors.text.secondary} strokeWidth={1.5} />
              <Text style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 17,
                color: colors.text.primary,
                marginTop: 16,
                marginBottom: 8,
              }}>
                {query ? 'No results' : 'No members yet'}
              </Text>
              <Text style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 15,
                color: colors.text.secondary,
                textAlign: 'center',
              }}>
                {query
                  ? `No members match "${query}".`
                  : 'Verified members will appear here.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
