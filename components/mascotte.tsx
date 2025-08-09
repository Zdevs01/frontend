import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function Mascotte({ size = 120 }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require('@/assets/images/mat.png')} // Mets ici l’image réelle
        style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
