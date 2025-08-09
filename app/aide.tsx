import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color';
import Icon from 'react-native-vector-icons/FontAwesome';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Aide() {
  const router = useRouter();

  const openSupport = () => {
    Linking.openURL('mailto:duranekamer237@gmail.com?subject=Besoin d’aide sur l’application Mulema');
  };

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/sage.png')} style={styles.illustration} />
        <Text style={styles.title}>Besoin d’aide ? 🤔</Text>
        <Text style={styles.subtitle}>On est là pour toi ! Pose ta question, explore nos réponses ⤵️</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Questions fréquentes</Text>

        {FAQ_LIST.map((faq, idx) => (
          <TouchableOpacity key={idx} style={styles.card} activeOpacity={0.9} onPress={handleToggle}>
            <Text style={styles.q}>💬 {faq.question}</Text>
            <Text style={styles.a}>{faq.answer}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>✉️ Encore besoin d'aide ?</Text>
        <Text style={styles.helpText}>Contacte notre équipe, on te répondra rapidement !</Text>
        <TouchableOpacity style={styles.supportButton} onPress={openSupport}>
          <Icon name="envelope" size={18} color="#fff" />
          <Text style={styles.supportText}>Contacter le support</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Revenir en arrière</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const FAQ_LIST = [
  {
    question: 'Comment fonctionne Mulema ?',
    answer: '🎯 Mulema utilise des exercices interactifs, un système de points XP et des animations pour rendre l’apprentissage des langues camerounaises amusant et motivant.',
  },
  {
    question: 'Puis-je apprendre plusieurs langues ?',
    answer: '🌍 Oui ! Tu peux choisir une langue principale et en ajouter d’autres à tout moment depuis tes paramètres.',
  },
  {
    question: 'Comment gagner des XP ?',
    answer: '⚡ En réalisant les leçons, les quiz, et en te connectant chaque jour. Gagne plus de XP en complétant des défis !',
  },
  {
    question: 'Que faire si je perds mes progrès ?',
    answer: '🔒 Assure-toi d’être connecté avec ton compte. Tes données sont sauvegardées et synchronisées automatiquement.',
  },
  {
    question: 'Comment signaler un bug ou une erreur ?',
    answer: '🐞 Clique sur "Contacter le support" ou écris à notre équipe via l’e-mail indiqué. Merci de nous aider à améliorer l’appli !',
  },
  {
    question: 'Est-ce que l’app est gratuite ?',
    answer: '💸 Oui, Mulema est entièrement gratuite pour apprendre. Des fonctionnalités premium pourraient arriver plus tard.',
  },
  {
    question: 'Puis-je utiliser Mulema hors ligne ?',
    answer: '📴 Certaines leçons sont disponibles hors ligne si elles ont été déjà chargées. Une vraie connexion est recommandée pour la meilleure expérience.',
  },
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F7FB',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.logo,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  q: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.logo,
    marginBottom: 8,
  },
  a: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  helpSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 5,
  },
  helpText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  supportButton: {
    backgroundColor: Colors.logo,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.logo,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  supportText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
});
