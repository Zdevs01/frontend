import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  ScrollView,
  Platform,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import ThemeComponent from "@/components/sage2";
import Colors from "@/assets/fonts/color.js";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export default function Ex1T0_2Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const tabsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d’apparition
    Animated.timing(tabsAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Animation de pulsation pour le badge "bassa"
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = async (route: string) => {
    setActiveTab(route);
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await playClickSound();
    setTimeout(() => {
      router.push(route);
    }, 200);
  };

  const playClickSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/click2.mp3")
    );
    await sound.playAsync();
  };

  const renderTab = (label, iconName, route, isLogo = false, badge = null) => {
    const isActive = route === "/sage2"; // ✅ "Leçons" est maintenant l'onglet actif
    const isPressed = activeTab === route;
    const scale = useRef(new Animated.Value(1)).current;
  
    const onPressIn = () => {
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: true,
      }).start();
    };
  
    const onPressOut = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }).start();
    };
  
    return (
      <Pressable
        key={route}
        onPress={() => handlePress(route)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.tab}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale }],
              shadowColor: isPressed ? Colors.logo : "transparent",
              shadowOpacity: isPressed ? 0.6 : 0,
              shadowRadius: isPressed ? 10 : 0,
              shadowOffset: { width: 0, height: 0 },
              elevation: isPressed ? 10 : 0,
            },
          ]}
        >
          {isLogo ? (
            <IconSymbol size={26} name="house.fill" color={isActive ? Colors.logo : Colors.gris3} />
          ) : (
            <Ionicons
              name={iconName}
              size={26}
              color={isActive ? Colors.logo : Colors.gris3}
            />
          )}
  
          {badge && (
            <Animated.View
              style={[
                styles.badge,
                route === "/exercises" && {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.badgeText}>{badge}</Text>
            </Animated.View>
          )}
  
          <Text style={[styles.tabText, isActive && styles.activeText]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };
  
  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.white }}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemeComponent max={5} />
      </ScrollView>

      <Animated.View
        style={[
          styles.tabWrapper,
          {
            opacity: tabsAnim,
            transform: [
              {
                translateY: tabsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.tabs}>
          {renderTab("Leçons", "book-outline", "/sage2")}
          {renderTab("Exercices", "trophy-outline", "/exercises", false, "bassa2")}
          {renderTab("Accueil", "", "/home4", true)}
          {renderTab("Communauté", "people-outline", "/top2")}
          {renderTab("Profil", "person-outline", "/profil2")}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  tabWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 8,
    backgroundColor: Platform.OS === "ios" ? "rgba(255,255,255,0.95)" : Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 15,
    zIndex: 10,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
  },
  tab: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 12,
    color: Colors.gris3,
    fontWeight: "500",
    marginTop: 2,
  },
  activeText: {
    color: Colors.logo,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -20,
    backgroundColor: "#f00",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
});
