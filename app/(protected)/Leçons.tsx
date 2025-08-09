import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import NavTime from '@/components/navTime';
import Sage from '@/components/sage';
import Ex1 from '@/components/Ex1';
import Ex2 from '@/components/Ex2';
import Ex3 from '@/components/Ex3';
import Ex4 from '@/components/Ex4';
import Ex5 from '@/components/Ex5';

export default function Leçon() {
    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
      <>
        <View>
          <Sage />
        </View>
      </>

    );
}
