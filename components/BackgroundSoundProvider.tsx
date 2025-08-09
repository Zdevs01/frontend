import React, { useEffect, useRef } from "react";
import { Audio } from "expo-av";

export default function BackgroundSoundProvider() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    const playBackgroundSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/mood.mp3"),
          {
            isLooping: true,
            volume: 0.2, // Volume doux
            shouldPlay: true,
          }
        );

        if (isMounted) {
          soundRef.current = sound;

          // Gestion pause/reprise automatique
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) return;

            // Rejoue si le son est stoppé mais toujours requis
            if (
              status.didJustFinish === false &&
              status.isPlaying === false &&
              status.isLooping
            ) {
              sound.playAsync();
            }
          });
        }
      } catch (error) {
        console.error("Erreur lecture fond sonore :", error);
      }
    };

    playBackgroundSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return null; // Pas de rendu visible
}
