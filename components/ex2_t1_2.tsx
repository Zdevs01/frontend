// ✅ ex2_t1_2.tsx (version finale immersive avec XP, Cauris, Timer et Audio)
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Image, Animated, Modal
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavTime from '@/components/navTime';
import * as Haptics from 'expo-haptics';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet


const questions = [
  { label: "Le poisson", correct: "gù (bapgù)", audio: require('@/assets/sounds/ghomala/th1/poisson.wav') },
  { label: "L’huile", correct: "mwaə̌", audio: require('@/assets/sounds/ghomala/th1/huile.wav') },
  { label: "bœuf", correct: "na’", audio: require('@/assets/sounds/ghomala/th1/bœuf.wav') },
];

export default function Ex2_T1_2() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });
  const [userId, setUserId] = useState(null);
  const [cauris, setCauris] = useState(5);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xp, setXp] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [notifyZero, setNotifyZero] = useState(false);
  const mascotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
        const data = await res.json();
        setCauris(data.cauris);
      }
    })();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(questions[current].audio);
    await sound.playAsync();
  };

  const showNotify = async () => {
    setNotifyZero(true);
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/point.mp3'));
    await sound.playAsync();
    setTimeout(() => setNotifyZero(false), 5000);
  };

  const calculateXP = (errors: number, seconds: number) => {
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
    if (cauris === 0) return await showNotify();

    const correct = questions[current].correct.trim().toLowerCase();
    const answer = input.trim().toLowerCase();

    if (answer === correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setInput('');
        setErrorCount(0);
        setShowCorrection(false);
      } else {
        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        const score = calculateXP(errorCount, totalTime);
        setXp(score);
        setSuccess(true);
        await Audio.Sound.createAsync(require('@/assets/sounds/level-win.mp3')).then(({ sound }) => sound.playAsync());

        await fetch(`${API_URL}/api/theme1/advance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, next: 3 })
        });

        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 2, time: totalTime, xp: score })
        });
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await Audio.Sound.createAsync(require('@/assets/sounds/fail.mp3')).then(({ sound }) => sound.playAsync());
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
      setErrorCount(e => {
        const updated = e + 1;
        if (updated >= 2) setShowCorrection(true);
        return updated;
      });
    }
  };

  const handleCorrection = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setInput('');
      setErrorCount(0);
      setShowCorrection(false);
    } else {
      setSuccess(true);
    }
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  const q = questions[current];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavTime />
      <Text >.</Text>
      <Text >.</Text>
      <Text style={styles.timer}>⏱ Temps : {elapsed}s</Text>

      {notifyZero && (
        <View style={styles.notifyOverlay}>
          <View style={styles.notifyBox}>
            <Text style={styles.notifyBig}>🚫 Plus de cauris !</Text>
            <Text style={styles.notifyText}>Patientez la recharge automatique...</Text>
          </View>
        </View>
      )}

      {!success ? (
        <View style={styles.card}>
          <Text style={styles.title}>📝 Téma 0 - Écris la bonne réponse</Text>
          <Text style={styles.subtitle}>Traduire : <Text style={styles.highlight}>{q.label}</Text></Text>

          <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
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
              <TouchableOpacity onPress={handleCorrection}>
                <Text style={styles.nextText}>➡️ Suivant</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.status}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>
        </View>
      ) : (
        <View style={styles.successBox}>
          <Image source={require('@/assets/images/star.png')} style={styles.star} />
          <Text style={styles.successTitle}>🎉 Bravo !</Text>
          <Text style={styles.successSub}>XP Gagnés : 🍤 {xp} - Temps : ⏱ {elapsed}s</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.push('/ex2_t1_3')}>
            <Text style={styles.submitText}>➡️ Continuer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center'
  },
  highlight: {
    color: Colors.logo,
    fontWeight: '700',
  },
  audioBtn: {
    backgroundColor: '#FFF0DE',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFBC70',
    marginVertical: 16,
  },
  audioText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
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
    textAlign: 'center'
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
    textAlign: 'center'
  },
  nextText: {
    color: Colors.logo,
    fontWeight: '700',
    fontSize: 16,
  },
  status: {
    fontSize: 14,
    color: '#D62828',
    fontWeight: '600',
    textAlign: 'center'
  },
  timer: {
    fontSize: 16,
    color: Colors.logo,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center'
  },
  successBox: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 5
  },
  successSub: {
    fontSize: 16,
    color: '#444',
    marginBottom: 25,
    textAlign: 'center'
  },
  star: {
    width: 80,
    height: 80,
    marginBottom: 15
  },
  notifyOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  notifyBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  notifyBig: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e11d48',
    marginBottom: 10,
  },
  notifyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
