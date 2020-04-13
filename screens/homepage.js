import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AddNew from '../images/addNew.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LicenseCard from '../components/licenseCard.js';
import { colors } from '../components/colors.js';

export default function homepage({ navigation }) {

    const [isEmpty, setIsEmpty] = useState(false);

    let addNew = () => {
        navigation.navigate("addNew");
    }

    let addCE = () => {
        // TODO:
    }

    let submitToState = () => {
        // TODO:
    }

    let cardPressed = () => {
        // TODO:
    }

    return (
        <>
            {isEmpty ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.addNewButtonContainer}>
                        <TouchableOpacity
                            onPress={addNew}>
                            <MaterialCommunityIcons
                                name='plus'
                                size={40 * rem}
                                color={'white'}
                            />
                        </TouchableOpacity>
                    </View>
                    <AddNew width={screenWidth - (50 * rem)} height={200 * rem} />
                    <Text style={styles.emptyText}>You don't have any licenses or certifications added yet. Add one to start tracking!</Text>
                </View>
            ) : (
                    <View style={styles.container}>
                        <View style={styles.addNewButtonContainer}>
                            <TouchableOpacity
                                onPress={addNew}>
                                <AntDesign
                                    name='plus'
                                    size={32 * rem}
                                    color={'white'}
                                />
                            </TouchableOpacity>
                        </View>
                        <LicenseCard/>
                    </View >
                )
            }
        </>
    );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.grey200,
    },
    emptyText: {
        color: 'grey',
        fontSize: 16 * rem,
        textAlign: 'center',
        margin: 30 * rem,
    },
    container: {
        flex: 1,
        paddingTop: 30 * rem,
        alignItems: 'center',
        backgroundColor: colors.grey200,
    },
    addNewButtonContainer: {
        position: 'absolute',
        right: 32 * rem,
        bottom: 32 * rem,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60 * rem,
        aspectRatio: 1,
        borderRadius: (60 * rem) / 2,
        backgroundColor: colors.blue800,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
});