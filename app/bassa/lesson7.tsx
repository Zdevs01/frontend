import React, { useState } from 'react';
import { Dimensions } from 'react-native';

import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Animated
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color.js';
import Nav from '@/components/Nav';
const { width, height } = Dimensions.get('window');
const avoir = [
  { label: 'Mɛ ̀ ɲ́yɔ̀ŋ : Je prends', file: require('../../assets/sounds/bassa/verbe6/1.wav') },
  { label: '̀ɲyɔ̀ŋ : tu prends', file: require('../../assets/sounds/bassa/verbe6/2.wav') },
  { label: 'A ɲ́yɔ̀ŋ  : il ou elle prend', file: require('../../assets/sounds/bassa/verbe6/3.wav') },
  { label: 'Di ɲ́yɔ̀ŋ : nous prenons', file: require('../../assets/sounds/bassa/verbe6/4.wav') },
  { label: 'Ni ɲ́yɔ̀ŋ : vous prenez', file: require('../../assets/sounds/bassa/verbe6/5.wav') },
  { label: 'Ba ɲ́yɔ̀ŋ  : ils ou elles prenez', file: require('../../assets/sounds/bassa/verbe6/6.wav') },
];

export default function bassaAvoirLesson() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [played, setPlayed] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [mascotAnim] = useState(new Animated.Value(1));
  const [successAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);
  const [lessonFinished, setLessonFinished] = useState(false);

  // ⬇️ Ajoute ceci juste ici ⬇️
 
  const bouncingStars = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: Math.floor(Math.random() * (width - 40)),
    top: Math.floor(Math.random() * (height - 100)),
    anim: new Animated.Value(0),
  }));


  const playVictory = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/win.mp3')
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Erreur win.mp3 :', e);
    }
  };

  const handlePlay = async (index: number) => {
    try {
      setIsPlaying(index);
      animateMascotte();
      const { sound } = await Audio.Sound.createAsync(avoir[index].file);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(null);
      });

      if (!played.includes(index)) {
        const updated = [...played, index];
        setPlayed(updated);
        if (updated.length === avoir.length) {
          triggerSuccessAnimation();
          await playVictory();
        }
      }
    } catch (err) {
      console.log('Erreur audio :', err);
    }
  };

  const animateMascotte = () => {
    Animated.sequence([
      Animated.timing(mascotAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
      Animated.timing(mascotAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const triggerSuccessAnimation = () => {
    setShowConfetti(true);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setLessonFinished(true);
    });
  };

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Nav />

      {!lessonFinished && (
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/sage2')}>
          <Text style={styles.backButtonText}>⬅️ Retour</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
      {lessonFinished ? (
  <Animated.View style={[styles.finalContainer, { opacity: successAnim }]}>
    {bouncingStars.map((star) => (
      <Animated.Image
        key={star.id}
        source={require('@/assets/images/star.png')}
        style={[
          styles.bouncingStar,
          {
            left: star.left,
            top: star.top,
            transform: [{ translateY: star.anim }],
          },
        ]}
      />
    ))}
    <View style={styles.centerContent}>
      <Image source={require('@/assets/images/star.png')} style={styles.starIconBig} />
      <Text style={styles.congratsText}>🎉 Félicitations !</Text>
      <Text style={styles.finalText}>Vous avez terminé toutes les leçons 🎓</Text>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push('/sage2')}
      >
        <Text style={styles.homeButtonText}>🏠 Retour à l’accueil</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
) : (

          <>
            <Text style={styles.title}>📚 Leçon finale : Le verbe prendre en bassa</Text>
            <Text style={styles.instruction}>🎧 Appuie sur chaque phrase pour écouter</Text>

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

            {avoir.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  played.includes(index) && styles.played,
                  isPlaying === index && styles.playing,
                ]}
                onPress={() => handlePlay(index)}
              >
                <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fffefb', paddingTop: 70,
  },

  finalContainer: {
    position: 'relative',
    width: '100%',
    height: height - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    top: '40%',
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  bouncingStar: {
    position: 'absolute',
    width: 32,
    height: 32,
    zIndex: 1,
  },
  

  congratsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
    position: 'relative',
  },
  
  centeredContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  bouncingStar: {
    position: 'absolute',
    width: 32,
    height: 32,
    opacity: 0.8,
    zIndex: 1,
  },
  
  scrollContainer: {
    padding: 20, paddingBottom: 100,
  },
  backButton: {
    position: 'absolute', top: 70, left: 20, backgroundColor: '#eee',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#bbb', zIndex: 999,
  },
  backButtonText: {
    color: '#333', fontWeight: '600', fontSize: 14,
  },
  title: {
    fontSize: 22, fontWeight: '700', textAlign: 'center',
    marginBottom: 8, color: Colors.logo,
  },
  instruction: {
    fontSize: 15, textAlign: 'center', marginBottom: 20,
  },
  mascot: {
    width: 100, height: 100, alignSelf: 'center', marginBottom: 25,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f3f3',
    padding: 15, borderRadius: 14, marginBottom: 12,
    borderWidth: 2, borderColor: Colors.gris,
  },
  played: {
    backgroundColor: '#dcfce7', borderColor: '#15803d',
  },
  playing: {
    backgroundColor: '#e0e7ff', borderColor: '#4338ca',
  },
  itemText: {
    fontSize: 16, marginLeft: 15, fontWeight: '600',
  },
  audioIcon: {
    width: 24, height: 24,
  },
  confettiContainer: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  confettiText: {
    fontSize: 22, color: 'green', fontWeight: '800',
    marginLeft: 10,
  },
  starIcon: {
    width: 36, height: 36,
  },
  starIconBig: {
    width: 70, height: 70, marginBottom: 10,
  },
  congratsText: {
    fontSize: 26, fontWeight: '800', color: '#15803d',
    textAlign: 'center', marginBottom: 8,
  },
  finalText: {
    fontSize: 16, textAlign: 'center', marginBottom: 30,
  },
  homeButton: {
    backgroundColor: Colors.logo2, paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 25, borderBottomWidth: 4, borderColor: Colors.logo,
  },
  homeButtonText: {
    color: '#fff', fontWeight: '700', fontSize: 16,
  },
});
