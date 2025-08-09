import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Clipboard,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const showNotif = () => {
    setShowNotification(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setShowNotification(false));
    }, 5000);
  };

  const handleHelp = () => {
    if (!email) return;
    Clipboard.setString('infodevs03@gmail.com');
    showNotif();
  };

  return (
    <View style={styles.container}>
      <View style={styles.assistantContainer}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4140/4140043.png' }}
          style={styles.avatar}
        />
        <View style={styles.assistantBubble}>
          <Text style={styles.assistantText}>
            Bonjour, je suis le Grand Sage, votre assistant virtuel pour vous aider à récupérer votre mot de passe.
          </Text>
        </View>
      </View>

      <Text style={styles.title}>🔑 Mot de passe oublié ?</Text>
      <Text style={styles.subtitle}>
        Entrez votre email pour que je puisse vous aider à récupérer votre compte.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="exemple@email.com"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable style={styles.button} onPress={handleHelp}>
        <Text style={styles.buttonText}>📬 Demander de l'aide</Text>
      </Pressable>

      {/* Lien vers /login */}
      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.loginLink}>← Connecte-toi ici 👋</Text>
      </Pressable>

      {showNotification && (
        <Animated.View
          style={[
            styles.notification,
            {
              transform: [{ translateY: slideAnim }, { scale: bounceAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.notificationText}>✅ Une assistance a été proposée.</Text>
          <Text style={styles.notificationSubText}>
            Contactez-nous à{' '}
            <Text style={styles.supportEmail}>infodevs03@gmail.com</Text> (copié dans le presse-papiers)
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  assistantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#50C878',
    backgroundColor: '#fff',
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: '#50C878',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#50C878',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  assistantText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3B2D',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#2F4F4F',
    marginBottom: 22,
    textAlign: 'center',
    maxWidth: 360,
    fontWeight: '500',
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    fontSize: 17,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#2D2A32',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 50,
    elevation: 5,
    shadowColor: '#2E7D32',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#DFF6DD',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E7D32',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  notification: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: '#D1F2D8',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 25,
    maxWidth: width * 0.9,
    shadowColor: '#50C878',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 6,
    textAlign: 'center',
  },
  notificationSubText: {
    fontSize: 15,
    color: '#1B3B2D',
    textAlign: 'center',
  },
  supportEmail: {
    fontWeight: 'bold',
    color: '#145A32',
    textDecorationLine: 'underline',
  },
});
