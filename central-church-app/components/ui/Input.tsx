import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword = false, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const inputBorderColor = error ? '#EF4444' : colors.border;

  return (
    <View className="w-full gap-1.5">
      <Text
        style={{
          fontFamily: 'Poppins_500Medium',
          fontSize: 13,
          color: colors.text.secondary,
        }}
      >
        {label}
      </Text>

      <View
        className="flex-row items-center rounded-xl h-[52px] px-4"
        style={{
          backgroundColor: colors.bg.elevated,
          borderWidth: 1,
          borderColor: inputBorderColor,
        }}
      >
        <TextInput
          className="flex-1 text-[15px]"
          style={{
            fontFamily: 'Poppins_400Regular',
            color: colors.text.primary,
          }}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            {showPassword ? (
              <EyeOff size={18} color={colors.text.secondary} />
            ) : (
              <Eye size={18} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#EF4444' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
