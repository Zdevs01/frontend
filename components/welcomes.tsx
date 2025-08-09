import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Text,
} from "react-native";
import { Video, Audio } from "expo-av";
import { useRouter } from "expo-router";

const introVideo = require("../assets/videos/intro.mp4");
const { width, height } = Dimensions.get("window");

export default function LoadingScreen() {
  const videoRef = useRef(null);
  const soundRef = useRef(null);
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    console.log("🎬 LoadingScreen DÉMARRÉ");
    
    let isMounted = true;

    // Configuration audio
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/mood.mp3"),
          { shouldPlay: true, volume: 0.3 }
        );
        
        if (isMounted) {
          soundRef.current = sound;
          console.log("✅ Audio démarré");
        }
      } catch (error) {
        console.log("❌ Erreur audio:", error);
      }
    };

    setupAudio();

    // TIMER DIRECT - Navigation après exactement 4 secondes
    const startTime = Date.now();
    console.log("⏱️ Timer 4s lancé à:", new Date().toLocaleTimeString());

    // Compteurs individuels pour le debug
    const timer1 = setTimeout(() => {
      if (isMounted) {
        console.log("⏰ 3 secondes restantes");
        setCountdown(3);
      }
    }, 1000);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        console.log("⏰ 2 secondes restantes");
        setCountdown(2);
      }
    }, 2000);

    const timer3 = setTimeout(() => {
      if (isMounted) {
        console.log("⏰ 1 seconde restante");
        setCountdown(1);
      }
    }, 3000);

    // NAVIGATION EXACTEMENT À 4 SECONDES
    const navigationTimer = setTimeout(() => {
      if (isMounted) {
        const duration = Date.now() - startTime;
        console.log("🚀 NAVIGATION après", duration, "ms");
        
        // Cleanup audio
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
        }
        
        // Navigation
        router.replace("/login");
      }
    }, 4000); // EXACTEMENT 4000ms

    // Cleanup function
    return () => {
      console.log("🧹 CLEANUP LoadingScreen");
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(navigationTimer);
      
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []); // PAS de dépendances pour éviter les re-renders

  const onVideoLoad = (status) => {
    console.log("📹 Vidéo:", status.isLoaded ? "chargée" : "en cours...");
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Vidéo */}
      <Video
        ref={videoRef}
        source={introVideo}
        style={styles.video}
        shouldPlay={true}
        isLooping={false}
        resizeMode="cover"
        onLoad={onVideoLoad}
        useNativeControls={false}
        volume={1.0}
      />
      
      {/* Compteur visible */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{countdown}s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  counter: {
    position: 'absolute',
    top: 80,
    right: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  counterText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
});