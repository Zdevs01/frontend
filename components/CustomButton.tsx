import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export function CustomButton({
  onPress,
  title,
  iconName,
  iconSize,
  iconColor,
  pressStyle,
  titleStyle,
  disabled,
}: {
  onPress: () => void;
  title: string;
  iconName: string;
  iconSize: number;
  iconColor: string;
  pressStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[
        {
          alignItems: "center",
        },
        pressStyle,
        {
          backgroundColor: disabled ? "#00000029" : "#000",
          borderWidth: disabled ? 0 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", gap: 20 }}>
        {title && <Text style={titleStyle}>{title}</Text>}
        {iconName && (
          <Ionicons name={iconName} size={iconSize} color={iconColor} />
        )}
      </View>
    </Pressable>
  );
}
