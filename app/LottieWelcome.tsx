import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const LottieWelcome = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("@/assets/animations/welcome.json")}
        autoPlay
        loop
        style={{ width: width * 0.8, height: height * 0.5 }}
      />
    </View>
  );
};

export default LottieWelcome;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
