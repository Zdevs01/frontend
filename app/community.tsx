import React, { useRef, useEffect, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  Text,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/assets/fonts/color.js';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';


export default function Staircase() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/community');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = async (route: string) => {
    setActiveTab(route);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/click2.mp3')
    );
    await sound.playAsync();
    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  const renderTab = (
    label: string,
    iconName: string,
    route: string,
    isLogo = false,
    badge: string | null = null
  ) => {
    const isActive = route === activeTab;
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        key={route}
        onPress={() => handlePress(route)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.tab}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          {isLogo ? (
            <IconSymbol
              size={26}
              name="house.fill"
              color={isActive ? Colors.logo : Colors.gris3}
            />
          ) : (
            <Ionicons
              name={iconName}
              size={26}
              color={isActive ? Colors.logo : Colors.gris3}
            />
          )}

          {badge && (
            <Animated.View
              style={[
                styles.badge,
                route === activeTab && { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.badgeText}>{badge}</Text>
            </Animated.View>
          )}

          <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <>
      <Nav3 />
      <ScrollView style={{ flex: 1, backgroundColor: Colors.white }}>
        {/* Place your scrollable page content here */}
      </ScrollView>
      <View style={styles.tabContainer}>
        <View style={styles.tabs}>
          {renderTab('Leçons', 'book-outline', '/sage')}
          {renderTab('Exercices', 'trophy-outline', '/exercises', false, 'Duala')}
          {renderTab('Accueil', '', '/home2', true)}
          {renderTab('Communauté', 'people-outline', '/top', false, 'Actif')}
          {renderTab('Profil', 'person-outline', '/profil')}
        </View>
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 6,
    zIndex: 122,
    paddingVertical: 6,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 10,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    color: Colors.gris3,
    fontWeight: '500',
    marginTop: 2,
  },
  activeTabText: {
    color: Colors.logo,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -14,
    backgroundColor: '#f00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
});
