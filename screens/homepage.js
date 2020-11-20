import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses } from '../actions';

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import AddNew from '../images/addNew.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LicenseCard from '../components/licenseCard.js';
import { colors } from '../components/colors.js';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function homepage(props) {
    const licenses = useSelector(state => state.licenses);
    const dispatch = useDispatch();

    const [isEmpty, setIsEmpty] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    let addNew = () => {
        props.navigation.navigate("AddNew");
    }

    let addCE = () => {
    }

    let linkExistingCE = () => {
        // TODO:
    }

    let cardPressed = () => {
        // TODO:
    }

    let getLicenseData = async () => {
        console.log("Getting license data");
        // Try converting to async function.
        let uid = auth().currentUser.uid;
        let db = firestore();
        await db.collection('users').doc(uid).collection('licenses').doc('licenseData').get()
            .then(async (response) => {

                let data = response.data();
                // Checking if data is empty
                if (typeof data == 'undefined' || Object.keys(data).length === 0 && data.constructor === Object) {
                    setIsLoading(false);
                    setIsEmpty(true);
                }
                else {
                    setIsEmpty(false);
                    for (const license in data) {
                        // Overriding requirements with supported state requirements.
                        // Overrides previous requirement state due to setState being async.
                        await db.collection('requirements').doc(data[license].licenseType).get()
                            .then(res => {
                                const reqData = res.data();
                                if (reqData?.[data[license].licenseState]) {
                                    // Setting totalCEHours needed
                                    if (reqData[data[license].licenseState].totalCEHours) {
                                        data[license].totalCEHours = reqData[data[license].licenseState].totalCEHours;
                                    }
                                }
                            })
                            .catch(e => {
                                console.log("Error getting requirements for this type of license: ", e);
                            })
                    }
                    setIsLoading(false);
                    dispatch(updateLicenses(data));
                }
            })
            .catch((error) => {
                console.log("Error getting document: ", error);
                setIsLoading(false);
            });
    }

    // Allows us to refresh page from other screens.
    // Note, seems to cause problems with animations. Other pages navigating to here are no longer animated if this page is refreshed.
    // if (typeof props.route?.params?.refreshPage !== 'undefined') {
    //     if (props.route?.params?.refreshPage) {
    //         props.navigation.setParams({
    //             refreshPage: false
    //         })
    //         getLicenseData();
    //     }
    // }

    React.useEffect(() => {
        getLicenseData();
    }, [])

    if (isLoading) {
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
                                size={32 * rem}
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
                            contentContainerStyle={{ paddingBottom: 48 * rem }}
                            data={Object.keys(licenses)}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <LicenseCard
                                    data={licenses[item]}
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