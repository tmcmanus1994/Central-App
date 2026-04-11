import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Megaphone } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { AnnouncementCard } from '../../components/cards/AnnouncementCard';
import type { Announcement } from '../../types/database';

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, refresh } = useAnnouncements();

  const isRefreshing = state.status === 'loading';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.page }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary }}>
          Announcements
        </Text>
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
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: colors.gold,
            }}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success state */}
      {state.status === 'success' && (
        <FlatList<Announcement>
          data={state.data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <AnnouncementCard announcement={item} />}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          onRefresh={refresh}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
              <Megaphone size={48} color={colors.text.secondary} strokeWidth={1.5} />
              <Text style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 17,
                color: colors.text.primary,
                marginTop: 16,
                marginBottom: 8,
              }}>
                Nothing posted yet
              </Text>
              <Text style={{
                fontFamily: 'Poppins_400Regular',
                fontSize: 15,
                color: colors.text.secondary,
                textAlign: 'center',
              }}>
                No announcements right now.{'\n'}Check back soon.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
