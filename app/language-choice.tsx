import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import Colors from "@/assets/fonts/color";

import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const { width: screenWidth } = Dimensions.get("window");

const LanguageChoice = () => {
  const router = useRouter();
  const [languages, setLanguages] = useState([]);
  const messageAnim = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  axios.get(`${API_URL}/api/languages`)
    

      .then((res) => setLanguages(res.data))
      .catch((err) => console.error("Erreur API langues", err));

    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showMessage = () => {
    Animated.sequence([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (lang: any) => {
    if (lang.video_intro) {
      router.push(`/welcome-video?id=${lang.id}&name=${lang.nom}&description=${lang.description}&videolink=${lang.video_intro}`);
    } else {
      showMessage();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, {
        transform: [{ translateY: slideIn }],
        opacity: fadeIn,
      }]}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.welcome}>👋 Bienvenue !</Text>
        <Text style={styles.intro}>
          Choisissez une langue locale à explorer. L'apprentissage devient fun avec jeux, leçons et quiz ! 🚀
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {languages.map((lang, index) => (
          <Animated.View key={lang.id} style={{ opacity: fadeIn, transform: [{ scale: fadeIn }] }}>
            <Pressable
              onPress={() => handlePress(lang)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
              ]}
            >
              <Text style={styles.emoji}>🗣️</Text>
              <View style={styles.cardContent}>
                <Text style={styles.name}>{lang.nom}</Text>
                <Text style={styles.description}>{lang.description}</Text>
                {!lang.video_intro && (
                  <Text style={styles.coming}>🚧 Bientôt disponible</Text>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View
        style={[
          styles.messageBox,
          { opacity: messageAnim, transform: [{ scale: messageAnim }] },
        ]}
      >
        <Text style={styles.messageText}>
          Cette langue arrive bientôt. Essaie une autre en attendant 🎯
        </Text>
      </Animated.View>
    </View>
  );
};

export default LanguageChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FD",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    borderRadius: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.logo,
    marginBottom: 6,
  },
  intro: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  scroll: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    marginBottom: 14,
    borderRadius: 22,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    transitionDuration: "0.3s",
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: "#F0F4FF",
  },
  emoji: {
    fontSize: 36,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  coming: {
    fontSize: 12,
    color: "#BBB",
    marginTop: 4,
    fontStyle: "italic",
  },
  messageBox: {
    position: "absolute",
    bottom: 30,
    backgroundColor: Colors.logo,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignSelf: "center",
    elevation: 6,
  },
  messageText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
});
