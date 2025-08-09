// ✅ ex1_t1_2.tsx - Version complète immersive avec XP, Timer, Cauris, Time5
import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, TextInput,
  KeyboardAvoidingView, ScrollView, ActivityIndicator, Platform, Modal, Animated
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/assets/fonts/color';
import NavTime from '@/components/navTime';
import { Linking } from 'react-native';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const questions = [
  { label: "🦒 La girafe", correct: "Ŋgilóɓa", audio: require('@/assets/sounds/douala/th1/girafe.wav') },
  { label: "🐟 Le poisson", correct: "Súe", audio: require('@/assets/sounds/douala/th1/poisson.wav') },
  { label: "Le lion", correct: "Ŋgila", audio: require('@/assets/sounds/douala/th1/lion.wav') },
  { label: "Le poulet", correct: "Wúɓa (esɔmbɛ́)", audio: require('@/assets/sounds/douala/th1/poulet.wav') },
  { label: "boeuf", correct: "Nyaka", audio: require('@/assets/sounds/douala/th1/boeuf.wav') },
];

export default function Ex1_T1_2() {
  const router = useRouter();
  const soundRef = useRef(null);
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [showCenterNotify, setShowCenterNotify] = useState(false);
  const [cauris, setCauris] = useState(5);
  const [userId, setUserId] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [anim] = useState(new Animated.Value(0));

  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    );
    loop.start();

    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    loadStats();
    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
      const data = await res.json();
      setCauris(data.cauris);
    }
  };

  const playAudio = async () => {
    if (soundRef.current) await soundRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(questions[current].audio);
    soundRef.current = sound;
    await sound.playAsync();
  };

  const calculateXP = (errors, seconds) => {
    const accuracy = ((questions.length - errors) / questions.length) * 100;
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

  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

// Détection simulée : affiche l'alerte si on est sur Android ou iOS
useEffect(() => {
  // Tu peux renforcer la détection avec NativeModules ou Expo Device
  setShowKeyboardHint(true);
}, []);

  const handleSubmit = async () => {
    if (cauris === 0) {
      setShowCenterNotify(true);
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/point.mp3'));
      await sound.playAsync();
      setTimeout(() => setShowCenterNotify(false), 4000);
      return;
    }

    const correct = questions[current].correct.trim().toLowerCase();
    const answer = input.trim().toLowerCase();

    if (answer === correct) {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setInput('');
        setErrorCount(0);
        setShowCorrection(false);
      } else {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const score = calculateXP(errorCount, totalTime);
        setXpEarned(score);
        await Audio.Sound.createAsync(require('@/assets/sounds/level-win.mp3')).then(({ sound }) => sound.playAsync());
        await fetch(`${API_URL}/api/theme0/advance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, next: 6 })
        });
        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 5, time: totalTime, xp: score })
        });
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start(() => setShowSuccess(true));
      }
    } else {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorCount(e => {
        const updated = e + 1;
        if (updated >= 2) setShowCorrection(true);
        return updated;
      });
      await Audio.Sound.createAsync(require('@/assets/sounds/fail.mp3')).then(({ sound }) => sound.playAsync());
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
      if (data.newCauris === 0) {
        setShowZeroCauri(true);
        await Audio.Sound.createAsync(require('@/assets/sounds/faux.mp3')).then(({ sound }) => sound.playAsync());
      }
    }
  };

  const q = questions[current];
  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <NavTime />
        <Text style={styles.title}>✍️ Téma 1 - Écrire en Douala</Text>
        <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}   ⏱ Temps : {elapsed}s</Text>

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
            <Text style={styles.modalTitle}>😢 Tu as perdu tous tes cauris !</Text>
            <Text style={styles.subtitle}>Attends la recharge automatique pour continuer</Text>
            <TouchableOpacity style={styles.homeButton} onPress={() => { setShowZeroCauri(false); router.replace('/home2'); }}>
              <Text style={styles.homeButtonText}>🏠 Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {!showSuccess ? (
          <View style={styles.card}>
            <Text style={styles.questionLabel}>Traduire : <Text style={styles.highlight}>{q.label}</Text></Text>
            <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
              <Image source={require('@/assets/images/audio.png')} style={styles.icon} />
              <Text style={styles.audioText}>🔊 Écouter</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="Tape ici la réponse..." value={input} onChangeText={setInput} autoCorrect={false} autoCapitalize="none" />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>✅ Valider</Text>
            </TouchableOpacity>
            {showCorrection && (
              <View style={styles.correctionBox}>
                <Text style={styles.correctionText}>✅ Réponse : {q.correct}</Text>
                <TouchableOpacity style={styles.nextBtn} onPress={() => { setCurrent(current + 1); setInput(''); setErrorCount(0); setShowCorrection(false); }}>
                  <Text style={styles.nextText}>➡️ Suivant</Text>
                </TouchableOpacity>
              </View>
            )}
            <Image source={require('@/assets/images/mascotte.png')} style={styles.mascot} />
          </View>
        ) : (
          <Animated.View style={[styles.overlay, { opacity: anim }]}> 
            <Image source={require('@/assets/images/mascotte.png')} style={styles.mascot} />
            <Text style={styles.successTitle}>🎉 Exercice terminé !</Text>
            <Text style={styles.successSub}>🍤 XP : {xpEarned}   ⏱ Temps : {elapsed}s</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/ex1_t1_3')}>
              <Text style={styles.nextText}>➡️ Continuer</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showKeyboardHint && (
  <View style={styles.keyboardHintBox}>
    <Text style={styles.keyboardHintText}>⚠️ Certains caractères spéciaux ne sont pas disponibles avec ton clavier actuel.</Text>
    <Text style={styles.keyboardHintText}>➡️ Installe un clavier adapté pour écrire correctement :</Text>
    <TouchableOpacity
      onPress={() => {
        // lien vers clavier Android
        Linking.openURL('https://play.google.com/store/apps/details?id=info.langtechcameroon.keyboard');
      }}>
      <Text style={styles.keyboardLink}>📱 Clavier Camerounais (Android)</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => {
        // lien vers clavier iOS
        Linking.openURL('https://langtechcameroon.info/clavier-keyman/');
      }}>
      <Text style={styles.keyboardLink}>🍏 Clavier Camerounais (iOS)</Text>
    </TouchableOpacity>
  </View>
)}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FDFCF8', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.logo, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 4, textAlign: 'center' },
  highlight: { color: Colors.logo, fontWeight: '700' },
  questionLabel: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  audioBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0DE', padding: 12, borderRadius: 30, borderWidth: 2, borderColor: '#FFBC70', marginBottom: 20 },
  icon: { width: 26, height: 26, marginRight: 10 },
  audioText: { fontSize: 15, fontWeight: '600', color: '#333' },
  input: { width: '100%', borderWidth: 2, borderColor: '#ccc', borderRadius: 28, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16, backgroundColor: '#fff', marginBottom: 20, textAlign: 'center' },
  submitBtn: { backgroundColor: Colors.logo2, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30, borderBottomWidth: 4, borderColor: Colors.logo, marginBottom: 20 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  correctionBox: { backgroundColor: '#e7f9ed', borderColor: '#34a853', borderWidth: 2, padding: 14, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  correctionText: { fontSize: 16, color: '#15803d', fontWeight: '700', marginBottom: 10 },
  mascot: { width: 120, height: 120, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 10, textAlign: 'center' },
  homeButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.logo, borderRadius: 8 },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  nextBtn: { backgroundColor: Colors.logo2, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, borderBottomWidth: 4, borderColor: Colors.logo },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  fullscreenNotify: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 },
  notifyBox: { backgroundColor: '#fff', padding: 24, borderRadius: 20, alignItems: 'center' },
  notifyBigText: { fontSize: 24, fontWeight: 'bold', color: '#e11d48', marginBottom: 10 },
  notifySmallText: { fontSize: 16, color: '#333', textAlign: 'center' },
  overlay: { position: 'absolute', top: '25%', left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 30, borderRadius: 20, zIndex: 999 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 10, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#ccc', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },

  keyboardHintBox: {
  marginTop: 20,
  backgroundColor: '#FFFBE6',
  borderColor: '#FFD700',
  borderWidth: 1,
  borderRadius: 10,
  padding: 16,
  width: '100%',
},
keyboardHintText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 6,
},
keyboardLink: {
  color: '#007AFF',
  textDecorationLine: 'underline',
  marginBottom: 8,
  fontWeight: 'bold',
},

});