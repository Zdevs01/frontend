import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';

export default function Staircase() {
    const stairs = Array(10).fill(0); // 10 marches

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Escalier Vue de Face</Text>
            {stairs.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.step,
                        {
                            width: `${100 - index * 5}%`, // Diminue la largeur de chaque marche
                            height: 30, // Hauteur fixe des marches
                        },
                    ]}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingVertical: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    step: {
        backgroundColor: '#333',
        marginVertical: 5, // Espacement entre les marches
        borderRadius: 5, // Bords arrondis pour l'esthétique
    },
});