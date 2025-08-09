import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ScrollView, Share, Animated, LayoutAnimation,
  Platform, UIManager, SafeAreaView, Dimensions,
  StatusBar, Alert, Vibration,
} from 'react-native';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color.js';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { width, height } = Dimensions.get('window');

const langues = [
  { label: 'Duala 🌊', value: 'duala', route: '/home2', color: '#4A90E2', icon: '🌊' },
  { label: 'Ghomala 🎶', value: 'ghomala', route: '/home3', color: '#F39C12', icon: '🎶' },
  { label: 'Bassa 🌿', value: 'bassa', route: '/home4', color: '#27AE60', icon: '🌿' },
];

export default function Setting() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [selectedLangue, setSelectedLangue] = useState('duala');
  const [showLangues, setShowLangues] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const xpProgressAnim = useRef(new Animated.Value(0)).current;
  const [loadingLangue, setLoadingLangue] = useState(false);
  const sound = useRef<Audio.Sound | null>(null);

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de la barre XP
    setTimeout(() => {
      Animated.timing(xpProgressAnim, {
        toValue: 0.75, // 75% de progression
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 1000);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erreur utilisateur:", error);
      }
    };
    fetchUser();
  }, []);

  const playSound = async () => {
    try {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/click2.mp3')
      );
      sound.current = loadedSound;
      await sound.current.replayAsync();
    } catch (error) {
      console.error('Erreur son :', error);
    }
  };

  const animatePress = (callback: () => void) => {
    const scaleValue = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Vibration.vibrate(50);
    });
  };

  const handleLangueChange = async (langueValue: string) => {
    const selected = langues.find(l => l.value === langueValue);
    if (!selected) return;

    setShowLangues(false);
    setSelectedLangue(langueValue);
    setLoadingLangue(true);
    await playSound();

    // Animation de chargement plus sophistiquée
    setTimeout(() => {
      setLoadingLangue(false);
      router.replace(selected.route);
    }, 2500);
  };

  const getLangueLabel = (value: string) =>
    langues.find(lang => lang.value === value)?.label || 'Langue';

  const getLangueColor = (value: string) =>
    langues.find(lang => lang.value === value)?.color || '#4A90E2';

  const handleLogout = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/logout");
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: '🚀 Découvrez Mulema : l\'app révolutionnaire pour apprendre les langues du Cameroun ! 🇨🇲✨\n\nRejoignez des milliers d\'apprenants et reconnectez-vous à vos racines 🌍',
      });
      await playSound();
    } catch (error) {
      console.error('Erreur partage :', error);
    }
  };

  const toggleAbout = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    await playSound();
    setAboutVisible(!aboutVisible);
  };

  const toggleLangues = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    await playSound();
    setShowLangues(!showLangues);
  };

  if (!fontsLoaded) return (
    <View style={styles.loadingFontContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.loadingGradient}
      >
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <Image source={require('@/assets/images/loading.gif')} style={styles.loadingGif} />
          <Text style={styles.loadingLabel}>Chargement de Mulema...</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Personnalisez votre expérience</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFIL */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.profileGradient}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <Image source={require('@/assets/images/user.png')} style={styles.avatar} />
                <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.username}>{user?.username || 'Chargement...'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              
              {/* Niveau et XP */}
              <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Niveau 12 🏆</Text>
                <View style={styles.xpContainer}>
                  <View style={styles.xpBackground}>
                    <Animated.View 
                      style={[
                        styles.xpProgress,
                        {
                          width: xpProgressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.xpText}>2,450 / 3,000 XP</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.profileButton}
                //onPress={() => animatePress(() => router.push('/profile'))}
              >
                <Text style={styles.profileButtonText}>🎨 Personnaliser mon profil</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* STATS RAPIDES */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Jours de suite</Text>
            <Text style={styles.statEmoji}>🔥</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Mots appris</Text>
            <Text style={styles.statEmoji}>📚</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Précision</Text>
            <Text style={styles.statEmoji}>🎯</Text>
          </View>
        </Animated.View>

        {/* OPTIONS */}
        <Animated.View style={[styles.optionsContainer, { opacity: fadeAnim }]}>
          
          {/* LANGUE */}
          <TouchableOpacity 
            style={[styles.settingCard, { borderLeftColor: getLangueColor(selectedLangue) }]}
            onPress={() => animatePress(toggleLangues)}
          >
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: getLangueColor(selectedLangue) + '20' }]}>
                <Icon name="language" size={20} color={getLangueColor(selectedLangue)} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Langue d'apprentissage</Text>
                <Text style={styles.settingSubtitle}>Changez votre langue cible</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.langueActuelle}>{getLangueLabel(selectedLangue)}</Text>
              <Icon name={showLangues ? "chevron-up" : "chevron-down"} size={16} color="#666" />
            </View>
          </TouchableOpacity>

          {showLangues && (
            <Animated.View style={styles.langueList}>
              {langues.map((langue, index) => (
                <TouchableOpacity
                  key={langue.value}
                  onPress={() => animatePress(() => handleLangueChange(langue.value))}
                  style={[
                    styles.langueOption,
                    selectedLangue === langue.value && styles.langueOptionActive
                  ]}
                >
                  <View style={styles.langueOptionContent}>
                    <View style={[styles.langueIcon, { backgroundColor: langue.color + '20' }]}>
                      <Text style={styles.langueEmoji}>{langue.icon}</Text>
                    </View>
                    <Text style={[
                      styles.langueOptionText,
                      selectedLangue === langue.value && styles.langueOptionTextActive
                    ]}>
                      {langue.label}
                    </Text>
                  </View>
                  {selectedLangue === langue.value && (
                    <Icon name="check" size={16} color={langue.color} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* CHAT */}
          <TouchableOpacity 
            style={[styles.settingCard, { borderLeftColor: '#00BCD4' }]}
            onPress={() => animatePress(() => router.push("/chat"))}
          >
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#00BCD420' }]}>
                <Icon name="comments" size={20} color="#00BCD4" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Grand sage </Text>
                <Text style={styles.settingSubtitle}>Échangez avec notre IA pour mieux Apprendre</Text>
              </View>
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </TouchableOpacity>

          {/* PARTAGE */}
          <TouchableOpacity 
            style={[styles.settingCard, { borderLeftColor: '#FF9800' }]}
            onPress={() => animatePress(handleShare)}
          >
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#FF980020' }]}>
                <Icon name="share-alt" size={20} color="#FF9800" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Partager Mulema</Text>
                <Text style={styles.settingSubtitle}>Invitez vos amis à apprendre</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          {/* À PROPOS */}
          <TouchableOpacity 
            style={[styles.settingCard, { borderLeftColor: '#9C27B0' }]}
            onPress={() => animatePress(toggleAbout)}
          >
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#9C27B020' }]}>
                <Icon name="info-circle" size={20} color="#9C27B0" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>À propos de Mulema</Text>
                <Text style={styles.settingSubtitle}>Découvrez notre mission</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          {/* AIDE */}
          <TouchableOpacity 
            style={[styles.settingCard, { borderLeftColor: '#4CAF50' }]}
            onPress={() => animatePress(() => router.push("/aide"))}
          >
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#4CAF5020' }]}>
                <Icon name="question-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Centre d'aide</Text>
                <Text style={styles.settingSubtitle}>FAQ et support</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>
        </Animated.View>

        {/* DÉCONNEXION */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => animatePress(handleLogout)}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF5252']}
            style={styles.logoutGradient}
          >
            <Icon name="sign-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* PANNEAU À PROPOS */}
      {aboutVisible && (
        <Animated.View style={styles.bottomPanel}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.aboutGradient}
          >
            <View style={styles.aboutContent}>
              <Text style={styles.aboutTitle}>🇨🇲 Mulema</Text>
              <Text style={styles.aboutText}>
                Mulema est bien plus qu'une application d'apprentissage. C'est un pont entre les générations, 
                un moyen de préserver et de célébrer la richesse linguistique du Cameroun.
              </Text>
              <Text style={styles.aboutText}>
                Rejoignez notre communauté de passionnés et redécouvrez la beauté de nos langues ancestrales ! ✨
              </Text>
              <TouchableOpacity
                onPress={() => animatePress(toggleAbout)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* OVERLAY DE CHARGEMENT */}
      {loadingLangue && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
            style={styles.loadingOverlayGradient}
          >
            <Animated.View style={styles.loadingContent}>
              <Image
                source={require('@/assets/images/loading.gif')}
                style={styles.loadingGif}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Changement de langue...</Text>
              <Text style={styles.loadingSubtext}>Préparation de votre nouvelle aventure ! 🚀</Text>
            </Animated.View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // HEADER
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },

  // SCROLL
  scrollContainer: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // PROFIL
  profileCard: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileGradient: {
    padding: 25,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 20,
  },
  levelContainer: {
    width: '100%',
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // STATS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 5,
  },
  statEmoji: {
    fontSize: 20,
  },

  // OPTIONS
  optionsContainer: {
    marginBottom: 30,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langueActuelle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 10,
  },
  notificationBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // LISTE LANGUES
  langueList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  langueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  langueOptionActive: {
    backgroundColor: '#F8F9FA',
  },
  langueOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langueIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  langueEmoji: {
    fontSize: 16,
  },
  langueOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  langueOptionTextActive: {
    fontWeight: '600',
  },

  // DÉCONNEXION
  logoutButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // PANNEAU À PROPOS
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  aboutGradient: {
    padding: 25,
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  aboutText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
    opacity: 0.9,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // CHARGEMENT
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  loadingOverlayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingGif: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingSubtext: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  loadingLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },

  // CHARGEMENT INITIAL
  loadingFontContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});