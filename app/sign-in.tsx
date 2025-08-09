import Colors from "@/assets/fonts/color";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://168.231.116.58:3000";

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

  const onSubmit = async (data: any) => {
    setLoading(true);
    console.log("Données envoyées :", data);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Réponse du serveur :", result);

      if (response.ok) {
        alert("Compte créé avec succès !");
        router.push("/login");
      } else {
        alert(result.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur de requête :", error);
      alert("Impossible de créer un compte. Vérifie ta connexion réseau.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = watch("email") && watch("password") && watch("username");

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image source={require("@/assets/images/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Créer un compte Mulema</Text>
      <Text style={styles.subtitle}>Rejoins-nous pour apprendre les langues locales</Text>

      <View style={styles.formContainer}>
        {/* Email */}
        <Text style={styles.label}>Adresse Email</Text>
        <Controller
          control={control}
          rules={{ required: "L'email est requis" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="ex: ton@email.com"
              keyboardType="email-address"
              placeholderTextColor="#aaa"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        {/* Nom d'utilisateur */}
        <Text style={styles.label}>Nom d'utilisateur</Text>
        <Controller
          control={control}
          rules={{ required: "Le nom d'utilisateur est requis" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="ex: tonpseudo"
              placeholderTextColor="#aaa"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="username"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

        {/* Mot de passe avec œil */}
        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            rules={{ required: "Le mot de passe est requis" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="********"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="password"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#333" />
          </Pressable>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

        {/* Bouton s'inscrire */}
        <Pressable
          style={[styles.button, !isFormValid && { backgroundColor: "gray" }]}
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
        </Pressable>

        {/* Déjà un compte */}
        <Text style={styles.haveAccount}>Déjà un compte ?</Text>
        <Pressable onPress={() => router.push("/login")}>
          <Text style={styles.loginLink}>Se connecter ici !</Text>
        </Pressable>

        {/* Mentions légales */}
        <Text style={styles.legal}>
          En créant un compte sur Mulema, tu acceptes nos{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/politique")}>
            Conditions d'utilisation
          </Text>{" "}
          et notre{" "}
          <Text style={styles.legalLink} onPress={() => Linking.openURL("https://mulema/confidentialite")}>
            Politique de confidentialité
          </Text>.{"\n"}
          Cette application est protégée par reCAPTCHA Enterprise. La{" "}
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
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    height: 45,
    backgroundColor: Colors.gris,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gris,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "red",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  haveAccount: {
    textAlign: "center",
    marginTop: 20,
    color: "#444",
  },
  loginLink: {
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

export default SignIn;
