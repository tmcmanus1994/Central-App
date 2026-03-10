export const Typography = {
  display: {
    xl: { fontFamily: 'Lora_600SemiBold', fontSize: 40, lineHeight: 48 },
    lg: { fontFamily: 'Lora_600SemiBold', fontSize: 32, lineHeight: 40 },
    md: { fontFamily: 'Lora_400Regular', fontSize: 24, lineHeight: 32 },
  },
  body: {
    lg: { fontFamily: 'Poppins_400Regular', fontSize: 17, lineHeight: 26 },
    md: { fontFamily: 'Poppins_400Regular', fontSize: 15, lineHeight: 22 },
    sm: { fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 20 },
  },
  label: {
    lg: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, lineHeight: 20 },
    md: { fontFamily: 'Poppins_500Medium', fontSize: 12, lineHeight: 18 },
    sm: { fontFamily: 'Poppins_500Medium', fontSize: 10, lineHeight: 14 },
  },
} as const;
