import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color.js';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Aide() {
  const router = useRouter();

  const openSupport = () => {
    Linking.openURL('mailto:support@mulema.app?subject=Besoin d’aide sur l’application Mulema');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/sage.png')} style={styles.illustration} />
        <Text style={styles.title}>Besoin d’aide ?</Text>
        <Text style={styles.subtitle}>Nous sommes là pour vous accompagner !</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Questions fréquentes</Text>

        <View style={styles.card}>
          <Text style={styles.q}>Comment fonctionne Mulema ?</Text>
          <Text style={styles.a}>
            Mulema vous propose des leçons gamifiées pour apprendre les langues du Cameroun à votre rythme. Gagnez des XP, passez des niveaux et explorez votre culture !
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.q}>Puis-je apprendre plusieurs langues ?</Text>
          <Text style={styles.a}>
            Oui ! Vous pouvez choisir une langue principale et en ajouter d'autres dans vos paramètres.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.q}>Comment signaler un bug ou un problème ?</Text>
          <Text style={styles.a}>
            Cliquez sur le bouton "Contacter le support" ci-dessous ou envoyez-nous un e-mail directement.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.supportButton} onPress={openSupport}>
        <Icon name="envelope" size={18} color="#fff" />
        <Text style={styles.supportText}>Contacter le support</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Revenir en arrière</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 30,
  },
  illustration: {
    width: 100,
    height: 100,
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
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  q: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.logo,
    marginBottom: 6,
  },
  a: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: Colors.logo,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
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
