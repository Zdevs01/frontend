import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, KeyboardAvoidingView,
  Platform, Animated, ScrollView, TouchableOpacity, Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color';
import { Audio } from 'expo-av';

const welcomeMessages = [
  "👋 Salutations, je suis le Grand Sage de Mulema !",
  "🧠 Je suis votre guide spirituel et linguistique personnel.",
  "📚 Je détiens la sagesse ancestrale des langues camerounaises.",
  "🌟 Je peux vous accompagner dans votre quête d'apprentissage.",
  "🚀 Ensemble, nous explorerons les trésors de nos langues patrimoniales !",
  "💬 Posez-moi vos questions, je suis là pour vous éclairer.",
  "🔮 Que votre voyage linguistique commence !"
];

const defaultQuestions = [
  { id: 1, question: "Comment utiliser l'application ?", emoji: "📱" },
  { id: 2, question: "Comment contacter le support technique ?", emoji: "🛠️" },
  { id: 3, question: "Combien de langues comporte Mulema ?", emoji: "🗣️" },
  { id: 4, question: "Comment fonctionne le système de cauris ?", emoji: "🐚" },
  { id: 5, question: "Quand aura lieu la prochaine mise à jour ?", emoji: "🔄" }
];

const predefinedResponses = {
  1: `🎯 **Bienvenue dans votre voyage linguistique !**

Ici commence votre aventure interactive dans l'apprentissage des langues patrimoniales. Chaque exercice est conçu pour renforcer votre compréhension et votre expression, tout en rendant l'expérience ludique et motivante. ✨

📚 **Structure des exercices**
L'application comprend 4 thèmes (Téma 0 à Téma 3), chacun composé de 3 exercices interactifs. Chaque thème vous plonge dans un univers de mots, d'audios, d'images et d'animations magiques ! 🎨

🔓 **Déblocage progressif**
Les leçons se débloquent après certains exercices, vous offrant un accès progressif au contenu, pour mieux assimiler la sagesse ancestrale. 📖

💠 **Le système de cauris**
Vous débutez avec 5 cauris (vies). Une erreur ? Vous perdez un cauris. Chaque cauris se régénère automatiquement après 9 minutes. Gérez-les bien pour maximiser votre progression ! ⏰

Que l'apprentissage commence ! 🌟`,

  2: `🛠️ **Support Technique - Mulema**

Pour toute assistance technique, notre équipe dédiée est à votre service ! 👨‍💻👩‍💻

📧 **Adresse de contact :**
→ **infodevs06@gmail.com**

⚡ **Temps de réponse :**
→ Généralement sous 24h

🔧 **Types de support :**
→ Bugs et dysfonctionnements
→ Questions techniques
→ Suggestions d'amélioration
→ Récupération de compte

N'hésitez pas à nous contacter, nous sommes là pour vous ! 🤝`,

  3: `🗣️ **Langues Disponibles sur Mulema**

Actuellement, Mulema vous offre l'accès à **3 langues camerounaises** authentiques : 🇨🇲

🎯 **Langues disponibles :**
→ **Bassa** - La langue du peuple Bassa
→ **Ghomala'** - La langue des Bamilékés
→ **Duala** - La langue du littoral

🚀 **Prochaines mises à jour :**
Dans les versions futures, d'autres langues plus fun seront ajoutées pour enrichir votre expérience d'apprentissage ! 

Chaque langue a sa propre richesse culturelle à découvrir ! 🌍✨`,

  4: `🐚 **Le Système de Cauris - Votre Énergie Vitale**

Les cauris sont votre énergie d'apprentissage, inspirés de la monnaie ancestrale africaine ! 💰

⚡ **Fonctionnement :**
→ Vous commencez avec **5 cauris**
→ Chaque erreur vous coûte **1 cauris**
→ Régénération automatique : **9 minutes par cauris**

🎯 **Stratégies conseillées :**
→ Réfléchissez avant de répondre
→ Utilisez les indices disponibles
→ Planifiez vos sessions d'apprentissage

🔮 **Astuce du Grand Sage :**
La patience est la clé de la sagesse. Prenez votre temps ! ⏳✨`,

  5: `🔄 **Prochaine Mise à Jour - Mulema**

L'évolution de Mulema est constante ! 🚀

📅 **Prochaines fonctionnalités :**
→ Chat intelligent temps réel
→ Nouvelles langues camerounaises
→ Exercices avancés d'expression orale
→ Système de classement communautaire

🔮 **Le Grand Sage prépare :**
→ Des réponses personnalisées
→ Des conseils adaptatifs
→ Un suivi de progression amélioré

⏰ **Timing :**
Restez connectés pour les annonces officielles ! Chaque mise à jour apporte plus de magie à votre apprentissage. 🌟

Patience, grandes choses arrivent ! 🎯`
};

// Réponses de base pour salutations et questions courantes
const basicResponses = {
  greetings: [
    "👋 Salutations ! Que la sagesse ancestrale vous accompagne aujourd'hui !",
    "🌟 Bonjour ! Le Grand Sage vous accueille avec bienveillance !",
    "✨ Salut ! Prêt pour une aventure linguistique extraordinaire ?",
    "🔮 Bonsoir ! Les étoiles murmurent des secrets linguistiques ce soir !",
    "🌅 Bonjour ! Que cette journée vous apporte la lumière des langues patrimoniales !",
    "🎯 Salut ! Le Grand Sage est honoré de votre présence !",
    "🌙 Bonsoir ! La nuit porte conseil... et apprentissage !",
    "🚀 Hey ! Prêt à explorer les trésors de nos langues camerounaises ?",
    "💫 Salutations ! Votre quête linguistique commence maintenant !",
    "🔥 Bonjour ! L'énergie d'apprentissage est forte aujourd'hui !"
  ],
  thanks: [
    "🙏 C'est un honneur de vous accompagner dans votre apprentissage !",
    "✨ Merci ! Votre gratitude nourrit ma sagesse !",
    "🌟 De rien ! C'est ma mission de vous guider !",
    "💎 Merci ! Ensemble, nous préservons nos langues !",
    "🎯 Avec plaisir ! Votre réussite est ma récompense !",
    "🔮 Merci ! Que la sagesse continue de circuler !",
    "🌸 C'est naturel ! Le partage de connaissance est sacré !",
    "🚀 Merci ! Continuez à briller dans votre apprentissage !",
    "💫 De rien ! Votre progression m'inspire !",
    "🌅 Merci ! Que votre voyage linguistique soit lumineux !"
  ],
  encouragement: [
    "💪 Vous êtes sur la bonne voie ! Persévérez !",
    "🌟 Chaque effort compte ! Vous progressez magnifiquement !",
    "🔥 Votre détermination est admirable ! Continuez !",
    "✨ Bravo ! Votre engagement honore nos ancêtres !",
    "🎯 Excellent ! Vous maîtrisez l'art de l'apprentissage !",
    "🚀 Fantastique ! Votre évolution est remarquable !",
    "💎 Superbe ! Vous brillez de mille feux !",
    "🌈 Magnifique ! Votre parcours inspire !",
    "⭐ Formidable ! Vous touchez aux étoiles !",
    "🔮 Merveilleux ! La sagesse grandit en vous !"
  ],
  farewell: [
    "👋 Au revoir ! Que la sagesse vous accompagne !",
    "🌟 À bientôt ! Continuez à faire briller nos langues !",
    "✨ Salut ! Emportez cette sagesse avec vous !",
    "🔮 Au revoir ! Que vos rêves parlent nos langues !",
    "🌅 À plus tard ! Votre aventure ne fait que commencer !",
    "🎯 Ciao ! Gardez la flamme de l'apprentissage allumée !",
    "💫 À bientôt ! Votre chemin linguistique s'illumine !",
    "🚀 Salut ! Que la force des mots soit avec vous !",
    "🌙 Bonne nuit ! Que les langues bercent vos songes !",
    "🔥 À plus ! Votre passion linguistique rayonne !"
  ]
};

// Système de reconnaissance de mots-clés
const keywordResponses = {
  // Salutations
  'bonjour': 'greetings',
  'bonsoir': 'greetings',
  'salut': 'greetings',
  'hello': 'greetings',
  'hi': 'greetings',
  'hey': 'greetings',
  'coucou': 'greetings',
  'yo': 'greetings',

  // Remerciements
  'merci': 'thanks',
  'thanks': 'thanks',
  'remercie': 'thanks',
  'grateful': 'thanks',
  'reconnaissance': 'thanks',

  // Encouragement
  'difficile': 'encouragement',
  'dur': 'encouragement',
  'compliqué': 'encouragement',
  'aide': 'encouragement',
  'motivate': 'encouragement',
  'décourager': 'encouragement',
  'fatigué': 'encouragement',
  'abandon': 'encouragement',
  'arrêter': 'encouragement',

  // Adieux
  'au revoir': 'farewell',
  'bye': 'farewell',
  'ciao': 'farewell',
  'à bientôt': 'farewell',
  'à plus': 'farewell',
  'goodbye': 'farewell',
  'see you': 'farewell',
  'tchao': 'farewell',

  // Questions sur l'application
  'comment ça marche': 1,
  'comment utiliser': 1,
  'fonctionnement': 1,
  'utilisation': 1,
  'mode d\'emploi': 1,

  // Support
  'problème': 2,
  'bug': 2,
  'erreur': 2,
  'support': 2,
  'contact': 2,
  'aide technique': 2,

  // Langues
  'combien de langues': 3,
  'langues disponibles': 3,
  'languages': 3,
  'dialectes': 3,

  // Cauris
  'cauris': 4,
  'vies': 4,
  'lives': 4,
  'points': 4,

  // Mise à jour
  'mise à jour': 5,
  'update': 5,
  'nouvelle version': 5,
  'nouveauté': 5,
  'quand': 5,
  'bientôt': 5
};

const randomResponses = [
  "🔮 Votre question illumine ma sagesse ! Je prépare une réponse digne de ce nom pour la prochaine mise à jour.",
  "⚡ Excellente interrogation ! Elle rejoint ma base de connaissances pour enrichir mes futures réponses.",
  "🌟 Cette question révèle votre soif d'apprendre ! Elle sera traitée avec soin dans une version future.",
  "📚 Votre curiosité honore nos ancêtres ! Une réponse détaillée vous attend dans la prochaine mise à jour.",
  "🎯 Question pertinente enregistrée ! Le Grand Sage travaille déjà sur une réponse éclairée.",
  "🔥 Votre interrogation nourrit ma sagesse ! Elle sera prochainement intégrée à mes capacités.",
  "💡 Brillante question ! Elle s'ajoute à ma quête de connaissance pour mieux vous servir.",
  "🌍 Cette question enrichit l'esprit collectif ! Une réponse vous attend très bientôt.",
  "⭐ Votre question mérite une réponse exceptionnelle ! Elle arrive dans la prochaine évolution.",
  "🚀 Question enregistrée avec succès ! Mon apprentissage continue pour mieux vous éclairer."
];

export default function Chat() {
  const fadeAnim = useRef(welcomeMessages.map(() => new Animated.Value(0))).current;
  const avatarAnim = useRef(new Animated.Value(1)).current;
  const [showChat, setShowChat] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const delayForMessage = (msg) => {
    const base = 30;
    return Math.min(2500, msg.length * base);
  };

  useEffect(() => {
    const unlockAudio = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/silence.mp3')
        );
        await sound.playAsync();
        await sound.unloadAsync();
      } catch (e) {
        console.log('Erreur déblocage audio :', e);
      }
    };

    const loadWelcomeMessages = async () => {
      for (let i = 0; i < welcomeMessages.length; i++) {
        setTyping(true);
        animateAvatar();

        const currentMsg = welcomeMessages[i];
        await new Promise(resolve => setTimeout(resolve, delayForMessage(currentMsg)));
        setTyping(false);

        Animated.timing(fadeAnim[i], {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();

        await playSound();
        await new Promise(resolve => setTimeout(resolve, 300));

        if (i === welcomeMessages.length - 1) {
          setShowChat(true);
          setShowQuestions(true);
        }
      }
    };

    unlockAudio();
    loadWelcomeMessages();
  }, []);

  const animateAvatar = () => {
    Animated.sequence([
      Animated.timing(avatarAnim, {
        toValue: 1.2,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(avatarAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      })
    ]).start();
  };

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/notification.mp3')
      );
      await sound.playAsync();
      await sound.unloadAsync();
    } catch (error) {
      console.log('Erreur lecture son :', error);
    }
  };

  const handleQuestionPress = async (questionId) => {
    const question = defaultQuestions.find(q => q.id === questionId);
    if (!question) return;

    // Ajouter la question de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: question.question,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowQuestions(false);

    // Simuler la réflexion
    await simulateThinking();

    // Ajouter la réponse du bot
    const botResponse = {
      id: Date.now() + 1,
      text: predefinedResponses[questionId],
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    await playSound();
  };

  const analyzeMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Vérifier les mots-clés
    for (const [keyword, response] of Object.entries(keywordResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return null;
  };

  const getBotResponse = (userMessage) => {
    const analysis = analyzeMessage(userMessage);
    
    if (typeof analysis === 'string') {
      // Réponse de base (salutations, etc.)
      const responses = basicResponses[analysis];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (typeof analysis === 'number') {
      // Réponse prédéfinie
      return predefinedResponses[analysis];
    } else {
      // Réponse aléatoire
      return randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: userInput,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setShowQuestions(false);

    // Simuler la réflexion
    await simulateThinking();

    // Générer la réponse appropriée
    const botResponseText = getBotResponse(currentInput);
    const botResponse = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
    await playSound();
  };

  const simulateThinking = async () => {
    setTyping(true);
    animateAvatar();
    
    // Temps de réflexion variable (2-4 secondes)
    const thinkingTime = Math.random() * 2000 + 2000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    setTyping(false);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarAnim }] }]}>
          <Animated.Image
            source={require('@/assets/images/sage.png')}
            style={styles.avatar}
          />
          <View style={styles.statusIndicator} />
        </Animated.View>
        <Text style={styles.headerText}>Grand Sage 🧙‍♂️</Text>
        <Text style={styles.subHeaderText}>Maître des langues patrimoniales</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
      >
        {/* Messages de bienvenue */}
        {welcomeMessages.map((msg, idx) => (
          <Animated.View key={`welcome-${idx}`} style={[styles.botMessage, { opacity: fadeAnim[idx] }]}>
            <Text style={styles.botText}>{msg}</Text>
          </Animated.View>
        ))}

        {/* Questions par défaut */}
        {showQuestions && (
          <Animated.View style={styles.questionsContainer}>
            <Text style={styles.questionsTitle}>🎯 Questions fréquentes :</Text>
            {defaultQuestions.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={styles.questionButton}
                onPress={() => handleQuestionPress(q.id)}
              >
                <Text style={styles.questionEmoji}>{q.emoji}</Text>
                <Text style={styles.questionText}>{q.question}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Messages de conversation */}
        {messages.map((msg) => (
          <Animated.View
            key={msg.id}
            style={[
              styles.message,
              msg.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              msg.sender === 'user' ? styles.userText : styles.botText
            ]}>
              {msg.text}
            </Text>
          </Animated.View>
        ))}

        {/* Indicateur de frappe */}
        {typing && (
          <View style={styles.typingContainer}>
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>🔮 Le Grand Sage réfléchit</Text>
              <View style={styles.typingDots}>
                <Animated.Text style={[styles.dot, { opacity: avatarAnim }]}>●</Animated.Text>
                <Animated.Text style={[styles.dot, { opacity: avatarAnim }]}>●</Animated.Text>
                <Animated.Text style={[styles.dot, { opacity: avatarAnim }]}>●</Animated.Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Zone de saisie */}
      {showChat && (
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Posez votre question au Grand Sage..."
              placeholderTextColor="#999"
              value={userInput}
              onChangeText={setUserInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: userInput.trim() ? 1 : 0.5 }]}
              onPress={handleSendMessage}
              disabled={!userInput.trim()}
            >
              <Text style={styles.sendButtonText}>🚀</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputNote}>💡 Le Grand Sage prépare ses réponses pour les prochaines mises à jour</Text>
        </View>
      )}

      {/* Bouton retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅️ Retour</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    borderWidth: 3,
    borderColor: Colors.logo,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.logo,
    marginBottom: 2,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  messages: {
    paddingBottom: 20,
  },
  message: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.logo,
  },
  userMessage: {
    backgroundColor: Colors.logo,
    padding: 16,
    borderRadius: 20,
    borderTopRightRadius: 8,
    alignSelf: 'flex-end',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  botText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  userText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  questionsContainer: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.logo,
    marginBottom: 15,
    textAlign: 'center',
  },
  questionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  questionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  questionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  typingContainer: {
    marginBottom: 15,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 16,
    color: Colors.logo,
    marginHorizontal: 1,
  },
  inputContainer: {
    paddingVertical: 15,
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 5,
  },
  sendButton: {
    backgroundColor: Colors.logo,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 18,
  },
  inputNote: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: Colors.logo,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});