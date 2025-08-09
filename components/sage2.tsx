import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, ImageBackground, ActivityIndicator,
  Image, TouchableOpacity, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color.js';
import Nav from '@/components/Nav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet
export default function Sage2() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(false);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  const showNotification = async () => {
    setNotification(true);
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/point.mp3')
      );
      await sound.playAsync();
    } catch (err) {
      console.log("🔇 Son erreur :", err.message);
    }

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setNotification(false));
    }, 4000);
  };

  const fetchProgress = async () => {
    try {
      const user = await AsyncStorage.getItem('user_data');
      if (!user) return console.log("❌ Aucun utilisateur trouvé dans AsyncStorage");

      const userId = JSON.parse(user).id;
      console.log("📦 Utilisateur ID :", userId);

      const res = await axios.get(`${API_URL}/api/theme0/${userId}`);
      console.log("✅ Résultat progression :", res.data);

      setProgress(res.data.avancer || 0);
    } catch (error) {
      console.error('❌ Erreur progression:', error.message);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (!fontsLoaded || loading) {
    return <ActivityIndicator size="large" color={Colors.logo} />;
  }

  const lessons = [
    { title: 'Les 7 jours de la semaine', route: '/douala/lesson_play', unlocked: true },
    { title: 'Conjugaison du verbe avoir au présent', route: '/douala/lesson2', unlocked: true },
    { title: 'Être au présent', route: '/douala/lesson3', unlocked: progress >= 4 },
    { title: 'Chiffres de 1 à 9', route: '/douala/lesson4', unlocked: progress >= 4 },
    { title: 'Les couleurs', route: '/douala/lesson5', unlocked: progress >= 7 },
    { title: 'Pronoms personnels', route: '/douala/lesson6', unlocked: progress >= 7 },
  ];

  return (
    <>
      <View style={{ zIndex: 120, width: '100%' }}><Nav /></View>
      <ImageBackground source={require('@/assets/images/Font.png')} style={{ height: '100%', width: '100%' }} resizeMode="cover">
        <View style={{ alignItems: 'center', paddingTop: 46, paddingBottom: 80 }}>
          <Text style={styles.text}>Finissez chaque leçon pour débloquer la suivante !</Text>

          <View style={styles.sage}>
            <Image source={require('@/assets/images/sage.png')} style={styles.img} />
          </View>

          <View style={styles.escaliers}>
            {lessons.map((lesson, index) => (
              <Animated.View key={index} style={[styles.escalier, { width: `${65 + index * 10}%` }]}>
                <View style={styles.marche1}>
                  <Image source={require('@/assets/images/escalier.png')} style={styles.imgs} />
                </View>
                <TouchableOpacity
                  style={[
                    styles.marche2,
                    !lesson.unlocked && styles.locked
                  ]}
                  onPress={() => {
                    if (lesson.unlocked) {
                      router.push(lesson.route);
                    } else {
                      showNotification();
                    }
                  }}
                >
                  {lesson.unlocked ? (
                    <Text style={styles.textbtn}>{lesson.title}</Text>
                  ) : (
                    <Image source={require('@/assets/images/cardenaas.png')} style={styles.lockIcon} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ImageBackground>

      {notification && (
        <Animated.View style={[
          styles.notificationCentered,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }
        ]}>
          <Text style={styles.notificationText}>
            🔒 Cette leçon est verrouillée. Terminez d'abord les précédentes !
          </Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#111', fontWeight: '600', fontSize: 17,
    textAlign: 'center', marginBottom: 20
  },
  sage: {
    width: 160, height: 160, overflow: 'hidden', marginBottom: 10
  },
  img: { width: '100%', height: '100%' },
  escaliers: { width: '100%', alignItems: 'center', gap: 10 },
  escalier: {
    backgroundColor: Colors.vide, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5,
    borderRadius: 8, overflow: 'hidden'
  },
  marche1: { height: 17, alignItems: 'center', justifyContent: 'center' },
  marche2: {
    height: 50, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.logo, borderColor: '#000',
    borderWidth: 2, borderBottomWidth: 3, paddingHorizontal: 10,
    flexDirection: 'row', gap: 8
  },
  imgs: { width: '100%', height: '100%' },
  textbtn: { color: Colors.white, fontWeight: '600', textAlign: 'center' },
  locked: {
    backgroundColor: '#faebd7',
    borderColor: '#e06c75',
    shadowColor: '#e06c75',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  lockIcon: { width: 24, height: 24, tintColor: '#c0392b' },
  notificationCentered: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    right: '10%',
    backgroundColor: '#f1c40f',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },
  notificationText: {
    fontWeight: 'bold', color: '#2c3e50', textAlign: 'center',
  },
});
