import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/assets/fonts/color';
import { IconSymbol } from '@/components/ui/IconSymbol';

import Ex1 from '@/components/Ex1';
// import Ex2 from '@/components/Ex2';
// import Ex3 from '@/components/Ex3';
// import Ex4 from '@/components/Ex4';
// import Ex5 from '@/components/Ex5';

export default function Lessons() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={Colors.logo} />;
  }

  return (
    <>
      <View style={{ flex: 1, backgroundColor: Colors.gris2 }}>
        <Ex1 />
      </View>

      {/* Barre de navigation */}
      <View style={styles.tabContainer}>
        <Pressable style={styles.tab} onPress={() => router.push("/lessons")}>
          <Ionicons name="book" size={22} color={Colors.logo} />
          <Text style={styles.tabTextActive}>Lessons</Text>
        </Pressable>

        <Pressable style={styles.tab} onPress={() => router.push("/community")}>
          <Ionicons name="people-outline" size={22} color={Colors.gris3} />
          <Text style={styles.tabText}>Communauté</Text>
        </Pressable>

        <Pressable style={styles.tab} onPress={() => router.push("/home")}>
          <IconSymbol size={22} name="house.fill" color={Colors.gris3} />
          <Text style={styles.tabText}>Accueil</Text>
        </Pressable>

        <Pressable style={styles.tab} onPress={() => router.push("/profil")}>
          <Ionicons name="person-outline" size={22} color={Colors.gris3} />
          <Text style={styles.tabText}>Profil</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.white,
    borderTopColor: Colors.gris2,
    borderTopWidth: 1,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gris3,
    marginTop: 4,
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.logo,
    marginTop: 4,
  },
});
