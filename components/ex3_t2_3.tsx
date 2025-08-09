// ✅ Ex3_T2_3.tsx – Sélection d’image immersive avec XP, Timer et Cauris (Téma 2 - Exercice 3)

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, TouchableOpacity, View, ActivityIndicator,
  Image, ScrollView, Animated, Dimensions, Platform, Modal
} from 'react-native';
import { useFonts } from 'expo-font';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Colors from '@/assets/fonts/color';
import NavTime from '@/components/navTime';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const screen = Dimensions.get('window');

const data = [
  {
    label: "Le feu",
    correctIndex: 0,
    audio: require('@/assets/sounds/bassa/th2/feu.wav'),
    images: [
      require('@/assets/images/th2/feu.jpg'),
      require('@/assets/images/th2/fourchette.jpg'),
      require('@/assets/images/th2/fourchette.jpg'),
      require('@/assets/images/th2/huile.jpg')
    ]
  },
  {
    label: "La fourchette",
    correctIndex: 1,
    audio: require('@/assets/sounds/bassa/th2/fourchette.wav'),
    images: [
      require('@/assets/images/th2/huile.jpg'),
      require('@/assets/images/th2/fourchette.jpg'),
      require('@/assets/images/th2/feu.jpg'),
      require('@/assets/images/th2/feu_bois.jpg')
    ]
  },
  {
    label: "🪔 L’huile",
    correctIndex: 1,
    audio: require('@/assets/sounds/bassa/th2/huile.wav'),
    images: [
      require('@/assets/images/th2/feu.jpg'),
      require('@/assets/images/th2/huile.jpg'),
      require('@/assets/images/th2/fourchette.jpg'),
      require('@/assets/images/th2/feu_bois.jpg')
    ]
  },
  {
    label: "Le feu de bois",
    correctIndex: 3,
    audio: require('@/assets/sounds/bassa/th2/feubois.wav'),
    images: [
      require('@/assets/images/th2/feu.jpg'),
      require('@/assets/images/th2/fourchette.jpg'),
      require('@/assets/images/th2/huile.jpg'),
      require('@/assets/images/th2/feu_bois.jpg')
    ]
  }
];

export default function Ex3_T2_3() {
  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });
  const [current, setCurrent] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [cauris, setCauris] = useState(5);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [xp, setXp] = useState(0);
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const starBounce = useRef(new Animated.Value(0)).current;
  const audioRef = useRef(null);
  const router = useRouter();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    ).start();

    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
        const json = await res.json();
        setCauris(json.cauris);
      }
    };

    setStartTime(Date.now());
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    loadUser();
    return () => clearInterval(timer);
  }, []);

  const playAudio = async () => {
    if (audioRef.current) await audioRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(data[current].audio);
    audioRef.current = sound;
    await sound.playAsync();
    setAudioPlayed(true);
  };

  const playSound = async (type) => {
    const path = {
      success: require('@/assets/sounds/success.mp3'),
      fail: require('@/assets/sounds/fail.mp3'),
      win: require('@/assets/sounds/level-win.mp3'),
      point: require('@/assets/sounds/point.mp3'),
      faux: require('@/assets/sounds/faux.mp3'),
    };
    const { sound } = await Audio.Sound.createAsync(path[type]);
    await sound.playAsync();
  };

  const calculateXP = (errors, seconds) => {
    const accuracy = ((data.length - errors) / data.length) * 100;
    if (accuracy === 100 && seconds < 120) return 700;
    if (accuracy === 100) return 620;
    if (accuracy >= 90 && seconds < 120) return 570;
    if (accuracy >= 90) return 520;
    if (accuracy >= 79 && seconds < 120) return 480;
    if (accuracy >= 79) return 420;
    if (accuracy >= 59 && seconds < 120) return 390;
    if (accuracy >= 59) return 340;
    if (accuracy >= 45 && seconds < 120) return 270;
    return 230;
  };

  const handleSelection = async (index) => {
    if (!audioPlayed || showSuccess || cauris === 0) {
      if (cauris === 0) {
        setShowZeroCauri(true);
        await playSound("point");
      }
      return;
    }
    setSelectedIndex(index);

    if (index === data[current].correctIndex) {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await playSound('success');
      setShowSuccess(true);
      setTimeout(async () => {
        setShowSuccess(false);
        if (current + 1 < data.length) {
          setCurrent(current + 1);
          setSelectedIndex(null);
          setAudioPlayed(false);
        } else {
          const totalTime = Math.floor((Date.now() - startTime) / 1000);
          const score = calculateXP(errorCount, totalTime);
          setXp(score);
          await playSound('win');

          await fetch(`${API_URL}/api/user/update-xp-time`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, exerciseNumber: 9, time: totalTime, xp: score })
          });

          await fetch(`${API_URL}/api/theme2/advance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, next: 10 })
          });

          setShowFinal(true);
          Animated.loop(
            Animated.sequence([
              Animated.timing(starBounce, { toValue: -20, duration: 400, useNativeDriver: true }),
              Animated.timing(starBounce, { toValue: 0, duration: 400, useNativeDriver: true })
            ])
          ).start();
        }
      }, 1200);
    } else {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await playSound('fail');
      setErrorCount(e => e + 1);
      setSelectedIndex(null);
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const json = await res.json();
      setCauris(json.newCauris);
      if (json.newCauris === 0) {
        setShowZeroCauri(true);
        await playSound('faux');
      }
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;
  const q = data[current];

  return (
    <>
      <NavTime />
      <Text style={{ textAlign: 'center', color: Colors.logo, fontWeight: 'bold' }}>⏱ Temps : {elapsed}s</Text>

      <Modal animationType="slide" transparent={true} visible={showZeroCauri}>
        <View style={styles.successOverlay}>
          <Animated.Image source={require('@/assets/images/mascotte.png')} style={[styles.starAnim, { transform: [{ translateY: mascotAnim }] }]} />
          <Text style={styles.successMessage}>😢 Tu as perdu tous tes cauris !</Text>
          <Text style={styles.successSub}>Attends la recharge automatique pour continuer</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.replace('/home4')}>
            <Text style={styles.nextBtnText}>🏠 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {showFinal ? (
        <View style={styles.successOverlay}>
           <Text>.</Text>
                  <Text>.</Text>
          <Animated.Image source={require('@/assets/images/star.png')} style={[styles.starAnim, { transform: [{ translateY: starBounce }] }]} />
          <Text style={styles.successMessage}>🎉 Tu as terminé le Téma 2 !</Text>
          <Text style={styles.successSub}>🍤 XP Gagné : {xp}  |  ⏱ Temps : {elapsed}s</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/home4')}>
            <Text style={styles.nextBtnText}>🏡 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.centeredContainer}>
          <View style={styles.card}>
            <Text style={styles.text1}>Sélectionne la bonne image</Text>
            <TouchableOpacity onPress={playAudio} style={styles.audioBlock}>
              <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
              <Text>🔊 {q.label}</Text>
            </TouchableOpacity>
            <View style={styles.grid}>
              {q.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.box, selectedIndex === index && styles.selectedBox]}
                  onPress={() => handleSelection(index)}
                >
                  <Image source={img} style={styles.img} />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.errorText}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  centeredContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors.white },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  text1: { fontFamily: Colors.font, fontWeight: '700', fontSize: 18, marginBottom: 30, textAlign: 'center' },
  audioBlock: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 2, borderRadius: 15, borderColor: Colors.gris, backgroundColor: Colors.white, marginBottom: 20 },
  audioIcon: { width: 24, height: 24, marginRight: 10 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  box: { width: '48%', height: 140, backgroundColor: '#f9f9f9', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: Colors.gris },
  selectedBox: { borderColor: Colors.logo, borderWidth: 3 },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  errorText: { fontSize: 14, fontWeight: '600', color: '#D62828', textAlign: 'center', marginTop: 20 },
  successOverlay: { position: 'absolute', top: 0, left: 0, height: screen.height, width: screen.width, backgroundColor: 'rgba(255,255,255,0.96)', zIndex: 99, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successMessage: { fontSize: 24, fontWeight: 'bold', color: Colors.logo, marginBottom: 20, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#444', textAlign: 'center', marginBottom: 20 },
  starAnim: { width: 80, height: 80, marginBottom: 20 },
  nextBtn: { backgroundColor: Colors.logo2, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, borderBottomWidth: 3, borderColor: Colors.logo },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
