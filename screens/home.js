import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import firebase from 'firebase';


const screenWidth = Math.round(Dimensions.get('window').width);

export default function login({ navigation }) {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // firebase.auth().signOut();
        }
        else {
            navigation.navigate("Login");
        }
    });

    let logoutHandler = () => {
        firebase.auth().signOut();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header1}>Home<Text style={styles.header2}>Page</Text></Text>
            <TouchableOpacity style={styles.BtnLogout}
                onPress={logoutHandler}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
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
    btnLogout: {
        width: screenWidth - 55,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        marginTop: 20,
      },
      logoutText: {
        color: '#0055a5',
        fontSize: 20,
        textAlign: 'center'
      },
});