import Colors from "@/assets/fonts/color";
import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Text,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoadingScreen() {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedValues = useRef([]).current;

  const text = "muléma".split("");

  if (animatedValues.length === 0) {
    text.forEach(() => {
      animatedValues.push({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(0),
      });
    });
  }

  // Animation de la montée
  useEffect(() => {
    const steps = 5;
    const totalDuration = 3000;
    const stepDuration = totalDuration / steps;

    const stepValues = Array.from({ length: steps }, (_, i) => i / (steps - 1));

    const animations = stepValues.map((toValue) =>
      Animated.timing(animatedHeight, {
        toValue,
        duration: stepDuration,
        useNativeDriver: false,
      })
    );

    Animated.sequence(animations).start();
  }, [animatedHeight]);

  // Animation des lettres
  useEffect(() => {
    const animations = animatedValues.map(({ opacity, translateY }, index) =>
      Animated.sequence([
        Animated.delay(index * 300),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -20,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    );

    Animated.stagger(200, animations).start();
  }, [animatedValues]);

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.case}>
        <View style={styles.img}>
          <Image
            source={require("@/assets/images/noix.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Animated.View
          style={[
            styles.animatedContainer,
            {
              height: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        >
          <Image
            source={require("@/assets/images/fisure2.png")}
            style={styles.images}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={styles.letterRow}>
        {text.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.textload,
              {
                opacity: animatedValues[index]?.opacity,
                transform: [{ translateY: animatedValues[index]?.translateY }],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  case: {
    overflow: "hidden",
    width: width * 0.25,
    height: height * 0.25,
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "60%",
    height: "60%",
  },
  animatedContainer: {
    width: "100%",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  images: {
    width: 30,
    height: "50%",
  },
  letterRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  textload: {
    fontSize: 30,
    color: "rgb(199, 46, 51)",
    fontWeight: "700",
    fontFamily: "Nunito-Regular", // S'assurer qu'elle est bien chargée
    marginHorizontal: 2,
  },
});
