import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Colors from '@/assets/fonts/color.js';

export default function Nav2() {
    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return null; // Tu peux ici mettre un loader si tu veux
    }

    // Exemple de données notifications
    const notifications = [
        {
            id: 1,
            title: "Nouvelle leçon disponible !",
            message: "Découvrez la leçon sur les salutations en Douala.",
            time: "10:09",
        },
        {
            id: 2,
            title: "Rappel d’entraînement",
            message: "N'oubliez pas de pratiquer vos phrases du jour.",
            time: "08:30",
        },
        {
            id: 3,
            title: "Félicitations 🎉",
            message: "Vous avez gagné 20 XP pour votre progression !",
            time: "Hier",
        },
    ];

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
            {notifications.map(({id, title, message, time}) => (
                <View key={id} style={styles.notification}>
                    <View style={styles.header}>
                        <Text style={styles.icon}>🔔</Text>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.time}>{time}</Text>
                    </View>
                    <Text style={styles.message}>{message}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: Colors.padding,
        backgroundColor: '#F9FAFB',
    },
    notification: {
        backgroundColor: Colors.white,
        padding: 15,
        borderRadius: Colors.radius2,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    icon: {
        fontSize: 18,
    },
    title: {
        flex: 1,
        fontFamily: 'SpaceMono-Regular',
        fontSize: 16,
        fontWeight: '700',
        color: Colors.black,
    },
    time: {
        fontSize: 12,
        color: Colors.gris3,
    },
    message: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 14,
        color: Colors.black,
        opacity: 0.7,
        lineHeight: 20,
    },
});
