import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFonts } from "expo-font";
import NavTime from "@/components/navTime";
import Theme1 from "@/components/Theme1";
import Theme2 from "@/components/Theme2";
import Theme3 from "@/components/Theme3";
import Colors from "@/assets/fonts/color.js";
import Duala from "../languages/duala";
import Bassa from "../languages/bassa";
import { useRoute } from "@react-navigation/native";
import { useSearchParams } from "expo-router/build/hooks";
import Ngomalah from "../languages/ngomalah";

type RouteParams = {
  design?: string;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });
  const route = useRoute();

  const searchParams = useSearchParams();
  const language = searchParams.get("language");

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  console.log("homepage", language, typeof language);

  return (
    <>
      {
        // Use switch case directly in JSX to render content based on the selected language
        (() => {
          switch (language) {
            case "Duala)":
              return <Duala />;
            case "Bassa)":
              return <Bassa />;
            case "Ngomalah)":
              return <Ngomalah />;
            default:
              return; // Default language content
          }
        })()
      }
    </>
  );
}
