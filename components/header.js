import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { colors } from './colors.js';

export default function header(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.text}</Text>
        </View>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderBottomColor: colors.grey300,
        borderBottomWidth: 2 * rem,
        paddingBottom: 12 * rem,
        height: '100%',
    },
    text: {
        fontSize: 20 * rem,
        color: colors.grey900,
        fontWeight: '500',
    },
});