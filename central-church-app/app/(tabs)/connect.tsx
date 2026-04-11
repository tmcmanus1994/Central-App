import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { useGroups } from '../../hooks/useGroups';
import { GroupCard } from '../../components/cards/GroupCard';
import type { CommunityGroup } from '../../types/database';

const CATEGORIES = ['All', 'Life Stage', 'Ministry', 'Recreation', 'Outreach'];

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeCategory, setActiveCategory] = useState('All');

  const { state, refresh } = useGroups();

  const filteredGroups = useMemo<CommunityGroup[]>(() => {
    if (state.status !== 'success') return [];
    if (activeCategory === 'All') return state.data;
    return state.data.filter(g => g.category === activeCategory);
  }, [state, activeCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.page }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 4 }}>
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 4 }}>
          Connect
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginBottom: 16 }}>
          Find your community and join a group.
        </Text>

        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setActiveCategory(category)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: activeCategory === category ? colors.gold : colors.bg.elevated,
                borderWidth: activeCategory === category ? 0 : 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontFamily: 'Poppins_500Medium',
                fontSize: 13,
                color: activeCategory === category ? '#FFFFFF' : colors.text.secondary,
              }}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading state */}
      {state.status === 'loading' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {/* Error state */}
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

      {/* Success state */}
      {state.status === 'success' && (
        <FlatList<CommunityGroup>
          data={filteredGroups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <GroupCard group={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          onRefresh={refresh}
          refreshing={state.status === 'loading'}
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
                No groups found
              </Text>
              <Text style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 15,
                color: colors.text.secondary,
                textAlign: 'center',
              }}>
                {activeCategory === 'All'
                  ? 'Groups will appear here once added.'
                  : `No ${activeCategory} groups yet.`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
