import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color';
import NavTime from '@/components/navTime';

const correctAnswers = { 0: 2, 1: 4, 2: 6 };
const audioFiles = {
  0: require('@/assets/sounds/audio1.wav'),
  1: require('@/assets/sounds/audio2.wav'),
  2: require('@/assets/sounds/audio3.wav'),
};

export default function Ex2() {
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();
  const [answeredSections, setAnsweredSections] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState({});
  const [errorCount, setErrorCount] = useState(0);
  const soundRefs = useRef({});
  const [shakeAnim] = useState(new Animated.Value(0));

  const handlePlayAudio = async (section) => {
    try {
      if (soundRefs.current[section]) await soundRefs.current[section].unloadAsync();
      const { sound } = await Audio.Sound.createAsync(audioFiles[section]);
      soundRefs.current[section] = sound;
      await sound.playAsync();
      setAudioPlayed((prev) => ({ ...prev, [section]: true }));
    } catch (error) {
      console.log('Erreur audio:', error);
    }
  };

  const playSuccessSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/success.wav')
    );
    await sound.playAsync();
  };

  const playErrorSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/error.wav')
    );
    await sound.playAsync();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSelection = async (index, section) => {
    if (!audioPlayed[section]) {
      alert("🎧 Tu dois écouter l'audio avant de répondre.");
      return;
    }

    setAnsweredSections((prev) => ({ ...prev, [section]: index }));
    setShowResults(false);

    const correct = correctAnswers[section];
    if (index !== correct) {
      setErrorCount((prev) => prev + 1);
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      await playErrorSound();
      shake();
    } else {
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await playSuccessSound();
    }
  };

  const handleSubmit = () => {
    const total = Object.keys(correctAnswers).length;
    const completed = Object.keys(answeredSections).map((k) => Number(k));
    for (let i = 0; i < total; i++) {
      if (!completed.includes(i)) {
        alert('⛔ Réponds à toutes les questions.');
        return;
      }
    }

    setShowResults(true);
    setTimeout(() => router.push('/ex3'), 3000);
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavTime />
      <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={styles.scrollContent}
>

        <Text style={styles.title}>🎧 Soutiens ce que tu entends</Text>
        <Text style={styles.errorText}>❌ Erreurs : {errorCount}</Text>

        {[0, 1, 2].map((section) => {
          const baseIndex = section * 3 + 1;
          const selected = answeredSections[section];
          const correct = correctAnswers[section];

          return (
            <Animated.View key={section} style={{ transform: [{ translateX: shakeAnim }] }}>
              <View style={styles.card}>
                <TouchableOpacity style={styles.audioBlock} onPress={() => handlePlayAudio(section)}>
                  <Image source={require('@/assets/images/audio.png')} style={styles.audioIcon} />
                  <Text style={styles.audioText}>🔊 Clique pour écouter</Text>
                </TouchableOpacity>

                <View style={styles.options}>
                  {[0, 1, 2].map((offset) => {
                    const indexValue = baseIndex + offset;
                    const isSelected = selected === indexValue;
                    const isCorrect = correct === indexValue;

                    let styleBtn = [styles.option];
                    if (showResults) {
                      if (isSelected && isCorrect) styleBtn.push(styles.correct);
                      else if (isSelected && !isCorrect) styleBtn.push(styles.incorrect);
                      else if (!isSelected && isCorrect) styleBtn.push(styles.correctBorder);
                    } else if (isSelected) styleBtn.push(styles.selected);

                    return (
                      <TouchableOpacity
                        key={indexValue}
                        style={styleBtn}
                        onPress={() => handleSelection(indexValue, section)}
                      >
                        <Text style={styles.optionText}>Option {indexValue}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                
              </View>

              
            </Animated.View>

            
          );
        })}
  <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingHorizontal: Colors.padding,
    paddingBottom: 80,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  
  
  
  title: {
    fontFamily: Colors.font,
    fontWeight: '700',
    fontSize: 20,
    marginVertical: 10,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  card: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
    elevation: 1,
  },
  audioBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.gris,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.white,
  },
  audioIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  audioText: {
    fontSize: 14,
    fontWeight: '500',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderRadius: 25,
    borderColor: Colors.gris,
    backgroundColor: Colors.white,
  },
  optionText: {
    color: '#333',
    fontWeight: '600',
  },
  selected: {
    backgroundColor: Colors.vert,
    borderColor: Colors.vert,
  },
  correct: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  incorrect: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  correctBorder: {
    borderColor: '#28a745',
  },
  bottomButtonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.logo2,
    borderColor: Colors.logo,
    borderBottomWidth: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#fff',
  },
});
