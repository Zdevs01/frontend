import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Vibration, Modal, Image
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color';
import { useRouter } from 'expo-router';
import NavTime from '@/components/navTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet
const pairs = [
  { fr: "Le vêtement", douala: "Ní mbɔ́tí", audio: require('@/assets/sounds/douala/th3/habit.wav') },
  { fr: "La chemise", douala: "Ní sɔ́ti", audio: require('@/assets/sounds/douala/th3/chemise.wav') },
  { fr: "Le pantalon", douala: "Ní tolosísi", audio: require('@/assets/sounds/douala/th3/pantalon.wav') },
  { fr: "Le caleçon", douala: "Ɓé ɓekúɓɛ", audio: require('@/assets/sounds/douala/th3/calecon.wav') },
  { fr: "Le costume", douala: "Yí kóti", audio: require('@/assets/sounds/douala/th3/costume.wav') },
  { fr: "La culotte", douala: "Yé ekúɓɛ", audio: require('@/assets/sounds/douala/th3/culotte.wav') },
  { fr: "Le boubou", douala: "Ɓé ɓebuɓá", audio: require('@/assets/sounds/douala/th3/boubou.wav') },
  { fr: "Les chaussures", douala: "Yé etámbí", audio: require('@/assets/sounds/douala/th3/chaussure.wav') },
  { fr: "Le chapeau", douala: "Yé ekótó", audio: require('@/assets/sounds/douala/th3/chapeau.wav') },
];

export default function Ex1_T3_1() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });
  const [shuffledFr, setShuffledFr] = useState([]);
  const [shuffledDl, setShuffledDl] = useState([]);
  const [selectedFr, setSelectedFr] = useState(null);
  const [matched, setMatched] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [cauris, setCauris] = useState(5);
  const [userId, setUserId] = useState(null);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [showCenterNotify, setShowCenterNotify] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;
  const mascotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    init();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const init = async () => {
    setShuffledFr(pairs.map(p => p.fr).sort(() => Math.random() - 0.5));
    setShuffledDl(pairs.sort(() => Math.random() - 0.5));
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
      const data = await res.json();
      setCauris(data.cauris);
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    ).start();
  };

  const playAudio = async (audio) => {
    const { sound } = await Audio.Sound.createAsync(audio);
    await sound.playAsync();
  };

  const handleNoCauriClick = async () => {
    setShowCenterNotify(true);
    await playAudio(require('@/assets/sounds/point.mp3'));
    setTimeout(() => setShowCenterNotify(false), 4000);
  };

  const calculateXP = (errors, seconds) => {
    const accuracy = ((pairs.length - errors) / pairs.length) * 100;
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

  const handleMatch = async (fr, dl) => {
    if (cauris === 0) return await handleNoCauriClick();
    const pair = pairs.find(p => p.fr === fr && p.douala === dl.douala);
    if (pair) {
      setMatched(prev => [...prev, fr]);
      setSelectedFr(null);
      await playAudio(require('@/assets/sounds/success.mp3'));
      if (matched.length + 1 === pairs.length) {
        const time = Math.floor((Date.now() - startTime) / 1000);
        const xp = calculateXP(errorCount, time);
        setXpEarned(xp);
        await playAudio(require('@/assets/sounds/level-win.mp3'));

        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 10, time, xp })
        });

        await fetch(`${API_URL}/api/theme0/advance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, next: 11 })
        });

        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => setShowSuccess(true));
      }
    } else {
      setErrorCount(e => e + 1);
      setSelectedFr(null);
      Vibration.vibrate(100);
      await playAudio(require('@/assets/sounds/fail.mp3'));
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
      if (data.newCauris === 0) {
        setShowZeroCauri(true);
        await playAudio(require('@/assets/sounds/faux.mp3'));
      }
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavTime />

      <Text>.</Text>
      <Text>.</Text>
      <Text style={styles.timer}>⏱ Temps écoulé : {elapsed}s</Text>
      <Text style={styles.title}>🧥 Téma 3 - Associe les habits</Text>
      <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>

      {showCenterNotify && (
        <View style={styles.notify}>
          <Text style={styles.notifyText}>🚫 Oups ! Vous avez 0 cauris</Text>
        </View>
      )}

      <Modal animationType="slide" transparent={true} visible={showZeroCauri}>
        <View style={styles.modalOverlay}>
          <Animated.Image source={require('@/assets/images/mascotte.png')} style={[styles.mascot, { transform: [{ translateY: mascotAnim }] }]} />
          <Text style={styles.success}>😢 Tu as perdu tous tes cauris !</Text>
          <Text style={styles.subtitle}>Attends la recharge automatique pour continuer</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/home2')}>
            <Text style={styles.homeButtonText}>🏠 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.row}>
        <View style={styles.column}>
          {shuffledFr.map((fr, i) => (
            <TouchableOpacity key={i} style={[styles.card, matched.includes(fr) && styles.cardMatched, selectedFr === fr && styles.cardSelected]} onPress={() => cauris === 0 ? handleNoCauriClick() : !matched.includes(fr) && setSelectedFr(fr)}>
              <Text style={styles.cardText}>{fr}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.column}>
          {shuffledDl.map((dl, i) => (
            <TouchableOpacity key={i} style={[styles.card, matched.includes(dl.fr) && styles.cardMatched]} onPress={() => cauris === 0 ? handleNoCauriClick() : selectedFr && handleMatch(selectedFr, dl)}>
              <Text style={styles.cardText}>{dl.douala}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showSuccess && (
        <Animated.View style={[styles.overlay, { opacity: anim }]}>
          <Image source={require('@/assets/images/mascotte.png')} style={styles.finalMascot} />
          <Text style={styles.success}>🎉 Bravo !</Text>
          <Text style={styles.subtitle}>🍤 XP : {xpEarned}   ⏱ Temps : {elapsed}s</Text>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.logo, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 10, textAlign: 'center' },
  timer: { fontSize: 18, color: Colors.logo, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  column: { flex: 1, gap: 12 },
  card: { padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#ccc', backgroundColor: '#fff', alignItems: 'center' },
  cardText: { fontSize: 15, fontWeight: '600', color: '#333' },
  cardSelected: { backgroundColor: '#d0f0f0', borderColor: '#00bcd4' },
  cardMatched: { backgroundColor: '#d4edda', borderColor: '#28a745' },
  notify: { marginVertical: 10, backgroundColor: '#fff3cd', padding: 10, borderRadius: 10 },
  notifyText: { color: '#856404', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  mascot: { width: 120, height: 120, marginTop: 20 },
  finalMascot: { width: 120, height: 120, marginBottom: 10 },
  overlay: { position: 'absolute', top: '25%', left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 30, borderRadius: 20 },
  success: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 10, textAlign: 'center' },
  homeButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.logo, borderRadius: 8 },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
