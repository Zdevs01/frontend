import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
  Dimensions,
  Easing,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Colors from '@/assets/fonts/color';
import { useFonts } from 'expo-font';
import Nav from '@/components/Nav';
import { Audio } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet
const { width, height } = Dimensions.get('window');

export default function Classement() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [user, setUser] = useState(null);
  const [crevettes, setCrevettes] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const podiumAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const crownRotateAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (!parsedUser?.id) return;
        setUser(parsedUser);

        const responseStats = await axios.get(`${API_URL}/api/user/stats/${parsedUser.id}`);
        setCrevettes(responseStats.data.crevettes);

        const responseLB = await axios.get(`${API_URL}/api/user/top20-with-user/${parsedUser.id}`);
        setLeaderboard(responseLB.data);
      } catch (error) {
        console.error("Erreur récupération classement:", error);
      } finally {
        setLoading(false);
      }
    };

    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/level-win.mp3')
        );
        await sound.playAsync();
      } catch (e) {
        console.warn('Erreur audio :', e);
      }
    };

    playSound();
    fetchLeaderboard();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Animation d'entrée principale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
    ]).start();

    // Animations du podium en cascade
    Animated.stagger(200, [
      Animated.timing(podiumAnimations[1], {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(podiumAnimations[0], {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(podiumAnimations[2], {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();

    // Animation pulsante pour le leader
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
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

    // Rotation de la couronne
    Animated.loop(
      Animated.timing(crownRotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();

    // Scintillements
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getPodiumHeight = (rank) => {
    switch (rank) {
      case 1: return 140;
      case 2: return 110;
      case 3: return 90;
      default: return 70;
    }
  };

  const getPodiumColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
      default: return '#E0E0E0';
    }
  };

  const getBadgeEmoji = (rank) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const renderPodiumItem = (user, rank, index) => {
    const animatedStyle = {
      opacity: podiumAnimations[index],
      transform: [
        {
          translateY: podiumAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0],
          }),
        },
        {
          scale: rank === 1 ? pulseAnim : 1,
        },
      ],
    };

    return (
      <Animated.View key={user?.id || index} style={[styles.podiumItem, animatedStyle]}>
        <View style={styles.podiumHeader}>
          <Text style={styles.podiumRank}>#{rank}</Text>
          {rank === 1 && (
            <Animated.Text 
              style={[
                styles.crownEmoji,
                {
                  transform: [
                    {
                      rotate: crownRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              👑
            </Animated.Text>
          )}
        </View>
        
        <View style={styles.avatarContainer}>
          <Image 
            source={require('@/assets/images/user.png')} 
            style={[styles.podiumAvatar, rank === 1 && styles.goldAvatar]} 
          />
          {rank <= 3 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeEmoji}>{getBadgeEmoji(rank)}</Text>
            </View>
          )}
          
          {rank === 1 && (
            <Animated.View 
              style={[
                styles.sparkle,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      scale: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.sparkleText}>✨</Text>
            </Animated.View>
          )}
        </View>

        <Text numberOfLines={1} style={styles.podiumName}>
          {user?.username || '---'}
        </Text>

        <View
          style={[
            styles.podiumBar, 
            { 
              height: getPodiumHeight(rank),
              backgroundColor: getPodiumColor(rank)
            }
          ]}
        >
          <View style={styles.podiumXPContainer}>
            <Text style={styles.podiumXP}>
              {user?.crevettes || 0}
            </Text>
            <Text style={styles.podiumXPLabel}>XP</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderListItem = (user, index) => {
    const actualRank = index + 4;
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateX: slideAnim,
        },
      ],
    };

    return (
      <Animated.View key={user.id} style={[styles.listItem, animatedStyle]}>
        <View style={styles.listLeft}>
          <View style={styles.rankContainer}>
            <Text style={styles.listRank}>#{actualRank}</Text>
          </View>
          <Image source={require('@/assets/images/user.png')} style={styles.listAvatar} />
          <View style={styles.listUserInfo}>
            <Text numberOfLines={1} style={styles.listUsername}>
              {user.username || '---'}
            </Text>
            <Text style={styles.listXP}>{user.crevettes} XP</Text>
          </View>
        </View>
        
        <View style={styles.listRight}>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>🔥</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderUserCard = () => {
    const userRank = leaderboard.findIndex(u => u.id === user?.id) + 1;
    
    return (
      <Animated.View 
        style={[
          styles.userCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        
        <View style={styles.userCardContent}>
          <View style={styles.userCardHeader}>
            <Text style={styles.userCardTitle}>🎯 Ton Classement</Text>
          </View>
          
          <View style={styles.userCardBody}>
            <Image source={require('@/assets/images/user.png')} style={styles.userCardAvatar} />
            <View style={styles.userCardInfo}>
              <Text style={styles.userCardName}>{user?.username || 'Toi'}</Text>
              <View style={styles.userCardStats}>
                <Text style={styles.userCardRank}>#{userRank || '?'}</Text>
                <Text style={styles.userCardXP}>{crevettes} XP 🔥</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Relancer la récupération des données
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!parsedUser?.id) return;

      const responseStats = await axios.get(`${API_URL}/api/user/stats/${parsedUser.id}`);
      setCrevettes(responseStats.data.crevettes);

      const responseLB = await axios.get(`${API_URL}/api/user/top20-with-user/${parsedUser.id}`);
      setLeaderboard(responseLB.data);
    } catch (error) {
      console.error("Erreur refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.logo} />
        <Text style={styles.loadingText}>Chargement du classement...</Text>
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4a90e2" />
      <Nav />
       <Text >🎯 </Text>
         <Text >🎯 </Text>
         <Text >🎯 </Text>
          <Text >🎯 </Text>
         <Text >🎯 </Text>
         <Text >🎯 </Text>
      <View style={styles.headerGradient}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          
          <Text style={styles.headerTitle}>🏆 Classement</Text>
          <Text style={styles.headerSubtitle}>Champions des langues camerounaises</Text>
        </Animated.View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Podium Section */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumContainer}>
            {leaderboard.slice(0, 3).map((user, index) => 
              renderPodiumItem(user, index + 1, index)
            )}
          </View>
        </View>

        {/* User Card */}
        {renderUserCard()}

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? '⏳ Actualisation...' : '🔄 Actualiser'}
          </Text>
        </TouchableOpacity>

        {/* Leaderboard List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>🔥 Autres Champions</Text>
          {leaderboard.slice(3).map((user, index) => 
            renderListItem(user, index)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'SpaceMono-Regular',
  },
  headerGradient: {
    backgroundColor: '#4a90e2',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'SpaceMono-Regular',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 5,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  podiumSection: {
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    height: 220,
  },
  podiumItem: {
    alignItems: 'center',
    width: width * 0.28,
  },
  podiumHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  podiumRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  crownEmoji: {
    fontSize: 20,
    marginTop: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
  },
  goldAvatar: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  sparkle: {
    position: 'absolute',
    top: -10,
    left: -10,
  },
  sparkleText: {
    fontSize: 20,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  podiumBar: {
    borderRadius: 15,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  podiumXPContainer: {
    alignItems: 'center',
  },
  podiumXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  podiumXPLabel: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
  },
  userCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 20,
    backgroundColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  userCardContent: {
    padding: 20,
  },
  userCardHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
    marginRight: 15,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userCardRank: {
    fontSize: 14,
    color: '#e3f2fd',
    fontWeight: 'bold',
  },
  userCardXP: {
    fontSize: 14,
    color: '#e3f2fd',
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#4a90e2',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: Colors.logo,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  listRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.logo,
  },
  listAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginHorizontal: 10,
  },
  listUserInfo: {
    flex: 1,
  },
  listUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  listXP: {
    fontSize: 12,
    color: '#666',
  },
  listRight: {
    alignItems: 'center',
  },
  xpBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpBadgeText: {
    fontSize: 16,
  },
});