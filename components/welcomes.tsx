import Colors from "@/assets/fonts/color";
import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Text,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

export default function LoadingScreen() {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedValues = useRef([]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  const text = "muléma".split("");
  const subtitle = "Langues Camerounaises".split("");

  // Initialisation des animations pour les lettres principales
  if (animatedValues.length === 0) {
    text.forEach(() => {
      animatedValues.push({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(30),
        scale: new Animated.Value(0.5),
      });
    });
  }

  // Initialisation des animations pour le sous-titre
  const subtitleAnimatedValues = useRef([]).current;
  if (subtitleAnimatedValues.length === 0) {
    subtitle.forEach(() => {
      subtitleAnimatedValues.push({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(20),
      });
    });
  }

  // Animation de pulsation continue
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animation de rotation subtile
  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, []);

  // Animation des sparkles
  useEffect(() => {
    const sparkle = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    sparkle.start();
    return () => sparkle.stop();
  }, []);

  // Animation d'entrée générale
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation de la montée (noix qui se fissure)
  useEffect(() => {
    const steps = 8;
    const totalDuration = 4000;
    const stepDuration = totalDuration / steps;

    const stepValues = Array.from({ length: steps }, (_, i) => i / (steps - 1));

    const animations = stepValues.map((toValue) =>
      Animated.timing(animatedHeight, {
        toValue,
        duration: stepDuration,
        useNativeDriver: false,
      })
    );

    Animated.sequence(animations).start();
  }, [animatedHeight]);

  // Animation des lettres principales
  useEffect(() => {
    const animations = animatedValues.map(({ opacity, translateY, scale }, index) =>
      Animated.sequence([
        Animated.delay(index * 200 + 1000), // Délai initial plus long
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.stagger(150, animations).start();
  }, [animatedValues]);

  // Animation du sous-titre
  useEffect(() => {
    const subtitleAnimations = subtitleAnimatedValues.map(({ opacity, translateY }, index) =>
      Animated.sequence([
        Animated.delay(index * 100 + 2500), // Après les lettres principales
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.stagger(80, subtitleAnimations).start();
  }, [subtitleAnimatedValues]);

  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Gradient de fond dynamique */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Particules flottantes */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                opacity: sparkleAnim,
                transform: [
                  {
                    translateY: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                  {
                    rotate: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={12} color="#FFD700" />
          </Animated.View>
        ))}
      </View>

      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Container de l'animation centrale */}
        <Animated.View 
          style={[
            styles.case,
            {
              transform: [
                { scale: pulseAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.shadowContainer}>
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.3)', 'rgba(255, 193, 7, 0.1)']}
              style={styles.glowEffect}
            />
            
            <View style={styles.img}>
              <Image
                source={require("@/assets/images/noix.png")}
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <Animated.View
              style={[
                styles.animatedContainer,
                {
                  height: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <Image
                source={require("@/assets/images/fisure2.png")}
                style={styles.images}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Titre principal avec animations */}
        <View style={styles.titleContainer}>
          <View style={styles.letterRow}>
            {text.map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.textload,
                  {
                    opacity: animatedValues[index]?.opacity || 0,
                    transform: [
                      { translateY: animatedValues[index]?.translateY || 30 },
                      { scale: animatedValues[index]?.scale || 0.5 },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>
          
          {/* Accent décoratif */}
          <Animated.View 
            style={[
              styles.accent,
              {
                opacity: fadeAnim,
                transform: [{ scaleX: fadeAnim }]
              }
            ]} 
          />
        </View>

        {/* Sous-titre */}
        <View style={styles.subtitleContainer}>
          <View style={styles.subtitleRow}>
            {subtitle.map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.subtitleText,
                  {
                    opacity: subtitleAnimatedValues[index]?.opacity || 0,
                    transform: [
                      { translateY: subtitleAnimatedValues[index]?.translateY || 20 },
                    ],
                  },
                ]}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </Animated.Text>
            ))}
          </View>
        </View>

        {/* Indicateur de chargement moderne */}
        <Animated.View style={[styles.loadingIndicator, { opacity: fadeAnim }]}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                    opacity: sparkleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.loadingText}>Chargement de votre expérience...</Text>
        </Animated.View>
      </Animated.View>

      {/* Footer culturel */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Ionicons name="leaf" size={16} color="#4CAF50" />
        <Text style={styles.footerText}>Découvrez la richesse linguistique du Cameroun</Text>
        <Ionicons name="leaf" size={16} color="#4CAF50" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
  },
  mainContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  case: {
    overflow: "hidden",
    width: width * 0.3,
    height: height * 0.3,
    position: "relative",
    marginBottom: 40,
  },
  shadowContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    borderRadius: width * 0.15,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width * 0.15,
  },
  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: width * 0.15,
    overflow: "hidden",
  },
  image: {
    width: "70%",
    height: "70%",
  },
  animatedContainer: {
    width: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: width * 0.15,
    overflow: "hidden",
  },
  images: {
    width: 35,
    height: "60%",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  letterRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  textload: {
    fontSize: 38,
    color: "#FFD700",
    fontWeight: "900",
    fontFamily: "Nunito-Regular",
    marginHorizontal: 1,
    textShadowColor: "rgba(255, 215, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  accent: {
    width: 80,
    height: 4,
    backgroundColor: "#FF6B35",
    borderRadius: 2,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  subtitleContainer: {
    marginBottom: 40,
  },
  subtitleRow: {
    flexDirection: "row",
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  loadingIndicator: {
    alignItems: "center",
    marginTop: 30,
  },
  dots: {
    flexDirection: "row",
    marginBottom: 15,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginHorizontal: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontStyle: "italic",
    marginHorizontal: 8,
    textAlign: "center",
  },
});