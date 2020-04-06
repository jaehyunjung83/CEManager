import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AddLicense from '../images/addLicense.svg';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function homepage() {

    let addLicense = () => {
        // TODO:
    }

    let addCertification = () => {
        // TODO:
    }

    return (
        <View style={styles.container}>
            <View style={styles.addContainer}>
                <TouchableOpacity style={styles.addButton}
                    onPress={addLicense}>
                    <Text style={styles.addButtonText}>Add License</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton}
                    onPress={addCertification}>
                    <Text style={styles.addButtonText}>Add Certification</Text>
                </TouchableOpacity>
            </View>
            <AddLicense width={screenWidth - (50 * rem)} height={200 * rem} />
            <Text style={styles.emptyText}>You don't have any licenses or certifications added yet. Add one to start tracking!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50 * rem,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(243, 247, 249, 1)',
    },
    addContainer: {
        top: 0,
        position: 'absolute',
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(226, 232, 240, 1)',
        height: 70 * rem,
        width: screenWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 160 * rem,
        aspectRatio: 1,
        maxHeight: 45 * rem,
        backgroundColor: '#0055a5',
        borderRadius: 6,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    addButtonText: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
    },
    emptyText: {
        color: 'grey',
        fontSize: 16 * rem,
        textAlign: 'center',
        margin: 30 * rem,
    },
});