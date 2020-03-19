import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import firebase from 'firebase';


const screenWidth = Math.round(Dimensions.get('window').width);

export default function login({ navigation }) {
  // firebase.auth().onAuthStateChanged(function (user) {
  //   if (user) {
  //     navigation.navigate("Home");
  //   }
  //   else {
  //     navigation.navigate("Login");
  //   }
  // });
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