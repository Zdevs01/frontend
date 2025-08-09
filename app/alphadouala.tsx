import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Colors from '@/assets/fonts/color';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Alphabet avec correspondance française
const doualaAlphabet = [
  { lettre: 'A', fr: 'a' },
  { lettre: 'B', fr: 'bé' },
  { lettre: 'D', fr: 'dé' },
  { lettre: 'Ɛ', fr: 'è' },
  { lettre: 'F', fr: 'èf' },
  { lettre: 'G', fr: 'gué' },
  { lettre: 'H', fr: 'ash' },
  { lettre: 'I', fr: 'i' },
  { lettre: 'K', fr: 'ka' },
  { lettre: 'L', fr: 'èl' },
  { lettre: 'M', fr: 'èm' },
  { lettre: 'N', fr: 'èn' },
  { lettre: 'Ŋ', fr: 'ng' },
  { lettre: 'O', fr: 'o' },
  { lettre: 'Ɔ', fr: 'ɔ' },
  { lettre: 'P', fr: 'pé' },
  { lettre: 'R', fr: 'èr' },
  { lettre: 'S', fr: 'ès' },
  { lettre: 'T', fr: 'té' },
  { lettre: 'U', fr: 'ou' },
  { lettre: 'V', fr: 'vé' },
  { lettre: 'W', fr: 'wé' },
  { lettre: 'Y', fr: 'yé' },
  { lettre: 'Z', fr: 'zèd' },
];

export default function AlphaDouala() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const animValues = useRef(doualaAlphabet.map(() => new Animated.Value(0))).current;
  const clickScales = useRef(doualaAlphabet.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.stagger(100, animValues.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  if (!fontsLoaded) return null;

  const handlePress = (index: number) => {
    Animated.sequence([
      Animated.timing(clickScales[index], {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(clickScales[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🔤 Alphabet Douala Officiel</Text>
        <Text style={styles.subtitle}>
          Explore les lettres utilisées dans l’écriture de la langue Douala.
        </Text>

        <View style={styles.grid}>
          {doualaAlphabet.map((item, index) => {
            const scaleAnim = animValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            });

            const combinedScale = Animated.multiply(scaleAnim, clickScales[index]);

            return (
              <TouchableWithoutFeedback key={index} onPress={() => handlePress(index)}>
                <Animated.View style={[styles.cell, { transform: [{ scale: combinedScale }] }]}>
                  <Text style={styles.letter}>{item.lettre}</Text>
                  <Text style={styles.frText}>{item.fr}</Text>
                </Animated.View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>

        <Text style={styles.footer}>
          📘 Cet alphabet respecte les conventions Bantu et Douala modernes.
        </Text>

        <View style={{ height: 100 }} /> {/* espace pour le bouton */}
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>⬅ Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fffef6',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    color: Colors.logo,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono-Regular',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cell: {
    width: width / 5,
    height: width / 4,
    backgroundColor: '#ffe9b0',
    margin: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    paddingVertical: 8,
  },
  letter: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.logo,
    fontFamily: 'SpaceMono-Regular',
  },
  frText: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
    fontFamily: 'SpaceMono-Regular',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: Colors.logo,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono-Regular',
  },
});
