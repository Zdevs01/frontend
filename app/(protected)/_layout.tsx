import { Redirect, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "@/hooks/useColorScheme";
import HomeTabLayout from "@/components/navigation/home-tab-navigation";
import { useFonts } from "expo-font";
import { useSession } from "@/context/authContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { session, isLoading } = useSession();
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  if (!session) {
    console.log("session", session, typeof session);
    return <Redirect href="/login" />;
  }

  return <HomeTabLayout />;
}
