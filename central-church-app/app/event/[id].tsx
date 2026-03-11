import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Calendar from 'expo-calendar';
import { MapPin, Clock, ArrowLeft, Phone, Mail, ExternalLink, User } from 'lucide-react-native';
import { format } from 'date-fns';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../types/database';

const CATEGORY_COLORS: Record<string, string> = {
  Worship: '#C8973A',
  Ministry: '#7C6F5E',
  Teen: '#5A8FA8',
  Womens: '#A87C8F',
  Mens: '#5A7CA8',
  Recreation: '#5A9E6F',
  Outreach: '#9E7A5A',
  General: '#7C6F5E',
};

function formatTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (err || !data) {
        setError(true);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleAddToCalendar() {
    if (!event) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Calendar access is required to add this event.');
      return;
    }
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCal = calendars.find((c) => c.allowsModifications) ?? calendars[0];
    if (!defaultCal) return;
    await Calendar.createEventAsync(defaultCal.id, {
      title: event.title,
      location: event.location,
      startDate: new Date(event.starts_at),
      endDate: new Date(event.ends_at),
      notes: event.description ?? undefined,
    });
    Alert.alert('Added!', 'Event has been added to your calendar.');
  }

  function handleCTA() {
    if (!event) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (event.cta_type === 'signup_link' || event.cta_type === 'register_form') {
      if (event.cta_value) Linking.openURL(event.cta_value);
    } else if (event.cta_type === 'contact_person' && event.contact_phone) {
      Linking.openURL(`tel:${event.contact_phone}`);
    }
  }

  const categoryColor = event
    ? (CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.General)
    : colors.gold;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg.page }}>
      {/* Back button */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
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
            Couldn't load this event.{'\n'}Go back and try again.
          </Text>
        </View>
      )}

      {event && !loading && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        >
          {/* Category badge */}
          <View className="mb-3">
            <View
              className="self-start rounded-full px-3 py-1"
              style={{ backgroundColor: `${categoryColor}22` }}
            >
              <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 11, color: categoryColor }}>
                {event.category.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={{ fontFamily: 'Lora_600SemiBold', fontSize: 28, color: colors.text.primary, marginBottom: 16, lineHeight: 36 }}
          >
            {event.title}
          </Text>

          {/* Date & Time */}
          <View className="flex-row items-center mb-3">
            <Clock size={16} color={colors.text.secondary} />
            <View className="ml-2">
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.text.primary }}>
                {format(new Date(event.starts_at), 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: colors.text.secondary }}>
                {formatTimeRange(event.starts_at, event.ends_at)}
              </Text>
            </View>
          </View>

          {/* Location */}
          {event.location ? (
            <View className="flex-row items-center mb-4">
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.text.secondary, marginLeft: 8 }}>
                {event.location}
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

          {/* Description — Type B only */}
          {event.description ? (
            <Text
              style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: colors.text.primary, lineHeight: 24, marginBottom: 20 }}
            >
              {event.description}
            </Text>
          ) : null}

          {/* Contact card — shown when cta_type = contact_person */}
          {event.cta_type === 'contact_person' && (event.contact_name || event.contact_phone || event.contact_email) ? (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: colors.bg.elevated, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: colors.text.secondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Contact
              </Text>
              {event.contact_name ? (
                <View className="flex-row items-center mb-2">
                  <User size={15} color={colors.text.secondary} />
                  <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 14, color: colors.text.primary, marginLeft: 8 }}>
                    {event.contact_name}
                  </Text>
                </View>
              ) : null}
              {event.contact_phone ? (
                <TouchableOpacity
                  className="flex-row items-center mb-2"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(`tel:${event.contact_phone}`);
                  }}
                >
                  <Phone size={15} color={colors.gold} />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.gold, marginLeft: 8 }}>
                    {event.contact_phone}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {event.contact_email ? (
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Linking.openURL(`mailto:${event.contact_email}`);
                  }}
                >
                  <Mail size={15} color={colors.gold} />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: colors.gold, marginLeft: 8 }}>
                    {event.contact_email}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/* CTA Button — signup_link or register_form */}
          {(event.cta_type === 'signup_link' || event.cta_type === 'register_form') && event.cta_value ? (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 mb-3"
              style={{ backgroundColor: colors.gold }}
              onPress={handleCTA}
              activeOpacity={0.85}
            >
              <ExternalLink size={16} color="#fff" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#fff' }}>
                {event.cta_type === 'register_form' ? 'Register' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Add to Calendar — always shown */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
            style={{ borderWidth: 1.5, borderColor: colors.gold }}
            onPress={handleAddToCalendar}
            activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.gold }}>
              Add to Calendar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
