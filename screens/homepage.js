import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses, updateCEs, updateCertifications } from '../actions';

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import AddNew from '../images/addNew.svg';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LicenseCard from '../components/licenseCard.js';
import CertificationCard from '../components/certificationCard.js';
import { colors } from '../components/colors.js';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function homepage(props) {
    const licenses = useSelector(state => state.licenses);
    const allCEData = useSelector(state => state.ces);
    const certifications = useSelector(state => state.certifications);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [isEmpty, setIsEmpty] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [licensesDisplayed, setLicensesDisplayed] = useState(-1);
    const [IDList, setIDList] = useState([]);

    let addNew = () => {
        props.navigation.navigate("AddNew");
    }

    let getLicenseData = async () => {
        console.log("Getting license data");
        // Try converting to async function.
        let uid = auth().currentUser.uid;
        let db = firestore();
        let response = await db.collection('users').doc(uid).collection('licenses').doc('licenseData').get();
        let data = response.data();
        // Checking if data is empty
        if (typeof data == 'undefined' || data && Object.keys(data).length === 0) {
            dispatch(updateLicenses({}));
        }
        else {
            setIsEmpty(false);
            let updatedLicenses = await updateLicenseRequirements(data);
            dispatch(updateLicenses(updatedLicenses));
        }
    }

    let getCEData = async () => {
        console.log("Getting CE data");
        let uid = auth().currentUser.uid;
        let db = firestore();
        db.collection('users').doc(uid).collection('CEs').doc('CEData').get()
            .then((response) => {

                let data = response.data();
                // Checking if data is empty
                if (typeof data == 'undefined' || data && Object.keys(data).length === 0) {
                    dispatch(updateCEs({}));
                }
                else {
                    dispatch(updateCEs(data));
                }
            })
            .catch((error) => {
                console.log("Error getting CEs: ", error);
            });
    }

    let getCertificationData = async () => {
        console.log("Getting certification data");
        // Try converting to async function.
        let uid = auth().currentUser.uid;
        let db = firestore();
        let response = await db.collection('users').doc(uid).collection('certifications').doc('certificationData').get();
        let data = response.data();
        // Checking if data is empty
        console.log(`certification data: ${data}`);
        if (typeof data == 'undefined' || data && Object.keys(data).length === 0) {
            dispatch(updateCertifications({}));
        }
        else {
            dispatch(updateCertifications(data));
        }
    }

    let updateLicenseRequirements = async (licensesData) => {
        let db = firestore();
        // Overriding requirements with supported state requirements.
        // Overrides previous requirement state due to setState being async.
        let licensesCopy = JSON.parse(JSON.stringify(licensesData));
        let hasUpdatedALicense = false;
        for (let key in licensesCopy) {
            let res = await db.collection('requirements').doc(licensesCopy[key].licenseType).get()
            if (!res.data()) {
                console.log(`${licensesCopy[key].licenseType}(${licensesCopy[key].licenseState}): State or license type not officially supported.`)
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

            // Setting special requirements
            let newRequirements = [];
            for (let newRequirement of data[licensesCopy[key].licenseState].requirements) {
                let found = false;
                if (newRequirement.name == "Total CEs Needed") {
                    // licensesCopy.linkedCEs used to be linked to the general CE hour requirement, so we move these to the Total CEs Needed requirement.
                    if (typeof licensesCopy[key].linkedCEs == "object" && Object.keys(licensesCopy[key].linkedCEs).length) {
                        newRequirement.linkedCEs = JSON.parse(JSON.stringify(licensesCopy[key].linkedCEs));
                        licensesCopy[key].linkedCEs = {};
                    }
                }

                if (licensesCopy[key].requirements) {
                    for (let oldRequirement of licensesCopy[key].requirements) {
                        if (newRequirement.key == oldRequirement.key) {
                            if (oldRequirement.linkedCEs) {
                                newRequirement.linkedCEs = oldRequirement.linkedCEs;
                            }
                            newRequirements.push(newRequirement);
                            found = true;
                            break;
                        }
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
        return licensesCopy;
    }

    let checkLinkedCEsExist = async () => {
        console.log("Checking that all linkedCEs exist");
        let changesMade = false;
        let licensesCopy = JSON.parse(JSON.stringify(licenses));
        let uid = auth().currentUser.uid;
        let db = firestore();

        for (const licenseID in licenses) {
            for (const requirementIndex in licenses[licenseID].requirements) {
                for (const linkedCE in licenses[licenseID].requirements[requirementIndex].linkedCEs) {
                    if (!(linkedCE in allCEData)) {
                        console.log(`${linkedCE} does not exist, removing from linkedCEs`);
                        delete licensesCopy[licenses[licenseID].id].requirements[requirementIndex].linkedCEs[linkedCE];
                        changesMade = true;
                    }
                }
            }
            if (changesMade) {
                await db.collection("users").doc(uid).collection("licenses").doc("licenseData").set(licensesCopy);
                dispatch(updateLicenses(licensesCopy));
            }
        }
    }

    React.useEffect(() => {
        async function fetchData() {
            const licenseDataPromise = await getLicenseData();
            const ceDataPromise = await getCEData();
            const certificationDataPromise = await getCertificationData();
            Promise.all([licenseDataPromise, ceDataPromise, certificationDataPromise]).then(async () => {
                await checkLinkedCEsExist();
                setIsLoading(false);
            });
        };
        fetchData();
    }, [])

    React.useEffect(() => {
        setIDList([]);
        setIDList(Object.keys({ ...licenses, ...certifications }));
        let licensesToDisplay = Object.keys({ ...licenses, ...certifications }).filter(key => licenses[key] && !licenses[key].complete).length;
        setLicensesDisplayed(licensesToDisplay);

        if (!Object.keys({ ...licenses, ...certifications }).filter(key => (licenses[key] && !licenses[key].complete) || (certifications[key] && !certifications[key].complete)).length) {
            setIsEmpty(true);
        }
        else {
            setIsEmpty(false);
        }
    }, [JSON.stringify(licenses), JSON.stringify(certifications), JSON.stringify(allCEData)])

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
            width: screenWidth,
        },
        header: {
            fontSize: 22 * rem,
            color: colors.blue800,
            textAlign: 'left',
            width: '100%',
            fontWeight: '500',
            marginLeft: 16 * rem,
            marginTop: 12 * rem,
        },
        addNewButtonContainer: {
            position: 'absolute',
            right: 32 * rem,
            bottom: 32 * rem,
            alignItems: 'center',
            justifyContent: 'center',
            height: 60 * rem,
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
        addNewText: {
            fontSize: 20 * rem,
            color: 'white',
            paddingRight: 24 * rem,
            paddingLeft: 24 * rem,
        },

        wrapper: {
            margin: 0,
            padding: 0,
        }
    });


    if (isLoading) {
        return (<View style={styles.emptyContainer}></View>)
    }

    if (isEmpty) {
        return (
            <View style={styles.emptyContainer}>
                < View style={styles.addNewButtonContainer} >
                    <TouchableOpacity
                        onPress={addNew}>
                        <Text style={styles.addNewText}>
                            <AntDesign
                                name='plus'
                                size={20 * rem}
                                color={'white'}
                            />
                                Add Credential
                            </Text>
                    </TouchableOpacity>
                </View >
                <AddNew width={screenWidth - (50 * rem)} height={200 * rem} />
                <Text style={styles.emptyText}>You don't have any licenses or certifications added yet. Add one to start tracking!</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                contentContainerStyle={{ paddingBottom: 48 * rem }}
                data={IDList.filter(key => !licenses[key]?.complete && !certifications[key]?.complete).sort((a, b) => {
                    if ((a in licenses && b in licenses)) {
                        return new Date(licenses[a].licenseExpiration) - new Date(licenses[b].licenseExpiration)
                    }
                    else if ((a in certifications && b in certifications)) {
                        return new Date(certifications[a].expiration) - new Date(certifications[b].expiration)
                    }
                    else if (a in licenses) {
                        return -1;
                    }
                    return 1;
                })}
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => (
                    <>
                        {item in licenses && index == 0 && <Text style={styles.header}>Licenses</Text>}

                        {item in certifications && index == licensesDisplayed && <Text style={styles.header}>Certifications</Text>}

                        {item in licenses && !licenses[item].complete && <LicenseCard
                            data={item}
                        />}
                        {item in certifications && !certifications[item].complete && <CertificationCard
                            data={item}
                        />}
                    </>
                )}
            />

            < View style={styles.addNewButtonContainer} >
                <TouchableOpacity
                    onPress={addNew}>
                    <Text style={styles.addNewText}>
                        <AntDesign
                            name='plus'
                            size={20 * rem}
                            color={'white'}
                        />
                                Add Credential
                            </Text>
                </TouchableOpacity>
            </View >
        </View >

    );
}

