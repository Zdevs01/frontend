import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import Colors from "@/assets/fonts/color";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomePage() {
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const next = () => {
    router.push("/language-choice");
  };

  // Son d’intro
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sounds/game/intro.mp3") // Ton fichier MP3 dans /assets/sounds
    );
    await sound.playAsync();
  };

  useEffect(() => {
    playSound(); // Joue au montage
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.bounce,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeIn }]}>
        👋 Bienvenue sur
      </Animated.Text>

      <Animated.View
        style={{
          width: 200,
          height: 200,
          transform: [
            {
              scale: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 1],
              }),
            },
          ],
        }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.slogan, { opacity: fadeIn }]}>
        🌍 The future is in our origin
      </Animated.Text>

      <TouchableOpacity style={styles.button} onPress={next} activeOpacity={0.8}>
        <Text style={styles.buttonText}>🚀 Commencer</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gris2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.logo,
    marginBottom: 30,
    fontFamily: "SpaceMono-Regular",
    textAlign: "center",
  },
  slogan: {
    fontSize: 16,
    color: Colors.black,
    marginTop: 30,
    textAlign: "center",
    fontFamily: "SpaceMono-Regular",
  },
  button: {
    backgroundColor: Colors.black,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "SpaceMono-Regular",
  },
});
