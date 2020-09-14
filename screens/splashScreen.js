import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../components/colors.js';

export default function login({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style={styles.header1}>CEsimply</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.blue800,
    },
    header1: {
        fontSize: 30,
        fontWeight: '500',
        color: 'white',
    },
});