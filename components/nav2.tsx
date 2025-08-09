import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/assets/fonts/color.js';
import Profil from '@/components/profile';
import Setting from '@/components/setting';

const screenHeight = Dimensions.get('window').height;

export default function Nav2() {
    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    const [isViewSetVisible, setIsViewSetVisible] = useState(false);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Barre de navigation */}
            <View style={styles.nav}>
                <Text style={styles.text}>Profil</Text>
                <TouchableOpacity
                    style={styles.el}
                    onPress={() => setIsViewSetVisible(true)}
                >
                    <View style={styles.icon}>
                        <Image
                            source={require('@/assets/images/set.png')}
                            style={styles.img}
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Profil */}
            <View style={styles.profil}>
                <Profil />
            </View>

            {/* Vue des paramètres en plein écran */}
            {isViewSetVisible && (
                <View style={styles.view_not}>
                    <View style={styles.navigation}>
                        <View style={styles.row}>
                            <View style={styles.icon}>
                                <Image
                                    source={require('@/assets/images/set.png')}
                                    style={styles.img}
                                />
                            </View>
                            <Text style={styles.text}>Paramètre</Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsViewSetVisible(false)}>
                            <Text style={styles.text}>✖</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.settingContainer}>
                        <Setting />
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    nav: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        zIndex: 5,
    },
    profil: {
        flex: 1,
        paddingTop: 10,
    },
    view_not: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: screenHeight,
        backgroundColor: Colors.gris2,
        zIndex: 10,
    },
    navigation: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Colors.padding,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    settingContainer: {
        flex: 1,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    el: {
        flexDirection: 'row',
        gap: 4,
    },
    icon: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    img: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    text: {
        fontSize: 16,
        fontFamily: Colors.font,
        color: Colors.black,
        fontWeight: 'bold',
    },
});
