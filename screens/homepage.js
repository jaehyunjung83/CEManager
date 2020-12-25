import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses, updateCEs } from '../actions';

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

    let linkExistingCE = () => {
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
                    setIsEmpty(true);
                }
                else {
                    setIsEmpty(false);
                    let updatedLicenses = await updateLicenseRequirements(data);
                    dispatch(updateLicenses(updatedLicenses));
                }
            })
            .catch((error) => {
                console.log("Error getting document: ", error);
            });
    }

    let getCEData = async () => {
        console.log("Getting CE data");
        let uid = auth().currentUser.uid;
        let db = firestore();
        db.collection('users').doc(uid).collection('CEs').doc('CEData').get()
            .then((response) => {

                let data = response.data();
                // Checking if data is empty
                if (typeof data == 'undefined' || Object.keys(data).length === 0 && data.constructor === Object) {
                }
                else {
                    dispatch(updateCEs(data));
                }
            })
            .catch((error) => {
                console.log("Error getting CEs: ", error);
            });
    }

    let updateLicenseRequirements = async (licensesData) => {
        let db = firestore();
        // Overriding requirements with supported state requirements.
        // Overrides previous requirement state due to setState being async.
        let licensesCopy = JSON.parse(JSON.stringify(licensesData));
        let hasUpdatedALicense = false;
        for (let key in licensesData) {
            let res = await db.collection('requirements').doc(licensesData[key].licenseType).get()
            if (!res.data()) {
                console.log(`${licensesData[key].licenseType}(${licensesData[key].licenseState}): State or license type not officially supported.`)
                continue;
            }
            const data = res.data();
            if (!data || !data[licensesData[key].licenseState]) {
                console.log(`${licensesData[key].licenseType}(${licensesData[key].licenseState}): State or license type not officially supported.`)
                continue;
            }

            if (licensesData[key].officialRequirementUpdateDate?.["_seconds"]) {
                // Firebase Timestamp is converted to object when copying to new licensesCopy object.
                // So it is convenient to convert it back to a Timestamp.
                licensesCopy[key].officialRequirementUpdateDate = new firestore.Timestamp(licensesCopy[key].officialRequirementUpdateDate["_seconds"], 0);
            }
            if (licensesData[key].officialRequirementUpdateDate?.valueOf()?.seconds == data[licensesData[key].licenseState].lastUpdated.valueOf().seconds) {
                console.log(`${licensesData[key].licenseType}(${licensesData[key].licenseState}): Officially supported and up to date.`)
                continue;
            }

            hasUpdatedALicense = true;
            licensesCopy[key].officialRequirementUpdateDate = new firestore.Timestamp(data[licensesData[key].licenseState].lastUpdated.valueOf().seconds, 0);
            // Setting totalCEHours needed
            if (data[licensesData[key].licenseState].totalCEHours) {
                licensesCopy[key].totalCEHours = data[licensesData[key].licenseState].totalCEHours;
            }
            else {
                delete licensesCopy.totalCEHours;
            }

            // Setting special requirements
            let newRequirements = [];
            for (const newRequirement of data[licensesData[key].licenseState].requirements) {
                let found = false;
                for (const oldRequirement of licensesCopy[key].requirements) {
                    if (newRequirement.key == oldRequirement.key) {
                        newRequirements.push(oldRequirement);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newRequirements.push(newRequirement);
                }
            }
            licensesCopy[key].requirements = newRequirements;
        }

        if (hasUpdatedALicense) {
            console.log("Some licenses requirements were updated. Updating firebase...");
            let uid = auth().currentUser.uid;
            db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licensesCopy, { merge: true })
                .then(() => {
                    console.log("Updated licenses with official supported state requirements.");
                    return licensesCopy;
                })
                .catch((error) => {
                    console.error("Error applying CE: ", error);
                });
        }
        else {
            console.log("All license requirements up to date with official requirements.");
            return licensesCopy;
        }
    }

    React.useEffect(() => {
        async function fetchData() {
            await getLicenseData();
            await getCEData();
            setIsLoading(false);
        };
        fetchData();
    }, [])

    if (isLoading) {
        return (<View style={styles.emptyContainer}></View>)
    }

    if (isEmpty) {
        return (
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
        )
    }

    return (
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