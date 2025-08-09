import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import Nav from '@/components/Nav';
import Colors from '@/assets/fonts/color.js';

export default function Lessons() {
  const [selectedButton, setSelectedButton] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);

  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const handleSelect = (index) => {
    setSelectedButton(index);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.granted) {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Erreur démarrage enregistrement :', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setIsRecording(false);
    } catch (err) {
      console.error('Erreur arrêt enregistrement :', err);
    }
  };

  return (
    <>
      <View style={{ top: 0, position: 'absolute', width: '100%', zIndex: 20 }}>
        <Nav />
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.line_btn}>
          {[...Array(6)].map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.btns,
                selectedButton === index && styles.selectedBtn,
              ]}
              onPress={() => handleSelect(index)}
            >
              <Text style={styles.ptext}>Je Détache</Text>
              <Text style={styles.gtext}>ME NTINIL</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.audio_list}>
          <Text style={styles.audioText}>
            {recordedUri ? '✅ Enregistrement prêt' : '🎙️ Déposer ta voix ici'}
          </Text>
          <TouchableOpacity
            style={styles.audioBtn}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.audioBtnText}>
              {isRecording ? 'Arrêter' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
    marginTop: 28,
    padding: Colors.padding,
  },
  line_btn: {
    paddingTop: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: -4,
    marginBottom: 20,
  },
  btns: {
    marginBottom: 15,
    width: '48%',
    padding: Colors.padding,
    backgroundColor: '#fceae0',
    borderRadius: Colors.radius2,
    flexDirection: 'column',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.logo2,
    elevation: 2,
  },
  selectedBtn: {
    backgroundColor: Colors.vert,
    borderColor: '#006400',
  },
  ptext: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.black,
    textTransform: 'uppercase',
  },
  gtext: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.black,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  audio_list: {
    width: '100%',
    height: 160,
    borderWidth: 1.5,
    borderColor: Colors.logo,
    borderRadius: Colors.radius2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff5f2',
    padding: 20,
  },
  audioText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 12,
  },
  audioBtn: {
    backgroundColor: Colors.logo2,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderBottomWidth: 4,
    borderColor: Colors.logo,
  },
  audioBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loading: {
    justifyContent: 'center',
    alignContent: 'center',
    height: '100%',
    width: '100%',
  },
});
