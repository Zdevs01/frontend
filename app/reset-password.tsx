import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { Controller, useForm } from "react-hook-form";
import Colors from "@/assets/fonts/color";
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet



const ResetPassword = () => {
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: data.token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Mot de passe réinitialisé. Vous pouvez vous connecter.");
      } else {
        Alert.alert("Erreur", result.message || "Erreur lors de la réinitialisation.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur réseau s’est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>

      <Controller
        control={control}
        rules={{ required: "Token requis" }}
        name="token"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Code ou lien"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.token && <Text style={styles.error}>{errors.token.message}</Text>}

      <Controller
        control={control}
        rules={{ required: "Mot de passe requis" }}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nouveau mot de passe"
            secureTextEntry
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}

      <Controller
        control={control}
        rules={{ required: "Confirmation requise" }}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirmez le mot de passe"
            secureTextEntry
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Réinitialiser</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gris2,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.gris,
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ResetPassword;
