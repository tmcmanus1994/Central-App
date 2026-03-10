import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  icon,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isDisabled = disabled || isLoading;

  const containerClass = [
    'flex-row items-center justify-center rounded-xl h-[52px] px-6',
    fullWidth ? 'w-full' : 'self-start',
    variant === 'primary' ? '' : '',
    variant === 'secondary' ? 'border' : '',
    variant === 'ghost' ? '' : '',
    isDisabled ? 'opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const bgStyle =
    variant === 'primary'
      ? { backgroundColor: colors.gold }
      : variant === 'secondary'
      ? { backgroundColor: 'transparent', borderColor: colors.gold }
      : { backgroundColor: 'transparent' };

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : colors.gold;

  return (
    <TouchableOpacity
      className={containerClass}
      style={bgStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            style={{ color: textColor, fontFamily: 'Poppins_600SemiBold', fontSize: 15 }}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
