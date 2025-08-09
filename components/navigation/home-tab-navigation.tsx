import { Tabs } from "expo-router";
import React, { useState } from "react";

// import { TabBarIcon } from "@/components/navigation/TabBarIcon";

import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import {
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  View,
  Button,
  Text,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

// import MainHeader from "../shared/header";

export default function HomeTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Tabs
        screenOptions={{
          //tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="Leçons"
          options={{
            title: "leçons",
            tabBarIcon: ({ color }) => (
              <Ionicons name="book" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: "community",
            tabBarIcon: ({ color }) => (
              <Ionicons name="people-outline" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={20} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: "Profil",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={20} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
