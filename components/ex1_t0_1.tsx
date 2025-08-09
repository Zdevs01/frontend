// ✅ ex1_t0_1.tsx (version finale immersive avec XP, Timer, Audio, Alertes)
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Vibration, Modal, Image
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import NavTime from '@/components/navTime';
import Colors from '@/assets/fonts/color';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const pairs = [
  { fr: "Le papa", douala: "Papá", audio: require('@/assets/sounds/douala/th0/papa.wav') },
  { fr: "La maman", douala: "Mamá", audio: require('@/assets/sounds/douala/th0/maman.wav') },
  { fr: "La tante paternelle", douala: "Árí á teté", audio: require('@/assets/sounds/douala/th0/tante_paternelle.wav') },
  { fr: "L’oncle paternel", douala: "Ndómé á teté", audio: require('@/assets/sounds/douala/th0/oncle_paternel.wav') },
  { fr: "Les grands-parents", douala: "Ɓambámbé", audio: require('@/assets/sounds/douala/th0/grandparents.wav') },
  { fr: "Les amis", douala: "Makóm", audio: require('@/assets/sounds/douala/th0/amis.wav') },
  { fr: "Les enfants", douala: "Ɓána", audio: require('@/assets/sounds/douala/th0/enfants.wav') },
  { fr: "Le bébé", douala: "Múna á mwèné", audio: require('@/assets/sounds/douala/th0/bebe.wav') },
];

export default function Ex1_T0_1() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });
  const [shuffledFr, setShuffledFr] = useState([]);
  const [shuffledDl, setShuffledDl] = useState([]);
  const [selectedFr, setSelectedFr] = useState(null);
  const [matched, setMatched] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cauris, setCauris] = useState(5);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [showCenterNotify, setShowCenterNotify] = useState(false);
  const [userId, setUserId] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [anim] = useState(new Animated.Value(0));
  const mascotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserStats();
    setShuffledFr([...pairs].sort(() => Math.random() - 0.5));
    setShuffledDl([...pairs].sort(() => Math.random() - 0.5));
    setStartTime(Date.now());

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    ).start();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const playAudio = async (audio) => {
    const { sound } = await Audio.Sound.createAsync(audio);
    await sound.playAsync();
  };

  const loadUserStats = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
      const data = await res.json();
      setCauris(data.cauris);
    }
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

  const handleMatch = async (frItem, dlItem) => {
    if (cauris === 0) return await handleNoCauriClick();
    if (frItem.douala === dlItem.douala) {
      setMatched((prev) => [...prev, frItem.fr]);
      setSelectedFr(null);

      if (matched.length + 1 === pairs.length) {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const score = calculateXP(errorCount, totalTime);
        setXpEarned(score);
        await playAudio(require('@/assets/sounds/level-win.mp3'));

        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 1, time: totalTime, xp: score })
        });

        await fetch(`${API_URL}/api/theme0/advance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, next: 2 })
        });

        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => setShowSuccess(true));
      }
    } else {
      Vibration.vibrate(100);
      await playAudio(require('@/assets/sounds/fail.mp3'));
      setErrorCount((e) => e + 1);
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
      if (data.newCauris === 0) {
        setShowZeroCauri(true);
        await playAudio(require('@/assets/sounds/faux.mp3'));
      }
      setSelectedFr(null);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavTime />
      <Text >.</Text>
      <Text >.</Text>
      <Text style={styles.timer}>⏱ Temps écoulé : {elapsed}s</Text>
      <Text style={styles.title}>🔗 Téma 0 - Associe les mots</Text>
      <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>

      {showCenterNotify && (
        <View style={styles.fullscreenNotify}>
          <View style={styles.notifyBox}>
            <Text style={styles.notifyBigText}>🚫 Oups !</Text>
            <Text style={styles.notifySmallText}>Vous avez 0 cauris. Attendez la recharge automatique.</Text>
          </View>
        </View>
      )}

      <Modal animationType="slide" transparent={true} visible={showZeroCauri}>
        <View style={styles.modalOverlay}>
          <Animated.Image source={require('@/assets/images/mascotte.png')} style={[styles.mascot, { transform: [{ translateY: mascotAnim }] }]} />
          <Text style={styles.success}>😢 Tu as perdu tous tes cauris !</Text>
          <Text style={styles.subtitle}>Attends la recharge automatique pour continuer</Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => { setShowZeroCauri(false); router.replace('/home2'); }}>
            <Text style={styles.homeButtonText}>🏠 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.row}>
        <View style={styles.column}>
          {shuffledFr.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.card, matched.includes(item.fr) && styles.cardMatched, selectedFr?.fr === item.fr && styles.cardSelected]} onPress={() => cauris === 0 ? handleNoCauriClick() : !matched.includes(item.fr) && setSelectedFr(item)}>
              <Text style={styles.cardText}>{item.fr}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          {shuffledDl.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.card, matched.includes(item.fr) && styles.cardMatched]} onPress={() => {
              if (cauris === 0) return handleNoCauriClick();
              if (selectedFr && !matched.includes(item.fr)) handleMatch(selectedFr, item);
              playAudio(item.audio);
            }}>
              <Text style={styles.cardText}>{item.douala}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.continueBtn, matched.length === pairs.length ? styles.continueActive : styles.continueDisabled]} onPress={() => router.push('/ex1_t0_2')} disabled={matched.length !== pairs.length}>
        <Text style={styles.continueText}>{matched.length === pairs.length ? '🎉 Continuer' : 'Complète toutes les paires'}</Text>
      </TouchableOpacity>

      {showSuccess && (
        <Animated.View style={[styles.overlay, { opacity: anim }]}> 
          <Image source={require('@/assets/images/mascotte.png')} style={styles.finalMascot} />
          <Text style={styles.success}>🏅 Exercice terminé !</Text>
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
  continueBtn: { marginTop: 30, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 28, borderWidth: 2 },
  continueActive: { backgroundColor: Colors.logo2, borderColor: Colors.logo },
  continueDisabled: { backgroundColor: '#ccc', borderColor: '#aaa' },
  continueText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  fullscreenNotify: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 },
  notifyBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20, alignItems: 'center' },
  notifyBigText: { fontSize: 24, fontWeight: 'bold', color: '#e11d48', marginBottom: 10 },
  notifySmallText: { fontSize: 16, color: '#333', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  mascot: { width: 120, height: 120, marginTop: 20 },
  finalMascot: { width: 120, height: 120, marginBottom: 10 },
  overlay: { position: 'absolute', top: '25%', left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 30, borderRadius: 20 },
  success: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 10, textAlign: 'center' },
  homeButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.logo, borderRadius: 8 },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
