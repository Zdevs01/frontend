import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color.js';
import Nav from '@/components/Nav';

export default function Exercices2() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf')
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
      <Nav />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.languageBox, { opacity: fadeAnim }]}>
          <Text style={styles.languageTitle}>Langue : Douala 🇨🇲</Text>
        </Animated.View>

        <Animated.View style={[styles.welcomeBox, { opacity: fadeAnim }]}>
          <Text style={styles.title}>🎓 Bienvenue sur l’interface des exercices !</Text>
          <Text style={styles.text}>
            Ici commence ton voyage interactif dans l’apprentissage des langues patrimoniales. Chaque exercice est conçu
            pour renforcer ta compréhension et ton expression, tout en rendant l’expérience ludique et motivante.
          </Text>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], marginTop: 30 }}>
          <View style={styles.infoBox}>
            <Text style={styles.subtitle}>📚 Structure des exercices</Text>
            <Text style={styles.text}>
              L’application comprend 4 thèmes (Téma 0 à Téma 3), chacun composé de 3 exercices interactifs.
              Chaque thème te plonge dans un univers de mots, d’audios, d’images et d’animations.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.infoBox}>
          <Text style={styles.subtitle}>🔓 Déblocage progressif</Text>
          <Text style={styles.text}>
            Les leçons se débloquent après certains exercices, t’offrant un accès progressif au contenu, pour mieux assimiler.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.subtitle}>💠 Le système de cauris</Text>
          <Text style={styles.text}>
            Tu débutes avec 5 cauris (vies). Une erreur ? Tu perds un cauris. Chaque cauris se régénère automatiquement
            après 9 minutes. Gère-les bien pour maximiser ta progression !
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/home4')}>
          <Text style={styles.startText}>Commencer les exercices ➜</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.alphabetButton} onPress={() => router.push('/alphabassa')}>
          <Text style={styles.alphabetText}>🔤 Voir l’alphabet bassa</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fefcf8',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  languageBox: {
    backgroundColor: '#e0f7f2',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  languageTitle: {
    fontSize: 18,
    color: Colors.logo,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: 'bold',
  },
  welcomeBox: {
    backgroundColor: '#fff3d9',
    padding: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.logo,
    fontFamily: 'SpaceMono-Regular',
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: Colors.logo,
    fontFamily: 'SpaceMono-Regular',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  startButton: {
    backgroundColor: Colors.logo,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 40,
    elevation: 4,
  },
  startText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alphabetButton: {
    backgroundColor: '#e3eaff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.logo,
  },
  alphabetText: {
    color: Colors.logo,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
