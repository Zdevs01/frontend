// Sage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  Image,
  Pressable,
  Animated,
  Vibration,
  LayoutRectangle,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { useFonts } from 'expo-font';
import { Audio } from 'expo-av';
import Nav from '@/components/Nav';
import Colors from '@/assets/fonts/color.js';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

export default function Sage() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationPos, setNotificationPos] = useState({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const anims = useRef([]).current;
  const themeRefs = useRef([]);

  const showLockedNotification = async (index: number) => {
    const ref = themeRefs.current[index];
    if (ref) {
      const handle = findNodeHandle(ref);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          setNotificationPos({ x: pageX + width / 2 - 140, y: pageY + height / 2 });
        });
      }
    }

    setNotificationVisible(true);
    Vibration.vibrate(200);

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/point.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.warn('🔇 Son non trouvé ou erreur de lecture');
    }

    setTimeout(() => setNotificationVisible(false), 3000);
  };

  const fetchProgress = async () => {
    try {
      let user = await AsyncStorage.getItem('user_data');
      if (!user) user = await AsyncStorage.getItem('user');
      if (!user) return;

      const userId = JSON.parse(user).id;
      const res = await axios.get(`${API_URL}/api/theme0/${userId}`);
      setProgress(res.data.avancer || 0);
    } catch (error) {
      console.error('Erreur progression :', error);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const themes = [
    {
      id: 0,
      title: 'Thème 0 : Vie sociale et familiale 👨‍👩‍👧',
      description: 'Découvrez les mots liés à la famille et à la vie en communauté.',
      route: '/theme0',
      unlocked: true,
    },
    {
      id: 1,
      title: 'Thème 1 : Faune et forêt 🌳🦁',
      description: 'Explorez la nature, les animaux et l’environnement forestier.',
      route: '/theme1',
      unlocked: progress >= 4,
    },
    {
      id: 2,
      title: 'Thème 2 : La cuisine 🍲👩🏾‍🍳',
      description: 'Apprenez le vocabulaire des aliments, ustensiles et plats locaux.',
      route: '/theme2',
      unlocked: progress >= 7,
    },
    {
      id: 3,
      title: 'Thème 3 : L’art vestimentaire 👗🧥',
      description: 'Maîtrisez les vêtements traditionnels et modernes du quotidien.',
      route: '/theme3',
      unlocked: progress >= 10,
    },
  ];

  if (anims.length === 0) {
    themes.forEach(() => anims.push(new Animated.Value(0)));
    Animated.stagger(
      200,
      anims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        })
      )
    ).start();
  }

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" color={Colors.logo} />;
  }

  return (
    <>
      <View style={{ zIndex: 100 }}>
        <Nav />
      </View>

      <ImageBackground
        source={require('@/assets/images/Font.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>📚 Sélectionnez un thème pour commencer</Text>
          <Text style={styles.subtitle}>Chaque thème contient plusieurs exercices interactifs</Text>

          <Animated.View style={[styles.themeGrid, { opacity: fadeAnim }]}>
            {themes.map((theme, index) => (
              <Animated.View
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    transform: [{ scale: anims[index] }],
                    opacity: anims[index],
                  },
                ]}
                ref={(ref) => (themeRefs.current[index] = ref)}
              >
                <View style={styles.themeContent}>
                  <Text style={styles.themeTitle}>{theme.title}</Text>
                  <Text style={styles.themeDesc}>{theme.description}</Text>
                </View>

                <Pressable
                  onPress={() => {
                    if (theme.unlocked) {
                      router.push(theme.route);
                    } else {
                      showLockedNotification(index);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.themeBtn,
                    { opacity: pressed ? 0.7 : 1 },
                    !theme.unlocked && styles.lockedBtn,
                  ]}
                >
                  {theme.unlocked ? (
                    <Text style={styles.themeBtnText}>🚀 Démarrer</Text>
                  ) : (
                    <Image
                      source={require('@/assets/images/cardenaas.png')}
                      style={styles.lockIcon}
                    />
                  )}
                </Pressable>

                {theme.unlocked && (
                  <Animated.Image
                    source={require('@/assets/images/mascotte.png')}
                    style={{
                      width: 40,
                      height: 40,
                      position: 'absolute',
                      top: -15,
                      right: -10,
                      transform: [
                        {
                          rotate: anims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['-6deg', '6deg'],
                          }),
                        },
                      ],
                    }}
                  />
                )}
              </Animated.View>
            ))}
          </Animated.View>

          {notificationVisible && (
            <View
              style={[
                styles.notification,
                {
                  position: 'absolute',
                  top: notificationPos.y,
                  left: notificationPos.x,
                },
              ]}
            >
              <Text style={styles.notificationText}>
                🔒 Thème verrouillé. Terminez les précédents pour le débloquer !
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 120, // ⬅️ Augmenté pour ne pas cacher le titre
    paddingBottom: 60,
    backgroundColor: Colors.black2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'SpaceMono-Regular',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.white2,
    fontWeight: '600',
    marginBottom: 30,
  },
  themeGrid: {
    width: '90%',
    flexDirection: 'column',
    gap: 20,
  },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  themeContent: { flex: 1, paddingRight: 10 },
  themeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.logo,
    marginBottom: 6,
  },
  themeDesc: { fontSize: 14, color: '#555' },
  themeBtn: {
    backgroundColor: Colors.vert2,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  lockedBtn: { backgroundColor: '#eee' },
  themeBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  lockIcon: {
    width: 24,
    height: 24,
    tintColor: '#999',
  },
  notification: {
    backgroundColor: '#f1c40f',
    padding: 12,
    borderRadius: 16,
    zIndex: 300,
    width: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  notificationText: {
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
});
