import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../components/colors.js';


export default function scannedView(props) {
    const styles = StyleSheet.create({
        buttonContainer: {
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderWidth: 2 * rem,
            borderRadius: 10 * rem,
            borderColor: colors.blue800,
            justifyContent: 'center',
            alignContent: 'center',
            paddingLeft: props.horizontalPadding/2,
            paddingRight: props.horizontalPadding/2,
            paddingTop: props.verticalPadding/2,
            paddingBottom: props.verticalPadding/2,
        },
        text: {
            fontSize: 16 * rem,
            color: colors.blue800,
            textAlign: 'center',
        },
        icon: {
            marginRight: 18 * rem,
            height: 20 * rem,
            width: 20 * rem,
            color: colors.blue800,
        },
    });

    return (
        <TouchableOpacity
            onPress={() => {
                props.onPress();
            }}
            style={styles.buttonContainer}
        >
            {props.icon}
            <Text style={styles.text}>{props.buttonText}</Text>
        </TouchableOpacity>
    );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);