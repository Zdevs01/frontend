// ✅ ex2_t1_3.tsx (version complète avec correction Haptics Web + Timer OK)
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

const imageMap = {
  'abeilles.png': require('@/assets/images/th1/abeilles.png'),
  'sauterelle.png': require('@/assets/images/th1/sauterelle.png'),
  'singe.jpg': require('@/assets/images/th1/singe.jpg'),
  'poisson.jpg': require('@/assets/images/th1/poisson.jpg'),
  'lion.jpg': require('@/assets/images/th1/lion.jpg'),
};

const rawData = [
  { label: "🐝 Les abeilles", correct: 'abeilles.png', audio: require('@/assets/sounds/ghomala/th1/abeilles.wav'), images: ['abeilles.png', 'sauterelle.png', 'singe.jpg'] },
  { label: "🦗 La sauterelle", correct: 'sauterelle.png', audio: require('@/assets/sounds/ghomala/th1/sauterelle.wav'), images: ['sauterelle.png', 'lion.jpg', 'singe.jpg'] },
  
  { label: "Poissons", correct: 'poisson.jpg', audio: require('@/assets/sounds/ghomala/th1/poisson.wav'), images: ['singe.jpg', 'poisson.jpg', 'abeilles.png', 'sauterelle.png'] },
  { label: "Le Lion", correct: 'lion.jpg', audio: require('@/assets/sounds/ghomala/th1/lion.wav'), images: ['singe.jpg', 'lion.jpg', 'abeilles.png'] },
 
  { label: "🐒 Les singes", correct: 'singe.jpg', audio: require('@/assets/sounds/ghomala/th1/singes.wav'), images: ['abeilles.png', 'sauterelle.png', 'singe.jpg'] }
];

function shuffleImages(question) {
  const shuffled = [...question.images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { ...question, shuffledImages: shuffled, correctIndex: shuffled.indexOf(question.correct) };
}

export default function ex2_t1_3() {
  const [fontsLoaded] = useFonts({ 'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf') });
  const [current, setCurrent] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const anim = useRef(new Animated.Value(0)).current;
  const audioRef = useRef(null);
  const router = useRouter();
  const [data, setData] = useState([]);
  const [cauris, setCauris] = useState(5);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [userId, setUserId] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(mascotAnim, { toValue: 10, duration: 400, useNativeDriver: true }),
      Animated.timing(mascotAnim, { toValue: 0, duration: 400, useNativeDriver: true })
    ])).start();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

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

    setData(rawData.map(shuffleImages));
    setStartTime(Date.now());
    loadUser();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showZeroCauri) {
      const timer = setTimeout(() => setShowZeroCauri(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showZeroCauri]);

  const vibrate = async (type) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(type);
    }
  };

  const calculateXP = (errors, seconds) => {
    const accuracy = ((rawData.length - errors) / rawData.length) * 100;
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

  const playAudio = async () => {
    if (audioRef.current) await audioRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(data[current].audio);
    audioRef.current = sound;
    await sound.playAsync();
    setAudioPlayed(true);
  };

  const handleSelection = async (index) => {
    if (!audioPlayed || disabled || showSuccess || cauris === 0) {
      if (cauris === 0) {
        setShowZeroCauri(true);
        return;
      }
      return;
    }
    setSelectedIndex(index);
    setDisabled(true);
    Animated.timing(progressAnim, { toValue: screen.width, duration: 1000, useNativeDriver: false }).start();

    if (index === data[current].correctIndex) {
      await vibrate(Haptics.NotificationFeedbackType.Success);
      setShowSuccess(true);
    } else {
      await vibrate(Haptics.NotificationFeedbackType.Error);
      setErrorCount(e => e + 1);
      setSelectedIndex(null);
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const json = await res.json();
      setCauris(json.newCauris);
      if (json.newCauris === 0) setShowZeroCauri(true);
    }

    setTimeout(async () => {
      setShowSuccess(false);
      setDisabled(false);
      progressAnim.setValue(0);
      if (index === data[current].correctIndex) {
        if (current + 1 < data.length) {
          setCurrent(current + 1);
          setAudioPlayed(false);
        } else {
          const totalTime = Math.floor((Date.now() - startTime) / 1000);
          const score = calculateXP(errorCount, totalTime);
          setXpEarned(score);
          setShowFinal(true);
          await fetch(`${API_URL}/api/theme1/advance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, next: 7 })
          });
          await fetch(`${API_URL}/api/user/update-xp-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, exerciseNumber: 6, time: totalTime, xp: score })
          });
          Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        }
      }
    }, 1200);
  };

  if (!fontsLoaded || data.length === 0) return <ActivityIndicator size="large" color={Colors.logo} />;
  const q = data[current];

  return (
    <ScrollView contentContainerStyle={styles.centeredContainer}>
      <NavTime />
      <Text style={styles.title}>🖼️ Téma 1 - Choisis la bonne image</Text>
      <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   🪵 Cauris : {cauris}   ⏱ Temps : {elapsed}s</Text>
      <View style={styles.card}>
        <TouchableOpacity onPress={playAudio} style={styles.audioBlock}>
          <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
          <Text>🔊 {q.label}</Text>
        </TouchableOpacity>
        <View style={styles.grid}>
          {q.shuffledImages.map((img, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.box, selectedIndex === index && styles.selectedBox]}
              onPress={() => handleSelection(index)}
            >
              <Image source={imageMap[img]} style={styles.img} />
            </TouchableOpacity>
          ))}
        </View>
        <Animated.View style={[styles.timerBar, { width: progressAnim }]} />
      </View>
      {showSuccess && (
        <Animated.View style={[styles.overlay, { opacity: anim }]}> 
          <Image source={require('@/assets/images/mascotte.png')} style={styles.mascot} />
          <Text style={styles.successTitle}>🎉 Exercice terminé !</Text>
          <Text style={styles.successSub}>🍤 XP : {xpEarned}   ⏱ Temps : {elapsed}s</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/ex2_t1_3')}>
            <Text style={styles.nextText}>➡️ Continuer</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {showZeroCauri && (
        <View style={styles.fullscreenNotify}>
          <View style={styles.notifyBox}>
            <Text style={styles.notifyBigText}>🚫 Oups !</Text>
            <Text style={styles.notifySmallText}>Vous avez 0 cauris. Attendez la recharge automatique.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FDFCF8',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.logo,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: screen.height,
    width: screen.width,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  mascot: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1b8a3c',
    marginBottom: 10,
    textAlign: 'center'
  },
  successSub: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center'
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
  fullscreenNotify: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  notifyBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  notifyBigText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D62828',
    marginBottom: 10,
  },
  notifySmallText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  audioBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0DE',
    padding: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFBC70',
    marginBottom: 20,
  },
  audioIcon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  box: {
    width: 140,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ccc',
    margin: 6,
  },
  selectedBox: {
    borderColor: Colors.logo,
    borderWidth: 3,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timerBar: {
    height: 6,
    backgroundColor: Colors.logo,
    borderRadius: 3,
    marginTop: 20,
    alignSelf: 'flex-start',
  },
});
