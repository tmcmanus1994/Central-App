import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-[#FDFAF4] dark:bg-[#0D0B08] px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Text className="font-['Lora_600SemiBold'] text-3xl text-[#1A1611] dark:text-[#F5F0E8] mt-8">
        Event {id}
      </Text>
    </View>
  );
}
