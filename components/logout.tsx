import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Colors from "@/assets/fonts/color.js";

export default function LogoutScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login"); // Après 2 secondes, redirection vers Login
    }, 2000);

    return () => clearTimeout(timer); // Nettoyage si l'utilisateur quitte avant
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔒 Vous êtes déconnecté...</Text>
      <ActivityIndicator size="large" color={Colors.logo} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.logo,
    textAlign: "center",
  },
});
