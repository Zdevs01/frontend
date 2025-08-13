import Colors from "@/assets/fonts/color";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "react-native-paper";
import Wel from "@/components/welcomes";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Linking,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://168.231.116.58:3000";
const { width, height } = Dimensions.get('window');

const Login = () => {
  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowForm, setShouldShowForm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          router.push("/choix");
        } else {
          setShouldShowForm(true);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error);
        setShouldShowForm(true);
      }
    };

    checkStoredToken();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // Animation d'entrée du formulaire
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        // Connexion réussie
        if (result && result.user && result.token) {
          await AsyncStorage.setItem("user_token", result.token);
          await AsyncStorage.setItem("user", JSON.stringify(result.user));
          
          if (data.rememberMe) {
            await AsyncStorage.setItem("remember_me", "true");
          }

          router.push("/language-choice");
        }
      } else {
        alert(result.message || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Erreur de requête :", error);
      alert("Impossible de se connecter. Vérifie ta connexion réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <View style={{ height: "100%" }}>
        <Wel />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo avec animation */}
          <View style={styles.logoContainer}>
            <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
            <View style={styles.logoShadow} />
          </View>

          <Text style={styles.title}>Bienvenue sur Mulema</Text>
          <Text style={styles.subtitle}>
            Connecte-toi pour explorer les langues camerounaises
          </Text>

          {shouldShowForm && (
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  <Ionicons name="mail-outline" size={16} color="#666" /> E-mail ou nom d'utilisateur
                </Text>
                <Controller
                  control={control}
                  rules={{ 
                    required: "Email requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Format d'email invalide"
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <TextInput
                        style={styles.input}
                        placeholder="ex: ton@email.com"
                        placeholderTextColor="#aaa"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
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
                    required: "Mot de passe requis",
                    minLength: {
                      value: 6,
                      message: "Au moins 6 caractères"
                    }
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                      <TextInput
                        style={[styles.input, { paddingRight: 50 }]}
                        placeholder="********"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showPassword}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoComplete="password"
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
                {errors.password && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={14} color="#e74c3c" /> {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                <View style={styles.checkboxContainer}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        status={value ? "checked" : "unchecked"}
                        onPress={() => onChange(!value)}
                        color="#e74c3c"
                      />
                    )}
                    name="rememberMe"
                  />
                  <Text style={styles.rememberText}>Se souvenir de moi</Text>
                </View>

                <Pressable onPress={() => router.push("/forgot-password")}>
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Pressable
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.loadingText}>Connexion...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Se connecter</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              {/* Sign up */}
              <View style={styles.signupContainer}>
                <Text style={styles.noAccountText}>Pas encore de compte ?</Text>
                <Pressable 
                  style={styles.signupButton}
                  onPress={() => router.push("/sign-in")}
                >
                  <Text style={styles.registerLink}>Créer un compte</Text>
                  <Ionicons name="person-add" size={16} color="#e74c3c" />
                </Pressable>
              </View>

              {/* Legal */}
              <Text style={styles.legal}>
                En te connectant à Mulema, tu acceptes nos{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/politique")}>
                  Conditions d'utilisation
                </Text>{" "}
                et notre{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/confidentialite")}>
                  Politique de confidentialité
                </Text>.
                {"\n"}Cette application est protégée par reCAPTCHA Enterprise. La{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://policies.google.com/privacy")}>
                  Politique de confidentialité
                </Text>{" "}
                et les{" "}
                <Text style={styles.legalLink} onPress={() => Linking.openURL("https://policies.google.com/terms")}>
                  Conditions d'utilisation
                </Text>{" "}
                de Google s'appliquent.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.gris2,
    minHeight: height,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoShadow: {
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
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 22,
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  forgotText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: "#bdc3c7",
    shadowOpacity: 0.1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
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
  signupContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  noAccountText: {
    color: "#7f8c8d",
    marginBottom: 10,
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e74c3c",
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  registerLink: {
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

export default Login;