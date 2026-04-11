import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Play, Pause, Mic, BookOpen } from 'lucide-react-native';
import { format } from 'date-fns';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import type { PodcastEpisode } from '../../types/database';

// Module-level singleton — only one episode plays at a time
let activeSound: Audio.Sound | null = null;
let activeSetPlaying: ((v: boolean) => void) | null = null;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface PodcastCardProps {
  episode: PodcastEpisode;
}

export function PodcastCard({ episode }: PodcastCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        if (activeSound === soundRef.current) {
          activeSound = null;
          activeSetPlaying = null;
        }
        soundRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Pause if currently playing
    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    // Stop any other active audio
    if (activeSound && activeSound !== soundRef.current) {
      await activeSound.stopAsync();
      activeSetPlaying?.(false);
    }

    // Resume existing loaded sound
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      activeSound = soundRef.current;
      activeSetPlaying = setIsPlaying;
      return;
    }

    // Load and play fresh
    setIsLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.audio_url },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      activeSound = sound;
      activeSetPlaying = setIsPlaying;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          soundRef.current = null;
          if (activeSound === sound) {
            activeSound = null;
            activeSetPlaying = null;
          }
        }
      });
    } catch {
      // Audio unavailable — silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className="rounded-xl p-4 mb-3"
      style={{ backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border }}
    >
      <View className="flex-row items-start">
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 10, color: colors.text.secondary, marginBottom: 2 }}>
            EP. {episode.episode_number}
          </Text>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.text.primary, marginBottom: 6 }}>
            {episode.title}
          </Text>

          <View style={{ gap: 3 }}>
            <View className="flex-row items-center gap-1.5">
              <Mic size={12} color={colors.text.secondary} />
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary }}>
                {episode.speaker}
              </Text>
            </View>
            {episode.scripture_reference && (
              <View className="flex-row items-center gap-1.5">
                <BookOpen size={12} color={colors.text.secondary} />
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: colors.text.secondary }}>
                  {episode.scripture_reference}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Play / Pause button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isPlaying ? (
            <Pause size={18} color="#fff" fill="#fff" />
          ) : (
            <Play size={18} color="#fff" fill="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View
        className="flex-row items-center justify-between mt-3 pt-2"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: colors.text.secondary }}>
          {format(new Date(episode.published_at), 'MMM d, yyyy')}
        </Text>
        <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 11, color: colors.text.secondary }}>
          {formatDuration(episode.duration_seconds)}
        </Text>
      </View>
    </View>
  );
}
