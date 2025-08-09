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
} from "react-native";

const API_URL = "http://168.231.116.58:3000";

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

  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          router.push("/language-choice");
        } else {
          setShouldShowForm(true);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du token :", error);
      }
    };

    checkStoredToken();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Connexion réussie !");
        if (result && result.user && result.token) {
          await AsyncStorage.setItem("user_token", result.token);
          await AsyncStorage.setItem("user", JSON.stringify(result.user));
        }

        if (data.rememberMe) {
          await AsyncStorage.setItem("remember_me", "true");
        }

        router.push("/language-choice");
      } else {
        alert(result.message || "Identifiant ou mot de passe incorrect");
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Bienvenue sur Mulema</Text>
      <Text style={styles.subtitle}>Connecte-toi pour continuer</Text>

      {shouldShowForm && (
        <View style={styles.formContainer}>
          {/* Email */}
          <Text style={styles.label}>E-mail ou nom d'utilisateur</Text>
          <Controller
            control={control}
            rules={{ required: "Email requis" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="ex: ton@email.com"
                placeholderTextColor="#aaa"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="email"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          {/* Password */}
          <Text style={styles.label}>Mot de passe</Text>
          <Controller
            control={control}
            rules={{ required: "Mot de passe requis" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#aaa"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="password"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          {/* Mot de passe oublié */}
          <Pressable onPress={() => router.push("/forgot-password")}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </Pressable>

          {/* Se souvenir */}
          <View style={styles.checkboxContainer}>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  status={value ? "checked" : "unchecked"}
                  onPress={() => onChange(!value)}
                />
              )}
              name="rememberMe"
            />
            <Text>Se souvenir de moi</Text>
          </View>

          {/* Connexion */}
          <Pressable
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Connexion</Text>
            )}
          </Pressable>

          {/* Inscription */}
          <Text style={styles.noAccountText}>Pas encore de compte ?</Text>
          <Pressable onPress={() => router.push("/sign-in")}>
            <Text style={styles.registerLink}>Inscrivez-vous ici</Text>
          </Pressable>

          {/* Mentions légales */}
          <Text style={styles.legal}>
            En te connectant à Mulema, tu acceptes nos{" "}
            <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/politique")}>
              Conditions d'utilisation
            </Text>{" "}
            et notre{" "}
            <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/confidentialite")}>
              Politique de confidentialité
            </Text>.
            {"\n"}Cette qpplication est protégé par reCAPTCHA Enterprise. La{" "}
            <Text style={styles.legalLink} onPress={() => Linking.openURL("https://policies.google.com/privacy")}>
              Politique de confidentialité
            </Text>{" "}
            et les{" "}
            <Text style={styles.legalLink} onPress={() => Linking.openURL("https://policies.google.com/terms")}>
              Conditions d'utilisation
            </Text>{" "}
            de Google s’appliquent.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.gris2,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 45,
    backgroundColor: Colors.gris,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  forgotText: {
    textAlign: "right",
    color: "blue",
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  loginButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  noAccountText: {
    textAlign: "center",
    marginTop: 20,
    color: "#444",
  },
  registerLink: {
    textAlign: "center",
    color: "red",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  legal: {
    fontSize: 12,
    color: "#888",
    marginTop: 30,
    textAlign: "center",
  },
  legalLink: {
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default Login;
