// components/son.js
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';

// Gestionnaire singleton pour une seule instance de son
class BackgroundSoundManager {
  constructor() {
    if (BackgroundSoundManager.instance) {
      return BackgroundSoundManager.instance;
    }
    
    this.sound = null;
    this.isPlaying = false;
    this.currentVolume = 0.15;
    this.isInitialized = false;
    this.activeComponents = new Set();
    this.isTransitioning = false; // Pour éviter les doublons pendant les transitions
    
    BackgroundSoundManager.instance = this;
  }

  static getInstance() {
    if (!BackgroundSoundManager.instance) {
      BackgroundSoundManager.instance = new BackgroundSoundManager();
    }
    return BackgroundSoundManager.instance;
  }

  // Initialiser l'audio
  async initialize(volume = 0.15) {
    if (this.isInitialized) return;

    try {
      console.log("🎵 Initialisation du son d'arrière-plan...");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/mood.mp3'),
        {
          isLooping: true,
          volume: 0,
          shouldPlay: false,
        }
      );

      this.sound = sound;
      this.currentVolume = volume;
      this.isInitialized = true;

      console.log("✅ Son d'arrière-plan initialisé");

    } catch (error) {
      console.error("❌ Erreur initialisation audio:", error);
    }
  }

  // Ajouter un composant actif
  async addActiveComponent(componentId) {
    console.log(`📱 Tentative d'ajout composant: ${componentId}`);
    
    // Éviter les doublons
    if (this.activeComponents.has(componentId)) {
      console.log(`⚠️ Composant ${componentId} déjà actif`);
      return;
    }

    this.activeComponents.add(componentId);
    console.log(`✅ Composant ajouté: ${componentId}. Total: ${this.activeComponents.size}`);
    
    // Démarrer le son seulement si ce n'est pas déjà en cours et qu'on n'est pas en transition
    if (!this.isPlaying && !this.isTransitioning && this.activeComponents.size === 1) {
      await this.play();
    }
  }

  // Retirer un composant actif
  async removeActiveComponent(componentId) {
    if (!this.activeComponents.has(componentId)) {
      return;
    }

    this.activeComponents.delete(componentId);
    console.log(`📱 Composant retiré: ${componentId}. Total: ${this.activeComponents.size}`);
    
    // Arrêter le son si aucun composant actif (avec délai pour éviter coupures pendant navigation)
    if (this.activeComponents.size === 0) {
      this.isTransitioning = true;
      setTimeout(async () => {
        // Vérifier à nouveau après le délai
        if (this.activeComponents.size === 0 && this.isPlaying) {
          await this.stop();
        }
        this.isTransitioning = false;
      }, 500); // Délai de 500ms pour les transitions
    }
  }

  // Vérifier s'il y a des composants actifs
  hasActiveComponents() {
    return this.activeComponents.size > 0;
  }

  // Jouer le son seulement s'il y a des composants actifs
  async play() {
    // Vérifications strictes
    if (!this.sound || this.isPlaying || !this.hasActiveComponents() || this.isTransitioning) {
      console.log(`❌ Impossible de jouer: sound=${!!this.sound}, isPlaying=${this.isPlaying}, hasActive=${this.hasActiveComponents()}, transitioning=${this.isTransitioning}`);
      return;
    }

    try {
      console.log("🔄 Démarrage du son...");
      await this.sound.playAsync();
      this.isPlaying = true;
      await this.fadeIn();
      console.log("▶️ Son démarré avec succès");
    } catch (error) {
      console.error("❌ Erreur lecture:", error);
      this.isPlaying = false;
    }
  }

  // Arrêter le son
  async stop() {
    if (!this.sound || !this.isPlaying) return;

    try {
      console.log("🔄 Arrêt du son...");
      await this.fadeOut();
      await this.sound.pauseAsync();
      await this.sound.setPositionAsync(0); // Remettre au début
      this.isPlaying = false;
      console.log("⏹️ Son arrêté");
    } catch (error) {
      console.error("❌ Erreur arrêt:", error);
    }
  }

  // Force l'arrêt (pour debug)
  async forceStop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.setPositionAsync(0);
        this.isPlaying = false;
        this.activeComponents.clear();
        console.log("🛑 Son forcé d'arrêter");
      } catch (error) {
        console.error("❌ Erreur arrêt forcé:", error);
      }
    }
  }

  // Changer le volume
  async setVolume(volume) {
    if (!this.sound) return;
    
    this.currentVolume = Math.max(0, Math.min(1, volume));
    
    try {
      await this.sound.setVolumeAsync(this.currentVolume);
      console.log(`🔊 Volume changé: ${this.currentVolume}`);
    } catch (error) {
      console.error("❌ Erreur volume:", error);
    }
  }

  // Fade-in plus rapide
  async fadeIn(duration = 1500) {
    if (!this.sound) return;

    const steps = 15;
    const stepDuration = duration / steps;
    const volumeStep = this.currentVolume / steps;

    for (let i = 0; i <= steps; i++) {
      if (!this.isPlaying) break; // Arrêter le fade si le son est arrêté
      const volume = volumeStep * i;
      await this.sound.setVolumeAsync(volume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  // Fade-out plus rapide
  async fadeOut(duration = 800) {
    if (!this.sound) return;

    const steps = 8;
    const stepDuration = duration / steps;
    const volumeStep = this.currentVolume / steps;

    for (let i = steps; i >= 0; i--) {
      const volume = volumeStep * i;
      await this.sound.setVolumeAsync(volume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  // Getters
  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentVolume() {
    return this.currentVolume;
  }

  getActiveComponentsCount() {
    return this.activeComponents.size;
  }

  getActiveComponents() {
    return Array.from(this.activeComponents);
  }

  // Debug info
  getDebugInfo() {
    return {
      isPlaying: this.isPlaying,
      isInitialized: this.isInitialized,
      activeComponents: this.activeComponents.size,
      activeIds: Array.from(this.activeComponents),
      isTransitioning: this.isTransitioning,
      currentVolume: this.currentVolume
    };
  }

  // Nettoyer complètement
  async cleanup() {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
        this.isInitialized = false;
        this.activeComponents.clear();
        this.isTransitioning = false;
        console.log("🧹 Son complètement nettoyé");
      } catch (error) {
        console.error("❌ Erreur nettoyage:", error);
      }
    }
  }
}

// Hook personnalisé avec meilleur contrôle
export const useBackgroundSound = (options = {}) => {
  const { volume = 0.15, autoPlay = true } = options;
  const soundManager = useRef(BackgroundSoundManager.getInstance());
  const componentId = useRef(`bg_sound_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
  const isRegistered = useRef(false);

  useEffect(() => {
    const initAndRegister = async () => {
      // Éviter les doubles enregistrements
      if (isRegistered.current) {
        console.log(`⚠️ Composant ${componentId.current} déjà enregistré`);
        return;
      }

      const manager = soundManager.current;
      const id = componentId.current;
      
      console.log(`🚀 Initialisation composant son: ${id}`);
      
      try {
        // Initialiser le gestionnaire
        await manager.initialize(volume);
        
        // Enregistrer ce composant comme actif
        await manager.addActiveComponent(id);
        isRegistered.current = true;
        
        console.log(`✅ Composant son ${id} initialisé et enregistré`);
        
      } catch (error) {
        console.error(`❌ Erreur initialisation composant ${id}:`, error);
      }
    };

    initAndRegister();

    // Cleanup strict quand le composant se démonte
    return () => {
      if (isRegistered.current) {
        const manager = soundManager.current;
        const id = componentId.current;
        
        console.log(`🗑️ Nettoyage composant: ${id}`);
        manager.removeActiveComponent(id);
        isRegistered.current = false;
      }
    };
  }, []); // Dépendances vides pour éviter les ré-exécutions

  // Mettre à jour le volume si changé
  useEffect(() => {
    if (isRegistered.current) {
      soundManager.current.setVolume(volume);
    }
  }, [volume]);

  return {
    play: () => soundManager.current.play(),
    stop: () => soundManager.current.stop(),
    forceStop: () => soundManager.current.forceStop(),
    setVolume: (vol) => soundManager.current.setVolume(vol),
    isPlaying: soundManager.current.getIsPlaying(),
    currentVolume: soundManager.current.getCurrentVolume(),
    activeComponents: soundManager.current.getActiveComponentsCount(),
    debugInfo: soundManager.current.getDebugInfo(),
    componentId: componentId.current,
  };
};

// Composant React - LE SON NE JOUE QUE SI CE COMPOSANT EST PRÉSENT
export default function BackgroundSound(props = {}) {
  const soundControls = useBackgroundSound(props);
  
  // Log pour debug
  useEffect(() => {
    console.log(`🎵 BackgroundSound component mounted - ID: ${soundControls.componentId}`);
    console.log(`📊 Debug info:`, soundControls.debugInfo);
    
    return () => {
      console.log(`🎵 BackgroundSound component unmounted - ID: ${soundControls.componentId}`);
    };
  }, []);
  
  return null; // Composant invisible
}

// Export du gestionnaire pour contrôle manuel et debug
export const backgroundSoundManager = BackgroundSoundManager.getInstance();

// Fonction utilitaire pour debug
export const debugBackgroundSound = () => {
  const manager = BackgroundSoundManager.getInstance();
  console.log("🔍 Debug Background Sound:", manager.getDebugInfo());
  return manager.getDebugInfo();
};

// Fonction pour forcer l'arrêt (utile en développement)
export const forceStopBackgroundSound = () => {
  const manager = BackgroundSoundManager.getInstance();
  return manager.forceStop();
};
