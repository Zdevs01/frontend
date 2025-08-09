// ✅ Ex2_T3_2 - écrire en ghomala (Téma 3) avec XP, cauris, timer, animation et progression = 12
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Animated, Modal, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color';
import NavTime from '@/components/navTime';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const questions = [
  { label: "👔 La cravate", correct: "ŋkwə̂ntúŋ", audio: require('@/assets/sounds/ghomala/th3/cravate.wav') },
  { label: "Cet habit", correct: "dzə́ yə̌ŋ", audio: require('@/assets/sounds/ghomala/th3/habit.wav') },
  { label: "Ce pantalon", correct: "tɛ́sho’ yə̌ŋ", audio: require('@/assets/sounds/ghomala/th3/pantalon.wav') },
  { label: "Ce manteau", correct: "dzə̂bəŋ yə̌ŋ", audio: require('@/assets/sounds/ghomala/th3/chaussure.wav') },
 
];

export default function Ex2_T3_2() {
  const router = useRouter();
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [cauris, setCauris] = useState(5);
  const [errorCount, setErrorCount] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notifyZero, setNotifyZero] = useState(false);
  const [userId, setUserId] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [xpEarned, setXpEarned] = useState(0);

  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });

  useEffect(() => {
    const init = async () => {
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      if (user) {
        setUserId(user.id);
        const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
        const data = await res.json();
        setCauris(data.cauris);
      }
    };
    init();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
        Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const playAudio = async () => {
    if (soundRef.current) await soundRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(questions[current].audio);
    soundRef.current = sound;
    await sound.playAsync();
  };

  const showNotify = async () => {
    setNotifyZero(true);
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/point.mp3'));
    await sound.playAsync();
    setTimeout(() => setNotifyZero(false), 4000);
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
    if (cauris === 0) return await showNotify();

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
        const time = Math.floor((Date.now() - startTime) / 1000);
        const xp = calculateXP(errorCount, time);
        setXpEarned(xp);
        setShowSuccess(true);
        await Audio.Sound.createAsync(require('@/assets/sounds/level-win.mp3')).then(({ sound }) => sound.playAsync());

        await fetch(`${API_URL}/api/theme1/advance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, next: 12 })
        });

        await fetch(`${API_URL}/api/user/update-xp-time`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, exerciseNumber: 11, time, xp })
        });
      }
    } else {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/fail.mp3'));
      await sound.playAsync();
      setErrorCount(e => {
        const newCount = e + 1;
        if (newCount >= 2) setShowCorrection(true);
        return newCount;
      });
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const data = await res.json();
      setCauris(data.newCauris);
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

  const q = questions[current];
  if (!fontsLoaded) return <ActivityIndicator size="large" color={Colors.logo} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NavTime />
      <Text>.</Text>
      <Text>.</Text>
      <Text style={styles.timer}>⏱ Temps écoulé : {elapsed}s</Text>
      <Text style={styles.title}>📝 Téma 3 - Écris la bonne réponse</Text>
      <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>

      {notifyZero && (
        <View style={styles.notify}>
          <Text style={styles.notifyText}>🚫 Oups ! Vous avez 0 cauris</Text>
        </View>
      )}

      {!showSuccess ? (
        <View style={styles.card}>
          <Text style={styles.question}>Traduire : <Text style={styles.highlight}>{q.label}</Text></Text>
          <TouchableOpacity onPress={playAudio} style={styles.audioBtn}>
            <Text style={styles.audioText}>🔊 Écouter</Text>
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Tape ici la réponse..."
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
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
        </View>
      ) : (
        <View style={styles.successContainer}>
          <Image source={require('@/assets/images/star.png')} style={styles.star} />
          <Text style={styles.successText}>🎉 Bravo !</Text>
          <Text style={styles.subtitle}>🍤 XP : {xpEarned}   ⏱ Temps : {elapsed}s</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.push('/ex2_t3_3')}>
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
  timer: {
    fontSize: 16,
    color: Colors.logo,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center'
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
    marginTop: 10,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  highlight: {
    color: Colors.logo,
    fontWeight: '800',
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
  successContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
  },
  star: {
    width: 80,
    height: 80,
    marginBottom: 15
  },
  successText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 5
  },
  notify: {
    marginVertical: 10,
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 10
  },
  notifyText: {
    color: '#856404',
    fontWeight: '600',
    textAlign: 'center'
  },
});
