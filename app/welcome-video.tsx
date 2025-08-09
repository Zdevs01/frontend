import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  StatusBar,
} from "react-native";
import { Video } from "expo-av";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/assets/fonts/color";
import { CustomButton } from "@/components/CustomButton";

import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet


const WelcomeVideo = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [langue, setLangue] = useState(null);
  const [videoFinished, setVideoFinished] = useState(false);
  const [videoDéjàVue, setVideoDéjàVue] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLangue = async () => {
      try {
       const res = await fetch(`${API_URL}/api/languages`);


        const data = await res.json();
        const langueChoisie = data.find((l) => l.id == id);
        setLangue(langueChoisie || null);
      } catch (error) {
        console.error("Erreur fetch langue :", error);
      }
    };
    if (id) fetchLangue();
  }, [id]);

  useEffect(() => {
    const checkSiVue = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
      const res = await fetch(
  `${API_URL}/api/user/video-viewed/${userId}/${id}`
);

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
      return () => {
        if (videoRef.current) videoRef.current.pauseAsync();
      };
    }, [])
  );

  const handleVideoEnd = async () => {
    setVideoFinished(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

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

  const handleNext = () => {
    if (id == 1) router.push("/home2");
    else if (id == 2) router.push("/home4");
    else if (id == 3) router.push("/home3");
    else router.push("/home2");
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* VIDEO CENTREE, NON COUPEE */}
      {langue?.video_intro && (
        <Video
          ref={videoRef}
          source={{ uri: String(langue.video_intro) }}
          style={[styles.video, { width, height }]}
          resizeMode="contain"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded) return;
            const { positionMillis, durationMillis, didJustFinish } = status;
            if (durationMillis && positionMillis) {
              setProgress(positionMillis / durationMillis);
            }
            if (didJustFinish && !videoFinished) {
              handleVideoEnd();
            }
          }}
        />
      )}

      {/* OVERLAY POUR CONTRASTE */}
      <View style={styles.overlay} />

      {/* CONTENU TEXTE */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>🎧 Plonge dans la langue :</Text>
        <Text style={styles.languageName}>🗣️ {langue?.nom || "Langue inconnue"}</Text>

        {!langue ? (
          <ActivityIndicator size="large" color={Colors.logo} />
        ) : videoDéjàVue ? (
          <>
            <Text style={styles.welcomeBack}>
              👋 Bienvenue à nouveau dans la langue {langue.nom} !
            </Text>
            <Animated.View style={[styles.buttonWrapper, { opacity: 1 }]}>
              <CustomButton
                title="➡️ Continuer"
                titleStyle={{ color: Colors.white }}
                pressStyle={styles.button}
                onPress={handleNext}
              />
            </Animated.View>
          </>
        ) : (
          <>
            {!langue.video_intro && (
              <Text style={styles.error}>🚫 Vidéo non disponible.</Text>
            )}
            {videoFinished && (
              <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim }]}>
                <CustomButton
                  title="➡️ Suivant"
                  titleStyle={{ color: Colors.white }}
                  pressStyle={styles.button}
                  onPress={handleNext}
                />
              </Animated.View>
            )}
          </>
        )}
      </View>

      {/* BARRE DE PROGRESSION */}
      <View style={styles.progressBarWrapper}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

export default WelcomeVideo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  languageName: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.logo,
    marginBottom: 20,
  },
  welcomeBack: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  buttonWrapper: {
    marginTop: 30,
    width: "70%",
  },
  button: {
    backgroundColor: Colors.logo2,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 4,
    borderColor: Colors.logo,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 30,
    textAlign: "center",
  },
  progressBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#444",
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.logo2,
  },
});
