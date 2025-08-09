import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/assets/fonts/color.js';
import Nav from '@/components/Nav';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet
const days = [
  { label: 'Lundi : Mɔsi', file: require('../../assets/sounds/douala/lundi.wav') },
  { label: 'Mardi : Kwasi', file: require('../../assets/sounds/douala/mardi.wav') },
  { label: 'Mercredi : Mukɔsi', file: require('../../assets/sounds/douala/mercredi.wav') },
  { label: 'Jeudi : Ngisi', file: require('../../assets/sounds/douala/jeudi.wav') },
  { label: 'Vendredi : Ndɔsi', file: require('../../assets/sounds/douala/vendredi.wav') },
  { label: 'Samedi : Esaba', file: require('../../assets/sounds/douala/samedi.wav') },
  { label: 'Dimanche : Étina', file: require('../../assets/sounds/douala/dimanche.wav') },
];

export default function DoualaLesson1() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [played, setPlayed] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [mascotAnim] = useState(new Animated.Value(1));
  const [successAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const [sending, setSending] = useState(false);

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/success.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Erreur son de réussite :', error);
    }
  };

  const animateMascot = () => {
    Animated.sequence([
      Animated.timing(mascotAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mascotAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerSuccessAnimation = () => {
    setShowConfetti(true);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => setShowConfetti(false), 2000);
    });
  };

  const handlePlay = async (index: number) => {
    try {
      setIsPlaying(index);
      animateMascot();
      const { sound } = await Audio.Sound.createAsync(days[index].file);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(null);
        }
      });

      if (!played.includes(index)) {
        const newPlayed = [...played, index];
        setPlayed(newPlayed);
        console.log("Jours joués :", newPlayed);

        if (newPlayed.length === days.length) {
          triggerSuccessAnimation();
          await playSuccessSound();
        }
      }
    } catch (err) {
      console.log('Erreur audio:', err);
    }
  };
 
  const isLessonCompleted = played.length === days.length;

  const handleNextLesson = async () => {
    try {
      setSending(true);
  
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) return;
  
      const { id } = JSON.parse(userData);
      const response = await fetch(`${API_URL}/api/lessons/validate`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, lessonNumber: 1 }), // 👈 TRÈS IMPORTANT
      });
      
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Bravo ! Leçon validée. Prochaine leçon débloquée.');
        router.push('/sage'); // 👈 retour à Sage pour voir le changement
      } else {
        alert(result.message || "Erreur lors de la validation.");
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la leçon:', error);
    } finally {
      setSending(false);
    }
  };
  

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Nav />

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/sage')}>
        <Text style={styles.backButtonText}>⬅️ Retour</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>📚 Leçon 1 : Les jours de la semaine en Douala</Text>
        <Text style={styles.instruction}>🎧 Appuie sur chaque jour pour écouter</Text>

        <Animated.Image
          source={require('@/assets/images/mascotte.png')}
          style={[styles.mascot, { transform: [{ scale: mascotAnim }] }]}
        />

        {showConfetti && (
          <Animated.View style={[styles.confettiContainer, { opacity: successAnim }]}>
            <Image source={require('@/assets/images/star.png')} style={styles.starIcon} />
            <Text style={styles.confettiText}>🎉 Bravo !</Text>
          </Animated.View>
        )}

        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayItem,
              played.includes(index) && styles.dayPlayed,
              isPlaying === index && styles.dayPlaying,
            ]}
            onPress={() => handlePlay(index)}
          >
            <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
            <Text style={styles.dayText}>{day.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.nextButton, !isLessonCompleted && styles.disabledButton]}
          disabled={!isLessonCompleted || sending}
          onPress={handleNextLesson}
          onPress={() => router.push('/douala/lesson2')}
        >
          <Text style={styles.nextButtonText}>
            {sending ? "Validation..." : '🎯 Terminer la leçon'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffefb', paddingTop: 80 },
  scrollContainer: { paddingBottom: 100, paddingHorizontal: 20 },
  backButton: {
    backgroundColor: '#eee', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, alignSelf: 'flex-start', marginLeft: 20, marginTop: 10,
  },
  backButtonText: { color: '#333', fontWeight: '600' },
  title: {
    fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10,
    color: Colors.logo,
  },
  instruction: { fontSize: 15, textAlign: 'center', marginBottom: 20, color: Colors.black },
  mascot: { width: 100, height: 100, alignSelf: 'center', marginBottom: 25 },
  dayItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f4f4f4', padding: 15, marginVertical: 8,
    borderRadius: 14, borderWidth: 2, borderColor: Colors.gris,
  },
  dayPlayed: { backgroundColor: '#dcfce7', borderColor: '#15803d' },
  dayPlaying: { backgroundColor: '#e0e7ff', borderColor: '#4338ca' },
  dayText: { fontSize: 16, marginLeft: 15, fontWeight: '600' },
  audioIcon: { width: 24, height: 24 },
  nextButton: {
    marginTop: 30, paddingVertical: 15, backgroundColor: Colors.logo2,
    borderRadius: 25, alignItems: 'center', borderBottomWidth: 4, borderColor: Colors.logo,
  },
  nextButtonText: {
    color: 'white', fontWeight: '700', fontSize: 16, textTransform: 'uppercase',
  },
  disabledButton: { backgroundColor: '#ccc', borderColor: '#aaa' },
  confettiContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  starIcon: { width: 36, height: 36, marginRight: 10 },
  confettiText: { fontSize: 22, color: 'green', fontWeight: '800' },
});
