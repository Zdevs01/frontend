import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/assets/fonts/color.js';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet
const NavTime = () => {
  const [cauris, setCauris] = useState(5);
  const [rawProgress, setRawProgress] = useState(100);
  const [countdownText, setCountdownText] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(999);
  const progressAnim = useRef(new Animated.Value(100)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const countdownBlink = useRef(new Animated.Value(1)).current;
  const DURATION = 9 * 60 * 1000;

  const updateProgress = async () => {
    const userData = await AsyncStorage.getItem('user');
    const savedTime = await AsyncStorage.getItem('lastLostTime');

    if (userData) {
      const user = JSON.parse(userData);
      const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
      const data = await res.json();
      let currentCauris = data.cauris;
      setCauris(currentCauris);

      if (currentCauris >= 5) {
        setRawProgress(100);
        setCountdownText('');
        setRemainingSeconds(999);
        return;
      }

      if (savedTime) {
        const lastLost = new Date(savedTime).getTime();
        const now = Date.now();
        const elapsed = now - lastLost;

        const gainCount = Math.floor(elapsed / DURATION);
        const remainingTime = elapsed % DURATION;

        if (gainCount > 0) {
          for (let i = 0; i < gainCount && currentCauris + i < 5; i++) {
            await fetch(`${API_URL}/api/user/add-cauri/${user.id}`);
          }
          await AsyncStorage.setItem('lastLostTime', new Date(now - remainingTime).toISOString());
          currentCauris = Math.min(currentCauris + gainCount, 5);
          setCauris(currentCauris);
        }

        const globalProgress = ((currentCauris + (remainingTime / DURATION)) / 5) * 100;
        setRawProgress(globalProgress);

        const remaining = DURATION - remainingTime;
        const min = String(Math.floor(remaining / 60000)).padStart(2, '0');
        const sec = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
        setCountdownText(`+1 dans ${min}:${sec}`);
        setRemainingSeconds(remaining / 1000);
      } else {
        setRawProgress((currentCauris / 5) * 100);
        setCountdownText('');
        setRemainingSeconds(999);
      }
    }
  };

  useEffect(() => {
    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: rawProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [rawProgress]);

  useEffect(() => {
    if (cauris === 0) {
      Vibration.vibrate(500);
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(1);
    }
  }, [cauris]);

  useEffect(() => {
    if (remainingSeconds <= 60) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(countdownBlink, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.timing(countdownBlink, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      countdownBlink.setValue(1);
    }
  }, [remainingSeconds]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const getProgressColor = () => {
    if (cauris === 5) return '#2ecc71'; // Vert
    if (rawProgress < 33) return '#e74c3c'; // Rouge
    if (rawProgress < 66) return '#f39c12'; // Orange
    return '#2ecc71'; // Vert clair
  };

  return (
    <>
      {countdownText !== '' && (
        <Animated.Text style={[styles.countdownTop, { opacity: countdownBlink }]}>
          {countdownText}
        </Animated.Text>
      )}
      <Animated.View style={[styles.container, { opacity: blinkAnim }]}>
        <TouchableOpacity style={styles.iconContainer}>
          <Text style={styles.iconText}>❤️</Text>
        </TouchableOpacity>
  
        <View style={styles.NavTime}>
          <Animated.View style={[styles.progress, { width: progressWidth, backgroundColor: getProgressColor() }]} />
        </View>
  
        <TouchableOpacity style={styles.iconContainer}>
          <View style={styles.icon}>
            <Image source={require('@/assets/images/kori.png')} style={styles.imgd} />
          </View>
          <Text style={styles.text}>{cauris}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Colors.padding,
    height: 50,
    top: 28,
    zIndex: 10,
    width: '100%',
    backgroundColor: Colors.white,
  },
  countdownTop: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#e67e22',
    fontFamily: Colors.font,
    zIndex: 20,
  },
  
  iconContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  text: {
    color: Colors.logo,
    top: -2,
    fontFamily: Colors.font,
  },
  icon: {
    width: 20,
    height: 20,
  },
  imgd: {
    width: 25,
    height: 14,
    transform: [{ rotate: '90deg' }],
  },
  iconText: {
    top: -4,
    fontSize: 18,
    color: '#333',
    fontFamily: Colors.font,
  },
  NavTime: {
    flex: 1,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
  countdown: {
    fontSize: 11,
    color: '#444',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});

export default NavTime;
