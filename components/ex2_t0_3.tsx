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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const screen = Dimensions.get('window');

const imageMap = {
  'grandparents.jpg': require('@/assets/images/th0/grandparents.jpg'),
  'papa.jpg': require('@/assets/images/th0/papa.jpg'),
  'bebe.jpg': require('@/assets/images/th0/bebe.jpg'),
  'maman.jpg': require('@/assets/images/th0/maman.jpg'),
};

const rawData = [
  {
    label: "Ecoutes",
    correct: 'grandparents.jpg',
    audio: require('@/assets/sounds/ghomala/th0/grandparents.wav'),
    images: ['grandparents.jpg', 'papa.jpg', 'bebe.jpg', 'maman.jpg']
  },
  {
    label: "Ecoutes",
    correct: 'papa.jpg',
    audio: require('@/assets/sounds/ghomala/th0/papa.wav'),
    images: ['papa.jpg', 'bebe.jpg', 'grandparents.jpg', 'maman.jpg']
  },
  {
    label: "Ecoutes",
    correct: 'bebe.jpg',
    audio: require('@/assets/sounds/ghomala/th0/bebe.wav'),
    images: ['bebe.jpg', 'grandparents.jpg', 'papa.jpg', 'maman.jpg']
  },
  {
    label: "Ecoutes",
    correct: 'maman.jpg',
    audio: require('@/assets/sounds/ghomala/th0/maman.wav'),
    images: ['bebe.jpg', 'grandparents.jpg', 'papa.jpg', 'maman.jpg']
  }
];

function shuffleImages(question) {
  const shuffled = [...question.images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    ...question,
    shuffledImages: shuffled,
    correctIndex: shuffled.indexOf(question.correct)
  };
}

export default function ex2_t0_3() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [current, setCurrent] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [showZeroCauri, setShowZeroCauri] = useState(false);
  const [showCenterNotify, setShowCenterNotify] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [cauris, setCauris] = useState(5);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [xp, setXp] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const starBounce = useRef(new Animated.Value(0)).current;
  const mascotAnim = useRef(new Animated.Value(0)).current;
  const audioRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setData(rawData.map(shuffleImages));
    loadUserStats();
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

  const calculateXP = (errors, seconds) => {
    const total = data.length;
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

  const updateProgress = async () => {
    try {
      await fetch(`${API_URL}/api/theme1/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, next: 4 })
      });
    } catch (err) {
      console.error('Erreur mise à jour progression:', err);
    }
  };

  const handleNoCauriClick = async () => {
    setShowCenterNotify(true);
    await playSound('fail');
    setTimeout(() => setShowCenterNotify(false), 4000);
  };

  const playAudio = async () => {
    try {
      if (audioRef.current) await audioRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(data[current].audio);
      audioRef.current = sound;
      await sound.playAsync();
      setAudioPlayed(true);
    } catch (err) {
      console.error('Audio error:', err);
    }
  };

  const playSound = async (type) => {
    const path = {
      success: require('@/assets/sounds/success.mp3'),
      fail: require('@/assets/sounds/fail.mp3'),
      win: require('@/assets/sounds/level-win.mp3')
    };
    const { sound } = await Audio.Sound.createAsync(path[type]);
    await sound.playAsync();
  };

  const startProgress = () => {
    Animated.timing(progressAnim, {
      toValue: screen.width,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const resetProgress = () => progressAnim.setValue(0);

  const handleSelection = async (index) => {
    if (!audioPlayed || disabled || showSuccess || cauris === 0) {
      if (cauris === 0) await handleNoCauriClick();
      return;
    }

    setSelectedIndex(index);
    setDisabled(true);
    startProgress();

    if (index === data[current].correctIndex) {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await playSound('success');
      setShowSuccess(true);
    } else {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await playSound('fail');
      setErrorCount(e => e + 1);
      const res = await fetch(`${API_URL}/api/user/remove-cauri/${userId}`);
      const result = await res.json();
      setCauris(result.newCauris);
      if (result.newCauris === 0) setShowZeroCauri(true);
      setSelectedIndex(null);
    }

    setTimeout(async () => {
      setShowSuccess(false);
      setDisabled(false);
      resetProgress();
      if (index === data[current].correctIndex) {
        if (current + 1 < data.length) {
          setCurrent(current + 1);
          setAudioPlayed(false);
        } else {
          await updateProgress();
          const totalTime = Math.floor((Date.now() - startTime) / 1000);
          const score = calculateXP(errorCount, totalTime);
          setXp(score);
          await fetch(`${API_URL}/api/user/update-xp-time`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, exerciseNumber: 3, time: totalTime, xp: score })
          });
          setShowFinal(true);
          Animated.loop(
            Animated.sequence([
              Animated.timing(starBounce, { toValue: -20, duration: 400, useNativeDriver: true }),
              Animated.timing(starBounce, { toValue: 0, duration: 400, useNativeDriver: true })
            ])
          ).start();
          playSound('win');
        }
      }
    }, 1200);
  };

  if (!fontsLoaded || data.length === 0) return <ActivityIndicator size="large" color={Colors.logo} />;

  const q = data[current];

  return (
    <>
      <NavTime />
      <Text>.</Text>
      <Text>.</Text>
      <Text style={styles.timer}>⏱ Temps : {elapsed}s</Text>
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
          <Text style={styles.successSub}>Attends la recharge automatique pour continuer</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => {
            setShowZeroCauri(false);
            router.replace('/home2');
          }}>
            <Text style={styles.nextBtnText}>🏡 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      {!showFinal ? (
        <ScrollView contentContainerStyle={styles.centeredContainer}>
          <View style={styles.card}>
            <Text style={styles.text1}>Sélectionne la bonne image</Text>
            <Text style={styles.subtitle}>❌ Erreurs : {errorCount}   💞 Cauris : {cauris}</Text>
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
        </ScrollView>
      ) : (
        <View style={styles.successOverlay}>
          <Animated.Image
            source={require('@/assets/images/star.png')}
            style={[styles.starAnim, { transform: [{ translateY: starBounce }] }]}
          />
          <Text style={styles.successMessage}>🎉 Tu as terminé le Téma 0 !</Text>
          <Text style={styles.successSub}>XP Gagnés : 🍤 {xp} - Temps : ⏱ {elapsed}s</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push('/home2')}>
            <Text style={styles.nextBtnText}>🏡 Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 16,
    color: Colors.logo,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  fullscreenNotify: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999
  },
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FDFCF8',
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
  text1: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.logo,
    marginBottom: 10,
    textAlign: 'center'
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
  successOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
  },
  starAnim: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 16,
    color: '#444',
    marginBottom: 25,
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: Colors.logo2,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderBottomWidth: 4,
    borderColor: Colors.logo,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  notifyBox: {
    backgroundColor: '#fff', padding: 24, borderRadius: 20, alignItems: 'center'
  },
  notifyBigText: {
    fontSize: 24, fontWeight: 'bold', color: '#e11d48', marginBottom: 10
  },
  notifySmallText: {
    fontSize: 16, color: '#333', textAlign: 'center'
  },
  subtitle: {
    fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center'
  },
  mascot: {
    width: 120, height: 120, marginTop: 20
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  }
});
