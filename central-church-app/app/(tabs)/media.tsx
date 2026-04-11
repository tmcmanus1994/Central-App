import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, Headphones, Images } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { useSermons } from '../../hooks/useSermons';
import { usePodcast } from '../../hooks/usePodcast';
import { usePhotoAlbums } from '../../hooks/usePhotoAlbums';
import { SermonCard } from '../../components/cards/SermonCard';
import { PodcastCard } from '../../components/cards/PodcastCard';
import { PhotoAlbumCard } from '../../components/cards/PhotoAlbumCard';
import type { Sermon, PodcastEpisode, PhotoAlbum } from '../../types/database';

type Tab = 'sermons' | 'podcast' | 'albums';

export default function MediaScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<Tab>('sermons');

  // Fetch all three eagerly so switching tabs is instant
  const { state: sermonsState, refresh: refreshSermons } = useSermons();
  const { state: podcastState, refresh: refreshPodcast } = usePodcast();
  const { state: albumsState, refresh: refreshAlbums } = usePhotoAlbums();

  const renderLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.gold} />
    </View>
  );

  const renderError = (message: string, onRetry: () => void) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <Text style={{
        fontFamily: 'Poppins_400Regular',
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 16,
      }}>
        {message}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.gold }}
      >
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSermonsContent = () => {
    if (sermonsState.status === 'loading') return renderLoading();
    if (sermonsState.status === 'error') return renderError(sermonsState.message, refreshSermons);
    return (
      <FlatList<Sermon>
        data={sermonsState.data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SermonCard sermon={item} showFeaturedBadge={false} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
        onRefresh={refreshSermons}
        refreshing={sermonsState.status === 'loading'}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
            <Video size={48} color={colors.text.secondary} strokeWidth={1.5} />
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 17,
              color: colors.text.primary,
              marginTop: 16,
              marginBottom: 8,
            }}>
              No sermons yet
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 15,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Check back after Sunday's service.
            </Text>
          </View>
        }
      />
    );
  };

  const renderPodcastContent = () => {
    if (podcastState.status === 'loading') return renderLoading();
    if (podcastState.status === 'error') return renderError(podcastState.message, refreshPodcast);
    return (
      <FlatList<PodcastEpisode>
        data={podcastState.data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PodcastCard episode={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
        onRefresh={refreshPodcast}
        refreshing={podcastState.status === 'loading'}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
            <Headphones size={48} color={colors.text.secondary} strokeWidth={1.5} />
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 17,
              color: colors.text.primary,
              marginTop: 16,
              marginBottom: 8,
            }}>
              No episodes yet
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 15,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Podcast episodes will appear here.
            </Text>
          </View>
        }
      />
    );
  };

  const renderAlbumsContent = () => {
    if (albumsState.status === 'loading') return renderLoading();
    if (albumsState.status === 'error') return renderError(albumsState.message, refreshAlbums);
    return (
      <FlatList<PhotoAlbum>
        data={albumsState.data}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item }) => <PhotoAlbumCard album={item} />}
        columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
        onRefresh={refreshAlbums}
        refreshing={albumsState.status === 'loading'}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
            <Images size={48} color={colors.text.secondary} strokeWidth={1.5} />
            <Text style={{
              fontFamily: 'Poppins_600SemiBold',
              fontSize: 17,
              color: colors.text.primary,
              marginTop: 16,
              marginBottom: 8,
            }}>
              No albums yet
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular',
              fontSize: 15,
              color: colors.text.secondary,
              textAlign: 'center',
            }}>
              Photo albums will appear here.
            </Text>
          </View>
        }
      />
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sermons', label: 'Sermons' },
    { key: 'podcast', label: 'Podcast' },
    { key: 'albums', label: 'Albums' },
  ];

  const renderContent = () => {
    if (activeTab === 'sermons') return renderSermonsContent();
    if (activeTab === 'podcast') return renderPodcastContent();
    return renderAlbumsContent();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.page }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ fontFamily: 'Lora_600SemiBold', fontSize: 32, color: colors.text.primary, marginBottom: 16 }}>
          Media
        </Text>

        {/* Segmented tab switcher */}
        <View
          style={{
            flexDirection: 'row',
            borderRadius: 12,
            padding: 4,
            backgroundColor: colors.bg.elevated,
          }}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: activeTab === tab.key ? colors.gold : 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontFamily: 'Poppins_600SemiBold',
                fontSize: 12,
                color: activeTab === tab.key ? '#FFFFFF' : colors.text.secondary,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}
