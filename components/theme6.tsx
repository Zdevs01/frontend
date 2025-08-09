import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, Animated, Platform
} from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Nav from '@/components/Nav';
import Colors from '@/assets/fonts/color.js';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet


export default function Theme6() {
  const router = useRouter();
  const [showLockedMsg, setShowLockedMsg] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [avancer, setAvancer] = useState(1);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (user?.id) {
          const res = await axios.get(`${API_URL}/api/theme1/${user.id}`);
          setAvancer(res.data.avancer);
        }
      } catch (err) {
        console.error("Erreur progression:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (!fontsLoaded || loading) return <ActivityIndicator size="large" color="#0000ff" />;

  const items = [
    {
      id: 1,
      image: require('@/assets/images/obB1.png'),
      locked: avancer < 7,
      route: '/ex2_t2_1',
    },
    {
      id: 2,
      image: require('@/assets/images/obc2.png'),
      locked: avancer < 8,
      route: '/ex2_t2_2',
    },
    {
      id: 3,
      image: require('@/assets/images/obc2.png'),
      locked: avancer < 9,
      route: '/ex2_t2_3',
    },
  ];
  

  const handleLockedClick = async () => {
    setShowLockedMsg(true);
    const { sound } = await Audio.Sound.createAsync(require('@/assets/sounds/point.mp3'));
    await sound.playAsync();
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setShowLockedMsg(false), 4000);
  };

  return (
    <>
      <Nav />
      <View style={styles.background}>
        <Image source={require('@/assets/images/Fonden-degrade3.png')} style={styles.img} />
      </View>

      <ScrollView style={styles.contain}>
        <View style={styles.top}>
          <Text style={styles.titre}>🎯 Niveau 3</Text>
          <Text style={styles.text}>Débloquez les niveaux suivants en complétant les exercices précédents.</Text>
        </View>

        <View style={styles.containt}>
          <View style={styles.river}>
            <Image source={require('@/assets/images/Forme3.png')} style={styles.img} />
          </View>

          <View style={styles.grad}>
            {items.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.el, idx === 0 ? styles.flexstar : idx === 1 ? styles.flexcenter : styles.flexend]}
              >
                <TouchableOpacity
                  style={[styles.btn, item.locked && styles.btnLocked]}
                  onPress={() => {
                    if (item.locked) handleLockedClick();
                    else router.push(item.route);
                  }}
                >
                  <View style={styles.part}>
                    <Image source={item.image} style={styles.img} />
                  </View>
                  {item.locked && (
                    <Animated.View style={[styles.lock, { transform: [{ translateX: shakeAnim }] }]}>
                      <Image source={require('@/assets/images/cardenaas.png')} style={styles.img} />
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {showLockedMsg && (
        <View style={styles.lockedMessage}>
          <Text style={styles.lockedText}>🚫 Cet Exercice est verrouillée Pour le moment</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%', height: '200%', position: 'absolute', zIndex: -1, backgroundColor: Colors.white,
  },
  img: {
    width: '100%', height: '100%',
  },
  contain: {
    paddingTop: 70,
    width: '100%',
  },
  top: {
    padding: Colors.padding,
    alignItems: 'center',
    gap: 12,
  },
  titre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.logo,
    fontFamily: 'SpaceMono-Regular',
  },
  text: {
    color: Colors.black,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  containt: {
    marginTop: 30,
    paddingBottom: 50,
    position: 'relative',
  },
  river: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
  grad: {
    width: '100%',
    padding: Colors.padding,
    justifyContent: 'space-between',
    gap: 20,
  },
  el: {
    flexDirection: 'row',
    height: 80,
  },
  btn: {
    width: 100,
    height: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  btnLocked: {
    opacity: 0.6,
  },
  part: {
    width: '100%', height: '100%',
  },
  lock: {
    width: 30, height: 30, position: 'absolute', right: 35, top: 22,
  },
  flexstar: {
    justifyContent: 'flex-start',
  },
  flexcenter: {
    justifyContent: 'center',
  },
  flexend: {
    justifyContent: 'flex-end',
  },
  lockedMessage: {
    position: 'absolute',
    bottom: 40,
    left: '10%',
    right: '10%',
    backgroundColor: '#ffebe8',
    borderColor: '#ff6b6b',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  lockedText: {
    color: '#b00020',
    fontWeight: '700',
  },
});
