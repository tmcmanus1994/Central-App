import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-[#FDFAF4] dark:bg-[#0D0B08]"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32 }}
    >
      <View className="px-4">
        <Text className="font-['Lora_600SemiBold'] text-4xl text-[#1A1611] dark:text-[#F5F0E8]">
          Prayer Board
        </Text>
      </View>
    </ScrollView>
  );
}
