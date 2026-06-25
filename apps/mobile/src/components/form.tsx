import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors } from "@/lib/theme";

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.text,
          backgroundColor: "#fff",
        }}
        {...props}
      />
    </View>
  );
}

export function Btn({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
}) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => ({
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1,
        backgroundColor: isPrimary ? colors.primary : "transparent",
        borderWidth: isPrimary ? 0 : 1,
        borderColor: colors.border,
      })}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : colors.primary} />
      ) : (
        <Text style={{ color: isPrimary ? "#fff" : colors.text, fontWeight: "700", fontSize: 16 }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
