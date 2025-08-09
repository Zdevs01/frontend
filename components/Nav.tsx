import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Easing,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/assets/fonts/color.js';
import Notification from '@/components/notification';
import Setting from '@/components/setting';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet


const { width, height } = Dimensions.get('window');

interface User {
  id: number;
  username: string;
  email: string;
}

interface Stats {
  cauris: number;
  crevettes: number;
}

const Nav1: React.FC = () => {
  const router = useRouter();
  const [isNotifVisible, setNotifVisible] = useState(false);
  const [isSettingVisible, setSettingVisible] = useState(false);
  const [lifePoints, setLifePoints] = useState(5);
  const [nextLifeTime, setNextLifeTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const userRef = useRef<User | null>(null);

  const loadStats = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user: User = JSON.parse(userData);
        userRef.current = user;

        const res = await fetch(`${API_URL}/api/user/stats/${user.id}`);
        const data: Stats = await res.json();

        if (res.ok) {
          setLifePoints(data.cauris);
          if (data.cauris < 5) {
            const savedTime = await AsyncStorage.getItem('nextLifeTime');
            if (savedTime) {
              setNextLifeTime(new Date(savedTime));
            } else {
              const next = new Date(Date.now() + 9 * 60000);
              setNextLifeTime(next);
              await AsyncStorage.setItem('nextLifeTime', next.toISOString());
            }
          }
        }
      }
    } catch (err) {
      console.error("Erreur chargement stats:", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (isNotifVisible || isSettingVisible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNotifVisible, isSettingVisible]);

  useEffect(() => {
    if (!nextLifeTime || !userRef.current) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const distance = nextLifeTime.getTime() - now.getTime();

      if (distance <= 0 && lifePoints < 5) {
        const res = await fetch(`${API_URL}/api/user/add-cauri/${userRef.current.id}`);
        if (res.ok) {
          const updated = Math.min(lifePoints + 1, 5);
          setLifePoints(updated);
          if (updated < 5) {
            const next = new Date(Date.now() + 9 * 60000);
            setNextLifeTime(next);
            AsyncStorage.setItem('nextLifeTime', next.toISOString());
          } else {
            setNextLifeTime(null);
            AsyncStorage.removeItem('nextLifeTime');
            setCountdown('');
          }
        }
      } else if (lifePoints < 5) {
        const min = String(Math.floor(distance / 60000)).padStart(2, '0');
        const sec = String(Math.floor((distance % 60000) / 1000)).padStart(2, '0');
        setCountdown(`${min}:${sec}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextLifeTime, lifePoints]);

  const closePanels = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setNotifVisible(false);
      setSettingVisible(false);
    });
  };

  return (
    <>
      <View style={styles.nav}>
        <TouchableWithoutFeedback onPress={() => router.push('/')}>
          <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        </TouchableWithoutFeedback>

        <View style={styles.iconsRow}>
          <View style={styles.badge}>
            <Image source={require('@/assets/images/kori.png')} style={styles.iconKori} />
            <Text style={styles.badgeText}>{lifePoints}</Text>
          </View>

          {countdown !== '' && (
            <View style={styles.timer}>
              <Text style={styles.timerText}>+1 dans {countdown}</Text>
            </View>
          )}

          <TouchableWithoutFeedback onPress={() => {
            setNotifVisible(true);
            setSettingVisible(false);
          }}>
            <View style={styles.iconButton}>
              <Image source={require('@/assets/images/not.png')} style={styles.icon} />
              <Text style={styles.alertText}>1</Text>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={() => {
            setSettingVisible(true);
            setNotifVisible(false);
          }}>
            <View style={styles.iconButton}>
              <Image source={require('@/assets/images/set.png')} style={styles.icon} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      {(isNotifVisible || isSettingVisible) && (
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fullScreen}
        >
          <Animated.View style={[styles.modalPanel, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.panelHeader}>
              <Image
                source={
                  isNotifVisible
                    ? require('@/assets/images/not.png')
                    : require('@/assets/images/set.png')
                }
                style={styles.headerIcon}
              />
              <Text style={styles.panelTitle}>
                {isNotifVisible ? 'Notifications' : 'Paramètres'}
              </Text>
              <TouchableWithoutFeedback onPress={closePanels}>
                <Text style={styles.closeText}>✖</Text>
              </TouchableWithoutFeedback>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {isNotifVisible ? <Notification /> : <Setting onClose={closePanels} />}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    )}
  </>
);
};

const styles = StyleSheet.create({
  nav: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 4,
    zIndex: 10,
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 50,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  iconKori: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00796B',
  },
  timer: {
    backgroundColor: '#424242',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timerText: {
    fontSize: 10,
    color: '#fff',
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
  },
  icon: {
    width: 20,
    height: 20,
  },
  alertText: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 10,
    backgroundColor: '#FF5252',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 4,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  modalPanel: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
    maxHeight: '90%',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  headerIcon: {
    width: 24,
    height: 24,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPanel: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
});

export default Nav1;
