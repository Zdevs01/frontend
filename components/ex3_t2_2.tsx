// ✅ Ex3_T2_2.tsx - Écriture Téma 2 avec XP, Cauris, Temps, Oups et Progression (time7)
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

import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const questions = [
  { label: "Le feu", correct: "Hyèé", audio: require('@/assets/sounds/bassa/th2/feu.wav') },
  { label: "L’eau", correct: "màlép", audio: require('@/assets/sounds/bassa/th2/eau.wav') },
  { label: "Les légumes", correct: "Bìkáy bi jɛ́", audio: require('@/assets/sounds/bassa/th2/légumes.wav') },
  { label: "Le sel", correct: "ɓás", audio: require('@/assets/sounds/bassa/th2/sel.wav') }
];

export default function Ex3_T2_2() {
  const router = useRouter();
  const soundRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [cauris, setCauris] = useState(5);
  const [userId, setUserId] = useState(null);
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const [xp, setXp] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });

  useEffect(() => {
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
    loadStats();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    ).start();

    return () => clearInterval(timer);
  }, []);

  const playAudio = async () => {
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(questions[current].audio);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.log('Erreur audio :', err);
    }
  };

  const calculateXP = (errors, seconds) => {
    const total = questions.length;
    const precision = ((total - errors) / total) * 100;
    if (precision === 100 && seconds < 120) return 700;
    if (precision === 100) return 620;
    if (precision >= 90 && seconds < 120) return 570;
    if (precision >= 90) return 520;
    if (precision >= 79 && seconds < 120) return 480;
    if (precision >= 79) return 420;
    if (precision >= 59 && seconds < 120) return 390;
    if (precision >= 59) return 340;
    if (precision >= 45 && seconds < 120) return 270;
    return 230;
  };

  const handleSubmit = async () => {
    const correct = questions[current].correct.trim().toLowerCase();
    const answer = input.trim().toLowerCase();

    if (cauris === 0) {
      setShowZeroCauri(true);
      await Audio.Sound.createAsync(require('@/assets/sounds/point.mp3')).then(({ sound }) => sound.playAsync());
      return;
    }

    if (answer === correct) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setInput('');
        setErrorCount(0);
        setShowCorrection(false);
      } else {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const score = calculateXP(errorCount, totalTime);
        setXp(score);
        setShowSuccess(true);
        await Audio.Sound.createAsync(require('@/assets/sounds/level-win.mp3')).then(({ sound }) => sound.playAsync());

        await fetch(`${API_URL}/api/theme2/advance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, next: 9 })
        });

        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 8, time: totalTime, xp: score })
        });
      }
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Audio.Sound.createAsync(require('@/assets/sounds/fail.mp3')).then(({ sound }) => sound.playAsync());
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
      setErrorCount(e => {
        const updated = e + 1;
        if (updated >= 2) setShowCorrection(true);
        return updated;
      });
      if (data.newCauris === 0) {
        setShowZeroCauri(true);
        await Audio.Sound.createAsync(require('@/assets/sounds/faux.mp3')).then(({ sound }) => sound.playAsync());
      }
    }
  };

  const handleCorrection = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setInput('');
      setErrorCount(0);
      setShowCorrection(false);
    } else {
      setShowSuccess(true);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  const q = questions[current];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <NavTime />
        <Text>.</Text>
        <Text>.</Text>
        <Text style={styles.title}>✍️ theme 2 - Écrire en bassa</Text>
        <Text style={styles.subtitle}>⏱ Temps : {elapsed}s   ❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>

        <Modal animationType="slide" transparent={true} visible={showZeroCauri}>
          <View style={styles.modalOverlay}>
            <Animated.Image source={require('@/assets/images/mascotte.png')} style={[styles.mascot, { transform: [{ translateY: mascotAnim }] }]} />
            <Text style={styles.modalTitle}>😥 Tu as perdu tous tes cauris !</Text>
            <Text style={styles.subtitle}>Attends la recharge automatique pour continuer</Text>
            <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/home4')}>
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

            <TextInput
              style={styles.input}
              placeholder="Tape ici la réponse..."
              value={input}
              onChangeText={setInput}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>✅ Valider</Text>
            </TouchableOpacity>

            {showCorrection && (
              <View style={styles.correctionBox}>
                <Text style={styles.correctionText}>✅ Réponse : {q.correct}</Text>
                <TouchableOpacity style={styles.nextBtn} onPress={handleCorrection}>
                  <Text style={styles.nextText}>➡️ Suivant</Text>
                </TouchableOpacity>
              </View>
            )}

            <Image source={require('@/assets/images/mascotte.png')} style={styles.mascot} />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Image source={require('@/assets/images/star.png')} style={styles.star} />
            <Text style={styles.successTitle}>🎉 Bravo !</Text>
            <Text style={styles.successSub}>XP Gagnés : 🍤 {xp} - Temps : ⏱ {elapsed}s</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/ex3_t2_3')}>
              <Text style={styles.nextText}>➡️ Continuer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDFCF8',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.logo,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  highlight: {
    color: Colors.logo,
    fontWeight: '700',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0DE',
    padding: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFBC70',
    marginBottom: 20,
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  audioText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    textAlign: 'center'
  },
  submitBtn: {
    backgroundColor: Colors.logo2,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderBottomWidth: 4,
    borderColor: Colors.logo,
    marginBottom: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  correctionBox: {
    backgroundColor: '#e7f9ed',
    borderColor: '#34a853',
    borderWidth: 2,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  correctionText: {
    fontSize: 16,
    color: '#15803d',
    fontWeight: '700',
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: '#D62828',
    fontWeight: '600',
  },
  mascot: {
    width: 100,
    height: 100,
    marginTop: 30,
  },
  successContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  star: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 5,
  },
  successSub: {
    fontSize: 16,
    color: '#444',
    marginBottom: 25,
  },
  nextBtn: {
    backgroundColor: Colors.logo2,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderBottomWidth: 4,
    borderColor: Colors.logo,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 10, textAlign: 'center' },
  mascot: { width: 120, height: 120, marginTop: 20 },
  homeButton: { marginTop: 30, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.logo, borderRadius: 8 },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
