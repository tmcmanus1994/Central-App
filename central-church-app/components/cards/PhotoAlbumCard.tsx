import { View, Text, TouchableOpacity, Image, Linking, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImageIcon } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { PhotoAlbum } from '../../types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2; // 16px margins + 12px gap
const COVER_HEIGHT = Math.round(CARD_WIDTH * (3 / 4)); // 4:3 ratio

interface PhotoAlbumCardProps {
  album: PhotoAlbum;
}

export function PhotoAlbumCard({ album }: PhotoAlbumCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (!album.google_photos_url) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(album.google_photos_url);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={album.google_photos_url ? 0.75 : 1}
      style={{
        width: CARD_WIDTH,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Cover image */}
      {album.header_photo_url ? (
        <Image
          source={{ uri: album.header_photo_url }}
          style={{ width: CARD_WIDTH, height: COVER_HEIGHT }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: CARD_WIDTH,
            height: COVER_HEIGHT,
            backgroundColor: colors.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImageIcon size={32} color={colors.text.secondary} strokeWidth={1.5} />
        </View>
      )}

      {/* Info */}
      <View style={{ padding: 10 }}>
        {/* Category badge */}
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: colors.bg.elevated,
            marginBottom: 4,
          }}
        >
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: colors.text.secondary }}>
            {album.category}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.text.primary, lineHeight: 18 }}
        >
          {album.title}
        </Text>

        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.text.secondary, marginTop: 2 }}>
          {album.photo_count} photos
        </Text>
      </View>
    </TouchableOpacity>
  );
}
