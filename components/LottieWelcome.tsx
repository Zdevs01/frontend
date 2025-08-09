import React from "react";
import { Platform, View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import LottieWeb from "lottie-react";
import animation from "@/assets/animations/welcome.json"; // ✅ adapte ce chemin

const { width, height } = Dimensions.get("window");

const LottieWelcome = () => {
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <LottieWeb
          animationData={animation}
          loop
          autoplay
          style={{ width: 300, height: 300 }}
        />
      ) : (
        <LottieView
          source={require("@/assets/animations/welcome.json")}
          autoPlay
          loop
          style={{ width: width * 0.8, height: height * 0.5 }}
        />
      )}
    </View>
  );
};

export default LottieWelcome;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
