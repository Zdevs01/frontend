import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity, 
  ActivityIndicator, ScrollView, Animated, 
  Dimensions, SafeAreaView, RefreshControl
} from 'react-native';
import Colors from '@/assets/fonts/color.js';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nav from '@/components/nav2';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const { width, height } = Dimensions.get('window');

const Profil = () => {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalXP: 0,
    streakDays: 0,
    lessonsCompleted: 0,
    achievements: 0,
    currentLevel: 1,
    progressToNextLevel: 0.6
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bounceAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const sound = useRef(null);

  useEffect(() => {
    fetchUserData();
    startAnimations();
  }, []);

  const startAnimations = () => {
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
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: stats.progressToNextLevel,
        duration: 1500,
        useNativeDriver: false,
      }),
    ]).start();
  };

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

  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Récupération des stats depuis l'API
        const statsResponse = await fetch(`${API_URL}/api/profile/stats/${parsedUser.id}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(prev => ({
            ...prev,
            totalXP: statsData.crevettes || 0,
            streakDays: statsData.cauris || 0,
            // Calcul du niveau basé sur l'XP
            currentLevel: Math.floor((statsData.crevettes || 0) / 100) + 1,
            progressToNextLevel: ((statsData.crevettes || 0) % 100) / 100
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleEdit = async () => {
    await playSound();
    // Navigation vers l'édition du profil
  };

  const handleAchievements = async () => {
    await playSound();
    // Navigation vers les achievements
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.loadingGradient}
        >
          <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
            <Image 
              source={require('@/assets/images/loading.gif')} 
              style={styles.loadingGif}
            />
            <Text style={styles.loadingText}>Chargement du profil...</Text>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.headerGradient}
        >
          <Animated.View style={[
            styles.profileHeader,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Animated.View style={[
              styles.avatarContainer,
              { transform: [{ scale: bounceAnim }] }
            ]}>
              <Image 
                source={require('@/assets/images/user.png')} 
                style={styles.avatar}
              />
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEdit}
                activeOpacity={0.7}
              >
                <Icon name="edit" size={16} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
            
            <Text style={styles.username}>{user?.username || 'Chargement...'}</Text>
                       <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.memberSince}>
              Membre depuis {user?.date_inscription || 'récemment'}
            </Text>
            
            {/* Niveau et progression */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Niveau {stats.currentLevel}</Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(stats.progressToNextLevel * 100)}% vers le niveau suivant
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Statistiques principales */}
        <Animated.View style={[
          styles.statsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.statGradient}
              >
                <Icon name="local-fire-department" size={24} color="#fff" />
                <Text style={styles.statNumber}>{stats.streakDays}</Text>
                <Text style={styles.statLabel}>Série de jours</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.statGradient}
              >
                <Icon name="flash-on" size={24} color="#fff" />
                <Text style={styles.statNumber}>{stats.totalXP}</Text>
                <Text style={styles.statLabel}>XP Total</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#A8E6CF', '#7FCDCD']}
                style={styles.statGradient}
              >
                <Icon name="book" size={24} color="#fff" />
                <Text style={styles.statNumber}>{stats.lessonsCompleted}</Text>
                <Text style={styles.statLabel}>Leçons terminées</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFD93D', '#FF6B6B']}
                style={styles.statGradient}
              >
                <Icon name="emoji-events" size={24} color="#fff" />
                <Text style={styles.statNumber}>{stats.achievements}</Text>
                <Text style={styles.statLabel}>Succès</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Actions rapides */}
        <Animated.View style={[
          styles.actionsContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.actionGradient}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={styles.actionText}>Modifier le profil</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleAchievements}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              style={styles.actionGradient}
            >
              <Icon name="military-tech" size={20} color="#fff" />
              <Text style={styles.actionText}>Mes succès</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Activité récente */}
        <Animated.View style={[
          styles.activityContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Leçon terminée</Text>
                <Text style={styles.activitySubtitle}>Les salutations en Duala</Text>
                <Text style={styles.activityTime}>Il y a 2 heures</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="star" size={20} color="#FFD700" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Nouveau succès</Text>
                <Text style={styles.activitySubtitle}>Première série de 7 jours</Text>
                <Text style={styles.activityTime}>Hier</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="trending-up" size={20} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Niveau supérieur</Text>
                <Text style={styles.activitySubtitle}>Passage au niveau {stats.currentLevel}</Text>
                <Text style={styles.activityTime}>Il y a 3 jours</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      <Nav />
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
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingGif: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 20,
  },
  levelContainer: {
    width: '100%',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  statCard: {
    width: (width - 55) / 2,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: Colors.black,
    opacity: 0.7,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.black,
    opacity: 0.5,
  },
});

export default Profil;