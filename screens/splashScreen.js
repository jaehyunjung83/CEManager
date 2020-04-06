import React from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';


export default function login({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style={styles.header1}>LOADING <Text style={styles.header2}>BOI</Text></Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#233e5d',
        backgroundColor: 'white',
    },
});