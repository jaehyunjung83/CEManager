import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth/380);

export default function navigationButtons() {

    const [homeSelected, setHomeSelected] = useState(true);
    const [documentsSelected, setDocumentsSelected] = useState(false);
    const [completedSelected, setCompletedSelected] = useState(false);


    let homePagePressed = () => {
        setHomeSelected(true);
        setDocumentsSelected(false);
        setCompletedSelected(false);
    }

    let documentsPressed = () => {
        setHomeSelected(false);
        setDocumentsSelected(true);
        setCompletedSelected(false);
    }

    let completedPressed = () => {
        setHomeSelected(false);
        setDocumentsSelected(false);
        setCompletedSelected(true);
    }

    return (
        <View style={styles.navContainer}>
            <TouchableOpacity
                onPress={homePagePressed}
                style={homeSelected ? styles.navButtonSelected : styles.navButtonNotSelected}
            >
                <TextInput
                    editable={false}
                    style={homeSelected ? styles.navButtonTextSelected : styles.navButtonTextNotSelected}
                    pointerEvents="none"
                >
                    Homepage
                </TextInput>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={documentsPressed}
                style={documentsSelected ? styles.navButtonSelected : styles.navButtonNotSelected}
            >
                <TextInput
                    style={documentsSelected ? styles.navButtonTextSelected : styles.navButtonTextNotSelected}
                    editable={false}
                    pointerEvents="none"
                >
                    Documents
                </TextInput>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={completedPressed}
            style={completedSelected ? styles.navButtonSelected : styles.navButtonNotSelected}>
                <TextInput
                    style={completedSelected ? styles.navButtonTextSelected : styles.navButtonTextNotSelected}
                    editable={false}
                    pointerEvents="none"
                >
                    Completed
                </TextInput>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    navContainer: {
        left: 0,
        top: '8%',
        flexDirection: 'row',
        marginTop: 20*rem,
        width: screenWidth,
        aspectRatio: 10.2,
        backgroundColor: '#0055a5',
    },
    navButtonSelected: {
        width: screenWidth / 3,
        aspectRatio: 3.4,
        borderRightWidth: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: 'rgba(0,0,0,0)',
        borderBottomColor: 'white',
        borderWidth: 3*rem,
    },
    navButtonNotSelected: {
        width: screenWidth / 3,
        aspectRatio: 3.4,
    },
    navButtonTextSelected: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18*rem,
        fontWeight: '700',
    },
    navButtonTextNotSelected: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18*rem,
    },
});