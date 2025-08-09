import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Colors from '@/assets/fonts/color';
import { API_URL } from '@/components/api'; // adapte le chemin selon ton projet

const { width } = Dimensions.get('window');
const BAR_MAX_WIDTH = width * 0.5;

export default function Leaderboard({ userId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barWidths, setBarWidths] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leaderboard?userId=${userId}`);
        const data = await res.json();
        setLeaderboard(data.leaderboard);
        setCurrentUser(data.currentUser);
        setBarWidths(data.leaderboard.map(() => useSharedValue(0)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (leaderboard.length > 0) {
      const maxXP = leaderboard[0].crevettes;
      leaderboard.forEach((user, index) => {
        const widthValue = (user.crevettes / maxXP) * BAR_MAX_WIDTH;
        barWidths[index].value = withDelay(index * 100, withTiming(widthValue, { duration: 600 }));
      });
    }
  }, [leaderboard]);

  const renderUser = (user, index) => {
    const animatedStyle = useAnimatedStyle(() => ({
      width: barWidths[index]?.value || 0,
    }));

    const isTop3 = index < 3;
    const isCurrent = user.id === currentUser?.id;
    const medal = ['🥇', '🥈', '🥉'][index] || null;

    return (
      <View
        key={user.id}
        style={[
          styles.row,
          isTop3 && styles.topRow,
          isCurrent && styles.currentUserRow,
        ]}
      >
        <Text style={styles.rank}>{index + 1}</Text>
        <Image source={require('@/assets/images/user.png')} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.username}>{medal ? `${medal} ` : ''}{user.username}</Text>
          <Animated.View style={[styles.bar, animatedStyle]} />
        </View>
        <Text style={styles.xp}>{user.crevettes} XP</Text>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏆 Classement Hebdomadaire</Text>

      {leaderboard.map((user, index) => renderUser(user, index))}

      {currentUser && (
        <View style={styles.currentContainer}>
          <Text style={styles.sectionTitle}>Vous</Text>
          {renderUser(currentUser, leaderboard.length)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7FD',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1D4ED8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    backgroundColor: '#E0F2FE',
  },
  currentUserRow: {
    borderColor: '#34D399',
    borderWidth: 2,
  },
  rank: {
    width: 30,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4B5563',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  bar: {
    height: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
  },
  xp: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentContainer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2563EB',
    textAlign: 'center',
  },
});
