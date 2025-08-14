import Colors from "@/assets/fonts/color";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://api.vawe-africa.com";
const { width, height } = Dimensions.get('window');

// Messages motivants pour la création de compte
const motivationalMessages = [
  "🌟 Tu es sur le point de découvrir un monde linguistique incroyable !",
  "🚀 Prêt(e) à embarquer pour une aventure linguistique unique ?",
  "💎 Chaque langue est un trésor, tu es sur le point d'en découvrir plusieurs !",
  "🎯 Excellente décision ! L'apprentissage des langues locales t'attend !",
  "✨ Bienvenue dans la communauté des explorateurs linguistiques !",
];

const SignIn = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const messageAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setCurrentMessage(randomMessage);
    
    // Animation du message motivant
    setTimeout(() => {
      Animated.timing(messageAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1500);
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "#e74c3c";
    if (passwordStrength <= 3) return "#f39c12";
    return "#27ae60";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Faible";
    if (passwordStrength <= 3) return "Moyen";
    return "Fort";
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log("Données envoyées :", data);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
          username: data.username.trim(),
        }),
      });

      const result = await response.json();
      console.log("Réponse du serveur :", result);

      if (response.ok && result.success !== false) {
        // Animation de succès
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        setTimeout(() => {
          alert("🎉 Compte créé avec succès ! Bienvenue dans la famille Mulema !");
          router.push("/login");
        }, 300);
      } else {
        alert(result.message || "Une erreur est survenue lors de la création du compte.");
      }
    } catch (error) {
      console.error("Erreur de requête :", error);
      alert("Impossible de créer un compte. Vérifie ta connexion réseau.");
    } finally {
      setLoading(false);
    }
  };

  const watchedPassword = watch("password");
  const watchedEmail = watch("email");
  const watchedUsername = watch("username");
  
  useEffect(() => {
    if (watchedPassword) {
      checkPasswordStrength(watchedPassword);
    }
  }, [watchedPassword]);

  const isFormValid = watchedEmail && watchedPassword && watchedUsername && passwordStrength >= 2;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FD" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Logo avec effet */}
            <View style={styles.logoContainer}>
              <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
              <View style={styles.logoGlow} />
            </View>

            {/* Titre et sous-titre */}
            <Text style={styles.title}>Rejoins Mulema ! 🎉</Text>
            <Text style={styles.subtitle}>
              Crée ton compte pour explorer les langues camerounaises
            </Text>

            {/* Message motivant */}
            <Animated.View 
              style={[
                styles.motivationCard,
                { opacity: messageAnim, transform: [{ scale: messageAnim }] }
              ]}
            >
              <Text style={styles.motivationText}>{currentMessage}</Text>
            </Animated.View>

            <View style={styles.formContainer}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="person-outline" size={16} color="#666" /> Nom d'utilisateur
                </Text>
                <Controller
                  control={control}
                  rules={{ 
                    required: "Le nom d'utilisateur est requis",
                    minLength: {
                      value: 3,
                      message: "Au moins 3 caractères"
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Lettres, chiffres et _ seulement"
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                      <TextInput
                        style={styles.input}
                        placeholder="ex: ton_pseudo"
                        placeholderTextColor="#aaa"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        maxLength={20}
                      />
                      {value && value.length >= 3 && (
                        <Ionicons name="checkmark-circle" size={20} color="#27ae60" style={styles.validIcon} />
                      )}
                    </View>
                  )}
                  name="username"
                />
                {errors.username && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={14} color="#e74c3c" /> {errors.username.message}
                  </Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="mail-outline" size={16} color="#666" /> Adresse Email
                </Text>
                <Controller
                  control={control}
                  rules={{ 
                    required: "L'email est requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Format d'email invalide"
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <TextInput
                        style={styles.input}
                        placeholder="ton@email.com"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                      {value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && (
                        <Ionicons name="checkmark-circle" size={20} color="#27ae60" style={styles.validIcon} />
                      )}
                    </View>
                  )}
                  name="email"
                />
                {errors.email && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={14} color="#e74c3c" /> {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="lock-closed-outline" size={16} color="#666" /> Mot de passe
                </Text>
                <Controller
                  control={control}
                  rules={{ 
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 6,
                      message: "Au moins 6 caractères"
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                      <TextInput
                        style={[styles.input, { paddingRight: 50 }]}
                        placeholder="Crée un mot de passe sécurisé"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoComplete="password-new"
                      />
                      <Pressable 
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons 
                          name={showPassword ? "eye" : "eye-off"} 
                          size={20} 
                          color="#666" 
                        />
                      </Pressable>
                    </View>
                  )}
                  name="password"
                />
                
                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthBar}>
                      <View 
                        style={[
                          styles.strengthFill, 
                          { 
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getPasswordStrengthColor() }]}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                )}

                {errors.password && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={14} color="#e74c3c" /> {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Security Tips */}
              <View style={styles.securityTips}>
                <Text style={styles.tipsTitle}>💡 Conseils pour un mot de passe fort :</Text>
                <View style={styles.tipsList}>
                  <Text style={[styles.tip, watchedPassword?.length >= 8 && styles.tipValid]}>
                    • Au moins 8 caractères
                  </Text>
                  <Text style={[styles.tip, /[A-Z]/.test(watchedPassword) && styles.tipValid]}>
                    • Une majuscule
                  </Text>
                  <Text style={[styles.tip, /[0-9]/.test(watchedPassword) && styles.tipValid]}>
                    • Un chiffre
                  </Text>
                </View>
              </View>

              {/* Create Account Button */}
              <Pressable
                style={[
                  styles.createButton,
                  !isFormValid && styles.createButtonDisabled,
                  loading && styles.createButtonLoading
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Création en cours...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.createButtonText}>Créer mon compte</Text>
                    <Ionicons name="rocket" size={20} color="#fff" />
                  </View>
                )}
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.haveAccount}>Déjà un compte ?</Text>
                <Pressable 
                  style={styles.loginButton}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.loginLink}>Se connecter ici</Text>
                  <Ionicons name="log-in" size={16} color="#e74c3c" />
                </Pressable>
              </View>

              {/* Legal */}
              <Text style={styles.legal}>
                En créant un compte, tu acceptes nos{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/politique")}>
                  Conditions d'utilisation
                </Text>{" "}
                et notre{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/confidentialite")}>
                  Politique de confidentialité
                </Text>.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FD",
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoGlow: {
    position: "absolute",
    top: 5,
    left: 5,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    zIndex: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#2c3e50",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  motivationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  motivationText: {
    fontSize: 14,
    color: "#2c3e50",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 380,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
    color: "#2c3e50",
    fontSize: 16,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ecf0f1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2c3e50",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  validIcon: {
    position: "absolute",
    right: 15,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#ecf0f1",
    borderRadius: 2,
    marginRight: 10,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  securityTips: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  tipsList: {
    gap: 4,
  },
  tip: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  tipValid: {
    color: "#27ae60",
    fontWeight: "500",
  },
  createButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  createButtonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0.1,
  },
  createButtonLoading: {
    backgroundColor: "#c0392b",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ecf0f1",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#bdc3c7",
    fontWeight: "600",
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  haveAccount: {
    color: "#7f8c8d",
    marginBottom: 10,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e74c3c",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  loginLink: {
    color: "#e74c3c",
    fontWeight: "600",
    marginRight: 5,
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 5,
    fontSize: 14,
  },
  legal: {
    fontSize: 12,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 18,
  },
  legalLink: {
    color: "#3498db",
    fontWeight: "500",
  },
  });

export default SignIn;