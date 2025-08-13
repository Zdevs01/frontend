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
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from "@/assets/fonts/color";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const langues = [
  { 
    label: 'Duala 🌊', 
    value: 'duala', 
    route: '/home2', 
    color: '#4A90E2', 
    icon: '🌊',
    description: 'La langue des rivières et des océans'
  },
  { 
    label: 'Ghomala 🎶', 
    value: 'ghomala', 
    route: '/home3', 
    color: '#F39C12', 
    icon: '🎶',
    description: 'Mélodies des hautes terres'
  },
  { 
    label: 'Bassa 🌿', 
    value: 'bassa', 
    route: '/home4', 
    color: '#27AE60', 
    icon: '🌿',
    description: 'L\'essence de la forêt tropicale'
  },
];

// 50+ messages de bienvenue dynamiques et intelligents
const welcomeMessages = [
  "Content de te revoir ! 🎉",
  "Heureux de te retrouver parmi nous ! 🌟",
  "Ton retour nous fait plaisir ! 😊",
  "Bienvenue de nouveau dans ta maison linguistique ! 🏡",
  "Prêt pour une nouvelle aventure ? 🚀",
  "Tes progrès t'attendent ! 📈",
  "Que la découverte continue ! 🔍",
  "Ton voyage linguistique reprend ! 🗺️",
  "Enchanté de te revoir ! ✨",
  "Ta curiosité nous inspire ! 🧠",
  "Bienvenue dans ton univers d'apprentissage ! 🌍",
  "Tes langues préférées t'ont manqué ! 💙",
  "Prêt à explorer de nouveaux horizons ? 🌅",
  "Ton retour illumine notre journée ! ☀️",
  "Continuons cette belle aventure ensemble ! 🤝",
  "Tes compétences linguistiques grandissent ! 🌱",
  "Bienvenue dans ton sanctuaire d'apprentissage ! 🏛️",
  "Ton dévouement nous impressionne ! 👏",
  "Prêt à découvrir de nouveaux trésors ? 💎",
  "Ta passion pour les langues nous motive ! 🔥",
  "Bienvenue dans ton laboratoire linguistique ! 🧪",
  "Tes efforts portent leurs fruits ! 🍎",
  "Ton parcours continue avec brio ! 🎯",
  "Bienvenue dans ton jardin de connaissances ! 🌺",
  "Prêt à relever de nouveaux défis ? 💪",
  "Ta détermination nous inspire ! 🎭",
  "Bienvenue dans ton théâtre linguistique ! 🎬",
  "Tes découvertes nous émerveillent ! 🎪",
  "Ton voyage reprend avec éclat ! ⭐",
  "Bienvenue dans ton musée des langues ! 🏛️",
  "Ta créativité linguistique s'épanouit ! 🎨",
  "Prêt à peindre de nouveaux mots ? 🖌️",
  "Ton retour apporte de la joie ! 🎊",
  "Bienvenue dans ton studio d'apprentissage ! 🎵",
  "Tes mélodies linguistiques résonnent ! 🎼",
  "Prêt à composer de nouvelles phrases ? 🎹",
  "Ta symphonie linguistique continue ! 🎺",
  "Bienvenue dans ton orchestre de mots ! 🎻",
  "Tes harmonies culturelles s'enrichissent ! 🎤",
  "Prêt à danser avec les langues ? 💃",
  "Ton ballet linguistique reprend ! 🩰",
  "Bienvenue dans ton carnaval des mots ! 🎭",
  "Ta fête linguistique recommence ! 🎈",
  "Prêt pour un nouveau spectacle ? 🎪",
  "Ton cirque linguistique t'attend ! 🤹",
  "Bienvenue dans ton royaume des langues ! 👑",
  "Ta couronne linguistique brille ! 💫",
  "Prêt à régner sur de nouveaux mots ? 🏰",
  "Ton empire linguistique s'étend ! 🗺️",
  "Bienvenue dans ton aventure royale ! 🚁",
];

// Messages motivants selon l'heure
const getTimeBasedMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour ! Un nouveau jour, de nouveaux mots à découvrir ! ☀️";
  if (hour < 17) return "Bon après-midi ! Parfait moment pour enrichir ton vocabulaire ! 🌤️";
  return "Bonsoir ! Les soirées sont parfaites pour apprendre ! 🌙";
};

const Choix = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [timeMessage, setTimeMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef(langues.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializePage();
    startAnimations();
    startPulseAnimation();
  }, []);

  const initializePage = async () => {
    try {
      // Récupérer les infos utilisateur
      const userData = await AsyncStorage.getItem("user");
      const selectedLang = await AsyncStorage.getItem("selected_language");
      
      if (userData) {
        setUser(JSON.parse(userData));
      }
      if (selectedLang) {
        setSelectedLanguage(JSON.parse(selectedLang));
      }

      // Générer messages dynamiques
      const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      setWelcomeMessage(randomWelcome);
      setTimeMessage(getTimeBasedMessage());
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animer les cartes une par une
      const cardStagger = cardAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: index * 200,
          useNativeDriver: true,
        })
      );
      Animated.stagger(200, cardStagger).start();
    });
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleLanguageSelect = async (langue) => {
    try {
      // Sauvegarder la langue sélectionnée
      await AsyncStorage.setItem("current_session_language", JSON.stringify(langue));
      
      // Animation de sélection
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.push(langue.route);
      });
    } catch (error) {
      console.error("Erreur lors de la sélection:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Préparation de ton espace...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e74c3c" />
      
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#e74c3c', '#c0392b']}
        style={styles.headerGradient}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          </Animated.View>
          
          <Text style={styles.welcomeBack}>
            {welcomeMessage}
          </Text>
          
          {user && (
            <Text style={styles.userName}>
              👋 Salut {user.name || user.username || 'Apprenant'} !
            </Text>
          )}
          
          <Text style={styles.timeMessage}>
            {timeMessage}
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Section motivation */}
          <View style={styles.motivationSection}>
            <Text style={styles.sectionTitle}>🎯 Choisis ta langue</Text>
            <Text style={styles.sectionSubtitle}>
              Chaque langue est une nouvelle aventure qui t'attend !
            </Text>
          </View>

          {/* Cartes des langues */}
          <View style={styles.languagesGrid}>
            {langues.map((langue, index) => {
              const cardAnim = cardAnimations[index];
              return (
                <Animated.View
                  key={langue.value}
                  style={[
                    {
                      opacity: cardAnim,
                      transform: [
                        { 
                          translateY: cardAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                          })
                        },
                        {
                          scale: cardAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Pressable
                    onPress={() => handleLanguageSelect(langue)}
                    style={({ pressed }) => [
                      styles.languageCard,
                      { borderLeftColor: langue.color },
                      pressed && styles.cardPressed
                    ]}
                  >
                    <LinearGradient
                      colors={[langue.color + '15', langue.color + '05']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: langue.color + '20' }]}>
                          <Text style={styles.cardIcon}>{langue.icon}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={langue.color} />
                      </View>
                      
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{langue.label}</Text>
                        <Text style={styles.cardDescription}>{langue.description}</Text>
                      </View>

                      <View style={[styles.cardFooter, { backgroundColor: langue.color + '10' }]}>
                        <Ionicons name="play-circle" size={18} color={langue.color} />
                        <Text style={[styles.continueText, { color: langue.color }]}>
                          Commencer l'aventure
                        </Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {/* Section progression */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>📊 Tes progrès</Text>
            <View style={styles.progressGrid}>
              <View style={styles.progressCard}>
                <Ionicons name="flame" size={24} color="#e74c3c" />
                <Text style={styles.progressNumber}>7</Text>
                <Text style={styles.progressLabel}>Jours de suite</Text>
              </View>
              <View style={styles.progressCard}>
                <Ionicons name="star" size={24} color="#f39c12" />
                <Text style={styles.progressNumber}>248</Text>
                <Text style={styles.progressLabel}>Points XP</Text>
              </View>
              <View style={styles.progressCard}>
                <Ionicons name="trophy" size={24} color="#27ae60" />
                <Text style={styles.progressNumber}>3</Text>
                <Text style={styles.progressLabel}>Badges</Text>
              </View>
            </View>
          </View>

          {/* Section encouragement */}
          <View style={styles.encouragementSection}>
            <Text style={styles.encouragementTitle}>💪 Motivation du jour</Text>
            <Text style={styles.encouragementText}>
              "Chaque mot appris est une fenêtre ouverte sur une nouvelle culture. 
              Continue, tu fais un travail formidable !"
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeBack: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  timeMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  mainContent: {
    padding: 20,
  },
  motivationSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  languagesGrid: {
    gap: 15,
    marginBottom: 30,
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderLeftWidth: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 2,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardBody: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: -5,
  },
  continueText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 25,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2c3e50',
    marginVertical: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
  },
  encouragementSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default Choix;