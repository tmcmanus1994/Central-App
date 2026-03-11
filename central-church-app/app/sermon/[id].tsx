import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, BookOpen, Mic, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import type { Sermon } from '../../types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = Math.round(SCREEN_WIDTH * (9 / 16));

export default function SermonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('sermons')
        .select('*')
        .eq('id', id)
        .single();
      if (err || !data) {
        setError(true);
      } else {
        setSermon(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg.page }}>
      {/* Back button */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => {
            setPlaying(false);
            router.back();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ width: 44, height: 44, justifyContent: 'center' }}
        >
          <ArrowLeft size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {error && !loading && (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}
          >
            Couldn't load this sermon.{'\n'}Go back and try again.
          </Text>
        </View>
      )}

      {sermon && !loading && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          bounces={false}
        >
          {/* YouTube Player */}
          <View style={{ backgroundColor: '#000', width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}>
            <YoutubeIframe
              height={VIDEO_HEIGHT}
              width={SCREEN_WIDTH}
              videoId={sermon.youtube_video_id}
              play={playing}
              onChangeState={(state) => {
                if (state === 'playing') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            />
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            {/* Series badge */}
            {sermon.series_name ? (
              <View
                className="self-start rounded-full px-3 py-1 mb-3"
                style={{ backgroundColor: `${colors.gold}22` }}
              >
                <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 11, color: colors.gold }}>
                  {sermon.series_name.toUpperCase()}
                </Text>
              </View>
            ) : null}

            {/* Title */}
            <Text
              style={{ fontFamily: 'Lora_600SemiBold', fontSize: 26, color: colors.text.primary, lineHeight: 34, marginBottom: 16 }}
            >
              {sermon.title}
            </Text>

            {/* Meta */}
            <View className="mb-4" style={{ gap: 8 }}>
              <View className="flex-row items-center">
                <Mic size={15} color={colors.text.secondary} />
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginLeft: 8 }}>
                  {sermon.speaker}
                </Text>
              </View>

              {sermon.scripture_reference ? (
                <View className="flex-row items-center">
                  <BookOpen size={15} color={colors.text.secondary} />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginLeft: 8 }}>
                    {sermon.scripture_reference}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center">
                <Calendar size={15} color={colors.text.secondary} />
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginLeft: 8 }}>
                  {format(new Date(sermon.sermon_date), 'MMMM d, yyyy')}
                </Text>
              </View>
            </View>

            {/* Description */}
            {sermon.description ? (
              <>
                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
                <Text
                  style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.primary, lineHeight: 24 }}
                >
                  {sermon.description}
                </Text>
              </>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
