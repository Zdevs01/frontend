import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import Colors from '@/assets/fonts/color.js';
import ClassementS from '@/components/classement';

export default function Vsemaine() {

    return (
        <>
            {/* Vue pour la semaine */}
            <ScrollView style={styles.vue}>
                {/* Composant classementS */}
                <ClassementS />

                {/* Classement Image */}
               
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    liste:{
        padding:Colors.padding,
        width:'100%',
        gap:29
    },
    nth:{
        flexDirection:'row',
        alignItems:'center',
        gap:20,
    },
    info: {
        gap: 5,
        alignItems: 'center',
        top: 15,
        zIndex: 4,
    },
    prof: {
        width: 40,
        height: 40,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: Colors.gris2,
    },
    img: {
        width: '100%',
        height: '100%',
    },
    vue: {
        backgroundColor: Colors.white,
        height: '100%',
        width:'100%',
        overflow:'hidden'
    },
    com: {
        backgroundColor: Colors.logo2,
        height: 330,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    box: {
        width: '100%',
    },
    pos: {
        justifyContent: 'flex-end',
        height: '100%',
        width: '33.33%',
    },

});