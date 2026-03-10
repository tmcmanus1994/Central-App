import { View, Text, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useHome } from '../../hooks/useHome';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { FeaturedEventCard } from '../../components/cards/FeaturedEventCard';
import { SermonCard } from '../../components/cards/SermonCard';
import { AnnouncementCard } from '../../components/cards/AnnouncementCard';

function SectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <Text
      style={{
        fontFamily: 'Lora_600SemiBold',
        fontSize: 20,
        color: colors.text.primary,
        marginBottom: 12,
        marginTop: 8,
      }}
    >
      {title}
    </Text>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { profile } = useAuth();
  const { state, refresh } = useHome();

  const isRefreshing = state.status === 'loading';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? null;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg.page }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.gold}
        />
      }
    >
      {/* Header */}
      <View className="mb-6">
        <Text
          style={{
            fontFamily: 'Lora_400Regular',
            fontSize: 15,
            color: colors.text.secondary,
            marginBottom: 2,
          }}
        >
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </Text>
        <Text
          style={{
            fontFamily: 'Lora_600SemiBold',
            fontSize: 32,
            color: colors.text.primary,
          }}
        >
          Central Church
        </Text>
      </View>

      {state.status === 'loading' && (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {state.status === 'error' && (
        <View className="items-center justify-center py-16">
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
            Couldn't load content.{'\n'}Pull down to try again.
          </Text>
        </View>
      )}

      {state.status === 'success' && (
        <>
          {/* Featured Event */}
          {state.data.featuredEvent && (
            <View className="mb-4">
              <SectionHeader title="This Week" />
              <FeaturedEventCard event={state.data.featuredEvent} />
            </View>
          )}

          {/* Latest Sermon */}
          {state.data.latestSermon && (
            <View className="mb-4">
              <SectionHeader title="Latest Message" />
              <SermonCard sermon={state.data.latestSermon} />
            </View>
          )}

          {/* Announcements */}
          {state.data.announcements.length > 0 && (
            <View className="mb-4">
              <SectionHeader title="Announcements" />
              {state.data.announcements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </View>
          )}

          {/* Empty state */}
          {!state.data.featuredEvent && !state.data.latestSermon && state.data.announcements.length === 0 && (
            <View className="items-center justify-center py-16">
              <Text style={{ fontFamily: 'Lora_400Regular', fontSize: 18, color: colors.text.secondary, textAlign: 'center' }}>
                Nothing posted yet.{'\n'}Check back soon.
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
