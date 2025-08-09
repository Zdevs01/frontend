import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width * 0.5;

const fakeData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Utilisateur ${i + 1}`,
  xp: 10000 - i * 421,
  avatar: require('@/assets/images/user.png'),
}));

const currentUser = {
  id: 99,
  name: 'Moi',
  xp: 2654,
  avatar: require('@/assets/images/user.png'),
};

export default function Classement() {
  const animatedWidths = useRef(fakeData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const maxXP = fakeData[0].xp;
    fakeData.forEach((user, index) => {
      const width = (user.xp / maxXP) * BAR_WIDTH;
      Animated.timing(animatedWidths[index], {
        toValue: width,
        duration: 600,
        delay: index * 100,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const renderUser = (user, index, widthAnim) => {
    const medal = ['🥇', '🥈', '🥉'][index] || null;
    return (
      <View
        key={user.id}
        style={[
          styles.row,
          index < 3 && styles.topRow,
        ]}
      >
        <Text style={styles.rank}>{index + 1}</Text>
        <Image source={user.avatar} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>
            {medal ? `${medal} ` : ''}
            {user.name}
          </Text>
          <Animated.View style={[styles.bar, { width: widthAnim }]} />
        </View>
        <Text style={styles.xp}>{user.xp} XP</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏆 Classement Hebdomadaire</Text>
      {fakeData.map((user, index) =>
        renderUser(user, index, animatedWidths[index])
      )}

      {/* Encadré de l'utilisateur connecté */}
      <View style={styles.meSection}>
        <Text style={styles.meTitle}>Moi</Text>
        <View style={[styles.row, styles.currentUser]}>
          <Text style={styles.rank}>21</Text>
          <Image source={currentUser.avatar} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{currentUser.name}</Text>
            <View style={[styles.bar, { width: (currentUser.xp / fakeData[0].xp) * BAR_WIDTH }]} />
          </View>
          <Text style={styles.xp}>{currentUser.xp} XP</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7FD',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 100,
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
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    backgroundColor: '#E0F2FE',
  },
  currentUser: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
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
  meSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 20,
  },
  meTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 12,
  },
});
