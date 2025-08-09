import Colors from "@/assets/fonts/color";
import { CustomButton } from "@/components/CustomButton";
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "react-native-paper";
import Load from "@/components/load";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from "react-native";

const LogIn = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const router = useRouter();

  const [checked, setChecked] = useState(false);
<<<<<<<< HEAD:ee.tsx
  const [isLoading, setIsLoading] = useState(false); // Ajout du state pour le chargement

  const onSubmit = async (data: any) => {
    setIsLoading(true); // Début du chargement
========
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Etat pour afficher les erreurs

  // Fonction pour gérer le chargement avec un timeout de 10 secondes
  const handleLoading = async (task) => {
    setIsLoading(true);
>>>>>>>> 142220a49c171ba1f862d5ed6cdd8a04857c39b3:app/login.tsx
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Temps d'attente dépassé.")), 10000)
      );
      await Promise.race([task(), timeoutPromise]);
    } catch (error) {
      console.error("Erreur :", error.message);
      setErrorMessage(error.message || "Une erreur est survenue."); // Afficher l'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data) => {
    handleLoading(async () => {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Login successful:", result);

<<<<<<<< HEAD:ee.tsx
        // Stockez le token JWT localement (facultatif)
        localStorage.setItem("token", result.token);

        // Redirigez vers la page d'accueil ou une autre page protégée
========
        // Stocker le token JWT localement
        localStorage.setItem("token", result.token);

        // Redirection vers une autre page
>>>>>>>> 142220a49c171ba1f862d5ed6cdd8a04857c39b3:app/login.tsx
        router.push("/welcome");
      } else {
        const error = await response.json();
        setErrorMessage(error.message || "Une erreur est survenue. Veuillez réessayer."); // Afficher l'erreur
      }
<<<<<<<< HEAD:ee.tsx
    } catch (error) {
      console.error("Error during login:", error);
      alert("Impossible de se connecter. Veuillez vérifier votre connexion réseau.");
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleConnectGoogle = () => {
    console.log("Connect with Google");
  };

  const handleConnectFacebook = () => {
    console.log("Connect with Facebook");
  };
========
    });
  };

  const handleConnectGoogle = () => console.log("Connect with Google");
  const handleConnectFacebook = () => console.log("Connect with Facebook");

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Load />
      </View>
    );
  }
>>>>>>>> 142220a49c171ba1f862d5ed6cdd8a04857c39b3:app/login.tsx

  // Affichage d'un écran de chargement si `isLoading` est true
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.logo} />
        <Text style={styles.loadingText}>Connexion en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ width: 90, height: 90 }}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <Text
        style={{
          fontSize: 20,
          fontFamily: Colors.font,
          fontWeight: "bold",
          marginVertical: 5,
        }}
      >
        Se Connecter
      </Text>

      {/* Affichage de l'erreur, s'il y en a */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={{ width: "80%" }}>
        <Text>Adresse Email ou Nom d'utilisateur</Text>
        <Controller
          control={control}
          rules={{ required: "Email is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <Text>Mot de passe</Text>
        <Controller
          control={control}
          rules={{ required: "Password is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="password"
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
      </View>

      <Text>Pas encore de compte ?</Text>
      <Pressable onPress={() => router.push("/sign-in")}>
        <Text style={{ color: "red" }}>Inscrivez-vous ici !</Text>
      </Pressable>

      <View
        style={{
          width: "78%",
          paddingVertical: 15,
        }}
      >
        <CustomButton
          titleStyle={{ color: Colors.white }}
          pressStyle={{
            backgroundColor: Colors.black,
            width: "100%",
            borderRadius: 5,
            paddingVertical: 8,
            paddingHorizontal: 5,
            marginBottom: 15,
          }}
          title="Continuer avec Google"
          iconName="logo-google"
          iconSize={24}
          iconColor="red"
          onPress={handleConnectGoogle}
        />
        <CustomButton
          titleStyle={{ color: Colors.white }}
          pressStyle={{
            backgroundColor: Colors.black,
            width: "100%",
            borderRadius: 5,
            paddingVertical: 8,
            paddingHorizontal: 5,
            marginBottom: 15,
          }}
          title="Continuer avec Facebook"
          iconName="logo-facebook"
          iconSize={24}
          iconColor="red"
          onPress={handleConnectFacebook}
        />
        <View style={styles.checkboxContainer}>
          <Checkbox
            status={checked ? "checked" : "unchecked"}
            onPress={() => {
              setChecked(!checked);
            }}
            color={Colors.logo}
          />
          <Text style={{ textAlign: "center", paddingVertical: 5 }}>
            Se souvenir de moi
          </Text>
        </View>
      </View>
      <Pressable
        style={{
          paddingVertical: 8,
          paddingHorizontal: 25,
          backgroundColor: "red",
          borderRadius: 5,
          marginBottom: 20,
        }}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={{ color: "#fff" }}>connexion</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("screen").height,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gris2,
  },
  input: {
    height: 45,
    width: "100%",
    backgroundColor: Colors.gris,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    marginVertical: 20,
    marginHorizontal: 50,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gris2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.black,
  },
});

export default LogIn;
