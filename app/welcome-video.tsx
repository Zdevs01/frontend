import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  StatusBar,
  Pressable,
  BackHandler,
  Platform,
} from "react-native";
import { Video } from "expo-av";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/assets/fonts/color";
import { CustomButton } from "@/components/CustomButton";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { API_URL } from '@/components/api';

const WelcomeVideo = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const videoRef = useRef(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [langue, setLangue] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);
  const [videoDéjàVue, setVideoDéjàVue] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Animation de pulsation pour les éléments importants
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchLangue = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/languages`);
        const data = await res.json();
        const langueChoisie = data.find((l) => l.id == id);
        setLangue(langueChoisie || null);
        if (!langueChoisie) setHasError(true);
      } catch (error) {
        console.error("Erreur fetch langue :", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchLangue();
  }, [id]);

  useEffect(() => {
    const checkSiVue = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(`${API_URL}/api/user/video-viewed/${userId}/${id}`);
        const data = await res.json();
        setVideoDéjàVue(data.viewed);
      } catch (error) {
        console.error("Erreur vérification vidéo vue:", error);
      }
    };
    if (id) checkSiVue();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        router.back();
        return true;
      });

      return () => {
        backHandler.remove();
        if (videoRef.current) videoRef.current.pauseAsync();
      };
    }, [])
  );

  const handleVideoEnd = async () => {
    setVideoFinished(true);
    
    // Animation spectaculaire de fin
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      await fetch(`${API_URL}/api/user/set-video-viewed/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ langueId: id }),
      });
    } catch (error) {
      console.error("Erreur mise à jour vidéo vue:", error);
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    // Animation de sortie
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (id == 1) router.push("/home2");
      else if (id == 2) router.push("/home4");
      else if (id == 3) router.push("/home3");
      else router.push("/home2");
    });
  };

  const handleSkip = () => {
    setVideoFinished(true);
    handleVideoEnd();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Préparation de votre expérience...</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* VIDEO AVEC OVERLAY DYNAMIQUE */}
      {langue?.video_intro && !hasError && (
        <Video
          ref={videoRef}
          source={{ uri: String(langue.video_intro) }}
          style={[styles.video, { width, height }]}
          resizeMode="cover"
          shouldPlay={isPlaying}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded) return;
            const { positionMillis, durationMillis, didJustFinish } = status;
            if (durationMillis && positionMillis) {
              const newProgress = positionMillis / durationMillis;
              setProgress(newProgress);
              
              // Animation fluide de la barre de progression
              Animated.timing(progressAnim, {
                toValue: newProgress,
                duration: 100,
                useNativeDriver: false,
              }).start();
            }
            if (didJustFinish && !videoFinished) {
              handleVideoEnd();
            }
          }}
          onError={() => setHasError(true)}
        />
      )}

      {/* GRADIENT OVERLAY DYNAMIQUE */}
      <LinearGradient
        colors={
          videoDéjàVue 
            ? ['rgba(46, 125, 50, 0.4)', 'rgba(76, 175, 80, 0.6)', 'rgba(0, 0, 0, 0.8)']
            : videoFinished 
            ? ['rgba(76, 175, 80, 0.4)', 'rgba(139, 195, 74, 0.6)', 'rgba(0, 0, 0, 0.8)']
            : ['rgba(63, 81, 181, 0.3)', 'rgba(103, 58, 183, 0.5)', 'rgba(0, 0, 0, 0.7)']
        }
        style={styles.dynamicOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* BOUTON RETOUR ÉLÉGANT */}
      <Animated.View style={[styles.backButton, { opacity: fadeAnim }]}>
        <Pressable
          style={styles.backButtonPress}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* CONTENU PRINCIPAL */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideInAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* HEADER AVEC ICÔNES ANIMÉES */}
        <View style={styles.header}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="headset" size={32} color="#FFD700" />
          </Animated.View>
          <Text style={styles.subtitle}>Plonge dans l'univers de :</Text>
        </View>

        <Animated.View style={[styles.languageContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.languageName}>{langue?.nom || "Langue inconnue"}</Text>
          <View style={styles.sparkle}>
            <Ionicons name="sparkles" size={20} color="#FFD700" />
          </View>
        </Animated.View>

        {hasError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#ff5722" />
            <Text style={styles.error}>Oups ! Problème de chargement</Text>
            <CustomButton
              title="Réessayer"
              titleStyle={{ color: Colors.white }}
              pressStyle={[styles.button, styles.retryButton]}
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
              }}
            />
          </View>
        ) : videoDéjàVue ? (
          <Animated.View style={[styles.welcomeBackContainer, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.welcomeBack}>
              Bon retour dans l'univers {langue?.nom} !
            </Text>
            <Text style={styles.welcomeSubtext}>
              Prêt à continuer votre aventure linguistique ?
            </Text>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="🚀 Continuer l'aventure"
                titleStyle={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}
                pressStyle={[styles.button, styles.continueButton]}
                onPress={handleNext}
              />
            </View>
          </Animated.View>
        ) : (
          <>
            {/* CONTRÔLES VIDÉO ÉLÉGANTS */}
            {langue?.video_intro && !videoFinished && (
              <View style={styles.controls}>
                <Pressable style={styles.controlButton} onPress={handlePlayPause}>
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={24} 
                    color="#fff" 
                  />
                </Pressable>
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipText}>Passer</Text>
                  <Ionicons name="play-forward" size={16} color="#fff" />
                </Pressable>
              </View>
            )}

            {!langue?.video_intro && !hasError && (
              <View style={styles.noVideoContainer}>
                <Ionicons name="videocam-off" size={64} color="#ff9800" />
                <Text style={styles.noVideoText}>Vidéo non disponible</Text>
                <Text style={styles.noVideoSubtext}>
                  Mais ne vous inquiétez pas, l'aventure peut commencer !
                </Text>
              </View>
            )}

            {videoFinished && (
              <Animated.View style={[styles.finishedContainer, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
                  <Ionicons name="rocket" size={64} color="#FFD700" />
                </Animated.View>
                <Text style={styles.finishedTitle}>Fantastique !</Text>
                <Text style={styles.finishedSubtext}>
                  Vous êtes prêt à explorer {langue?.nom}
                </Text>
                <View style={styles.buttonContainer}>
                  <CustomButton
                    title="✨ Commencer l'apprentissage"
                    titleStyle={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}
                    pressStyle={[styles.button, styles.startButton]}
                    onPress={handleNext}
                  />
                </View>
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>

      {/* BARRE DE PROGRESSION MODERNE */}
      {langue?.video_intro && !videoDéjàVue && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default WelcomeVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
  },
  dynamicOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
  },
  backButtonPress: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 50,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  languageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 30,
  },
  languageName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFD700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  sparkle: {
    position: "absolute",
    top: -10,
    right: -30,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 30,
  },
  controlButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    padding: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  skipText: {
    color: "#fff",
    marginRight: 8,
    fontWeight: "600",
  },
  welcomeBackContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeBack: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  finishedContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successIcon: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 60,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  finishedTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  finishedSubtext: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  noVideoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noVideoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ff9800",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  noVideoSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  errorContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  error: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ff5722",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    borderBottomWidth: 4,
    borderBottomColor: "#388E3C",
  },
  startButton: {
    backgroundColor: "#FF6B35",
    borderBottomWidth: 4,
    borderBottomColor: "#E53E3E",
  },
  retryButton: {
    backgroundColor: "#2196F3",
    borderBottomWidth: 4,
    borderBottomColor: "#1976D2",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  progressBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    marginRight: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#FFD700",
    borderRadius: 3,
    shadowColor: "#FFD700",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 4,
  },
  progressText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
    textAlign: "center",
  },
});