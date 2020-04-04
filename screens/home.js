import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import DocumentScanner from './scanner.js';


// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = Math.round(screenWidth/380);

export default function login({ navigation }) {

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // firebase.auth().signOut();
        }
        else {
          navigation.navigate("Login");
        }
      });

    let logoutHandler = () => {
        firebase.auth().signOut();
        navigation.navigate("Login");
    }

    let openScannerHandler = () => {
        navigation.navigate("Scanner");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header1}>Home<Text style={styles.header2}>Page</Text></Text>
            <TouchableOpacity style={styles.BtnLogout}
                onPress={logoutHandler}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.BtnLogout}
                onPress={openScannerHandler}>
                <Text style={styles.logoutText}>Open Scanner</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50*rem,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    btnLogout: {
        width: screenWidth - (55*rem),
        height: 45*rem,
        borderRadius: 25*rem,
        backgroundColor: 'white',
        justifyContent: 'center',
        marginTop: 20*rem,
      },
      logoutText: {
        color: '#0055a5',
        fontSize: 20*rem,
        textAlign: 'center'
      },
});