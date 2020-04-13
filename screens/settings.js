import React from 'react';
import { Dimensions, Text, StyleSheet, View } from 'react-native';
import { colors } from '../components/colors.js';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function settings({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header2}>Set<Text style={styles.header}>tings</Text></Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50*rem,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.blue800,
      },
      header: {
          fontSize: 30,
          fontWeight: '500',
          color: 'white',
      },
      header2:{
        fontSize: 30,
        fontWeight: '500',
        color: 'cyan',
      },
});