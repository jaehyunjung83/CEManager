import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import AddNew from '../images/addNew.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LicenseCard from '../components/licenseCard.js';
import { colors } from '../components/colors.js';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function homepage(props) {

    const [isEmpty, setIsEmpty] = useState(true);
    const [licenseDataObj, setLicenseDataObj] = useState({})
    const [licenseDataArray, setLicenseDataArray] = useState('');
    const [hasGrabbedData, setHasGrabbedData] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    let addNew = () => {
        props.navigation.navigate("AddNew");
    }

    let addCE = () => {
    }

    let submitToState = () => {
        // TODO:
    }

    let cardPressed = () => {
        // TODO:
    }

    if (!hasGrabbedData) {
        let uid = auth().currentUser.uid;
        let db = firestore();
        db.collection('users').doc(uid).collection('licenses').doc('licenseData').get()
            .then((response) => {
                setHasGrabbedData(true);

                let data = response.data();
                // Checking if data is empty
                if (Object.keys(data).length === 0 && data.constructor === Object) {
                    setIsLoading(false);
                }
                else {
                    let licenseArr = [];
                    for (const license in data) {
                        licenseArr.push(data[license]);
                    }
                    setLicenseDataArray(licenseArr);
                    setLicenseDataObj(data);
                    setIsEmpty(false);
                    setIsLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error getting document: ", error);
                setIsLoading(false);
            });
    }

    if(isLoading) {
        return (<View style={styles.emptyContainer}></View>)
    }

    return (
        <>
            {isEmpty ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.addNewButtonContainer}>
                        <TouchableOpacity
                            onPress={addNew}>
                            <AntDesign
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
                        <FlatList
                            data={licenseDataArray}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <LicenseCard
                                    data={item}
                                />
                            )}
                        />
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