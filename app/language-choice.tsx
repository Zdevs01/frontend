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
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/assets/fonts/color";
import { Ionicons } from '@expo/vector-icons';

import { API_URL } from '@/components/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Émojis pour chaque langue (tu peux les personnaliser selon tes langues)
const languageEmojis = {
  'Ewondo': '🌍',
  'Duala': '🌊',
  'Bamiléké': '🏔️',
  'Fulfuldé': '🐂',
  'Bassa': '🌴',
  'ghomala': '🎶',
  'duala': '🌊',
  'Bamoun': '👑',
  'Français': '🇫🇷',
  'Anglais': '🇬🇧',
};

const LanguageChoice = () => {
  const router = useRouter();
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messageAnim = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([]).current;

  useEffect(() => {
    fetchLanguages();
    startInitialAnimations();
  }, []);

  const fetchLanguages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/languages`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setLanguages(response.data);
        // Initialiser les animations pour chaque carte
        cardAnimations.length = response.data.length;
        response.data.forEach((_, index) => {
          cardAnimations[index] = new Animated.Value(0);
        });
        startCardAnimations();
      }
    } catch (error) {
      console.error("Erreur API langues", error);
      Alert.alert(
        "Erreur de connexion", 
        "Impossible de charger les langues. Vérifie ta connexion.",
        [
          { text: "Réessayer", onPress: fetchLanguages },
          { text: "Annuler", style: "cancel" }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startInitialAnimations = () => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startCardAnimations = () => {
    const animations = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  };

  const showMessage = (message = "Cette langue arrive bientôt. Essaie une autre en attendant 🎯") => {
    Animated.sequence([
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(messageAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLanguageSelect = async (lang: any) => {
    if (isProcessing) return;

    if (!lang.video_intro) {
      showMessage();
      return;
    }

    try {
      setIsProcessing(true);
      setSelectedLanguage(lang.id);

      // Sauvegarder la langue choisie
      await AsyncStorage.setItem("selected_language", JSON.stringify(lang));
      await AsyncStorage.setItem("language_choice_completed", "true");

      // Animation de sélection
      Animated.timing(fadeIn, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Attendre un peu pour l'animation puis naviguer
      setTimeout(() => {
        router.push(`/welcome-video?id=${lang.id}&name=${encodeURIComponent(lang.nom)}&description=${encodeURIComponent(lang.description)}&videolink=${encodeURIComponent(lang.video_intro)}`);
      }, 500);

    } catch (error) {
      console.error("Erreur lors de la sélection de la langue:", error);
      Alert.alert("Erreur", "Une erreur s'est produite. Réessaie.");
      setIsProcessing(false);
      setSelectedLanguage(null);
    }
  };

  const getLanguageEmoji = (langName: string) => {
    const emoji = languageEmojis[langName];
    return emoji || '🗣️';
  };

  const renderLanguageCard = (lang: any, index: number) => {
    const isSelected = selectedLanguage === lang.id;
    const cardAnim = cardAnimations[index] || new Animated.Value(1);

    return (
      <Animated.View 
        key={lang.id} 
        style={[
          {
            opacity: cardAnim,
            transform: [
              { 
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })
              },
              { scale: cardAnim }
            ]
          }
        ]}
      >
        <Pressable
          onPress={() => handleLanguageSelect(lang)}
          disabled={isProcessing}
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
            isSelected && styles.cardSelected,
            !lang.video_intro && styles.cardDisabled
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>{getLanguageEmoji(lang.nom)}</Text>
            {lang.video_intro && (
              <View style={styles.availableBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
              </View>
            )}
          </View>
          
          <View style={styles.cardContent}>
            <Text style={[styles.name, !lang.video_intro && styles.nameDisabled]}>
              {lang.nom}
            </Text>
            <Text style={[styles.description, !lang.video_intro && styles.descriptionDisabled]}>
              {lang.description}
            </Text>
            
            {!lang.video_intro ? (
              <View style={styles.comingSoonContainer}>
                <Ionicons name="time" size={14} color="#bdc3c7" />
                <Text style={styles.coming}>Bientôt disponible</Text>
              </View>
            ) : (
              <View style={styles.availableContainer}>
                <Ionicons name="play-circle" size={16} color="#e74c3c" />
                <Text style={styles.available}>Commencer l'aventure</Text>
              </View>
            )}
          </View>

          {isSelected && isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#e74c3c" size="small" />
            </View>
          )}

          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={lang.video_intro ? "#e74c3c" : "#bdc3c7"} 
            style={styles.chevron}
          />
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F6FD" />
        <View style={styles.loadingContent}>
          <Image source={require("@/assets/images/logo.png")} style={styles.loadingLogo} />
          <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
          <Text style={styles.loadingText}>Chargement des langues...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FD" />
      
      <Animated.View style={[styles.headerContainer, {
        transform: [{ translateY: slideIn }],
        opacity: fadeIn,
      }]}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.welcome}>🎯 Choisis ta langue !</Text>
        <Text style={styles.intro}>
          Explore les richesses linguistiques du Cameroun. 
          Chaque langue raconte une histoire unique ! 🌟
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{languages.filter(l => l.video_intro).length}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{languages.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((lang, index) => renderLanguageCard(lang, index))}
        
        {languages.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="language" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Aucune langue trouvée</Text>
            <Pressable style={styles.retryButton} onPress={fetchLanguages}>
              <Text style={styles.retryText}>Réessayer</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Animated.View
        style={[
          styles.messageBox,
          { 
            opacity: messageAnim, 
            transform: [
              { 
                scale: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }
            ] 
          },
        ]}
      >
        <Ionicons name="information-circle" size={20} color="#fff" style={styles.messageIcon} />
        <Text style={styles.messageText}>
          Cette langue arrive bientôt. Essaie une autre en attendant 🎯
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LanguageChoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FD",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F3F6FD",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  loader: {
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 40,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  intro: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    paddingHorizontal: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#e74c3c",
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ecf0f1",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginBottom: 15,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "#f8f9fa",
  },
  cardSelected: {
    backgroundColor: "#fdf2f2",
    borderLeftColor: "#27ae60",
  },
  cardDisabled: {
    borderLeftColor: "#bdc3c7",
    opacity: 0.7,
  },
  cardHeader: {
    position: "relative",
    marginRight: 15,
  },
  emoji: {
    fontSize: 40,
  },
  availableBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  nameDisabled: {
    color: "#bdc3c7",
  },
  description: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 8,
    lineHeight: 20,
  },
  descriptionDisabled: {
    color: "#bdc3c7",
  },
  comingSoonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coming: {
    fontSize: 13,
    color: "#bdc3c7",
    marginLeft: 5,
    fontWeight: "500",
  },
  availableContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  available: {
    fontSize: 13,
    color: "#e74c3c",
    marginLeft: 5,
    fontWeight: "600",
  },
  processingOverlay: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  chevron: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#bdc3c7",
    marginVertical: 15,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  messageBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  messageIcon: {
    marginRight: 10,
  },
  messageText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
});