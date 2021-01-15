import React, { useState, useEffect } from 'react';
import { updateLicenses } from '../actions';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Dimensions, FlatList, TextInput, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';


export default function applyTowardLicense(props) {
    const licenses = useSelector(state => state.licenses);
    const allCEData = useSelector(state => state.ces);
    const dispatch = useDispatch();
    let ceID = props?.id;

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [linkedLicenses, setLinkedLicenses] = useState([]);
    const [localLicensesCopy, setLocalLicensesCopy] = useState({});

    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        // For tracking license ID user came from
        let linkedLicensesCopy = JSON.parse(JSON.stringify(linkedLicenses));
        if (props?.licenseID) {
            linkedLicensesCopy.push(props?.licenseID);
        }

        for (license in licenses) {
            for (linkedCE in licenses[license].linkedCEs) {
                // Linked to licenses
                if (linkedCE == ceID && !linkedLicensesCopy.includes(linkedCE)) {
                    linkedLicensesCopy.push(license);
                }
            }

            for (requirement of licenses[license].requirements) {
                for (linkedCE in requirement.linkedCEs) {
                    if (linkedCE == props.id && !linkedLicensesCopy.includes(linkedCE)) {
                        linkedLicensesCopy.push(license);
                    }
                }
            }
        }
        setLinkedLicenses(linkedLicensesCopy);
    }, []);

    React.useEffect(() => {
        if (props.open) {
            setIsModalVisible(true);
        }
    }, [props.open]);

    let handleDone = () => {
        setIsModalVisible(false);
        if (props.new) return; // Don't save if user is adding new CE. Save will be handled elsewhere if this is for a new CE.
        if(!Object.keys(localLicensesCopy).length) return;
        let uid = auth().currentUser.uid;
        let db = firestore();
        db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(localLicensesCopy, { merge: true })
            .then(() => {
                console.log("CE successfully applied!");
                dispatch(updateLicenses(localLicensesCopy));
            })
            .catch((error) => {
                console.error("Error applying CE: ", error);
            });
    }

    let setRequirementHours = (hours, licenseID, index) => {
        // Links CE to special requirement.
        // Set license state.
        if (props.setRequirementHours) props.setRequirementHours(hours, licenseID, index);

        let licensesCopy = JSON.parse(JSON.stringify(licenses));

        if (hours) {
            let temp = linkedLicenses.concat(licenseID);
            setLinkedLicenses(temp);

            if (typeof licensesCopy[licenseID].requirements[index]["linkedCEs"] == "object") {
                licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID] = parseInt(hours);
            }
            else {
                licensesCopy[licenseID].requirements[index]["linkedCEs"] = {};
                licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID] = parseInt(hours);
            }
        }
        else {
            delete licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID];
            let temp = linkedLicenses.filter(id => id !== licenseID || id == props?.route?.params?.id);
            setLinkedLicenses(temp);
        }
        setLocalLicensesCopy(licensesCopy);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({
        modalTransparency: {
            backgroundColor: 'rgba(0,0,0, 0.30)',
            height: '100%',
            width: '100%',
        },
        modalPopupContainer: {
            position: 'absolute',
            top: screenHeight / 8,
            backgroundColor: 'white',
            alignSelf: 'center',
            padding: 18 * rem,
            borderRadius: 10 * rem,
            maxHeight: screenHeight * (6 / 8),
            width: '98%',
        },
        emptyText: {
            fontSize: 16 * rem,
            marginBottom: 24 * rem,
            textAlign: 'center',
        },
        modalTitle: {
            fontSize: 20 * rem,
            color: colors.grey900,
            marginBottom: 24 * rem,
        },

        flexRowContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            marginBottom: 18 * rem,
            alignContent: 'center',
            alignItems: 'center',
        },
        linkedLicenseIcon: {
            height: 32 * rem,
            width: 32 * rem,
            color: colors.green500,
            marginRight: 12 * rem,
        },
        notLinkedLicenseIcon: {
            height: 32 * rem,
            width: 32 * rem,
            color: colors.grey300,
            marginRight: 12 * rem,
        },
        requirementFlexRowContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            marginBottom: 16 * rem,
            marginTop: -12 * rem,
            alignContent: 'center',
            alignItems: 'center',
        },
        licenseHoursContainer: {
            height: 50 * rem,
            width: '20%',
            marginRight: 12 * rem,
        },
        linkedLicenseText: {
            fontWeight: '500',
            fontSize: 16 * rem,
            color: colors.grey800,
            width: '75%',
        },
        notLinkedLicenseText: {
            fontWeight: '400',
            fontSize: 16 * rem,
            color: colors.grey500,
            width: '75%',
        },
        linkHoursContainer: {
            height: 50 * rem,
            width: '20%',
            marginRight: 12 * rem,
            marginLeft: 24 * rem,
        },
        linkedReqText: {
            width: '65%',
            alignSelf: "center",
            fontSize: 16 * rem,
            color: colors.grey800,
        },
        notLinkedReqText: {
            width: '65%',
            alignSelf: "center",
            fontSize: 16 * rem,
            color: colors.grey500,
        },
        input: {
            width: '100%',
            height: '100%',
            fontSize: 16 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            padding: 18 * rem,
            color: colors.grey900,
        },

        linkCEButton: {
            marginTop: 12 * rem,
            flexDirection: 'row',
            height: 50 * rem,
            backgroundColor: 'white',
            borderWidth: 2 * rem,
            borderRadius: 10 * rem,
            borderColor: colors.blue800,
            justifyContent: 'center',
            alignSelf: 'center',
            padding: 12 * rem,
            paddingLeft: 24 * rem,
            paddingRight: 24 * rem,
        },
        linkCEButtonText: {
            fontSize: 16 * rem,
            textAlign: 'center',
            color: colors.blue800,
        },

        requirementFlexRowContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            marginBottom: 16 * rem,
            marginTop: -12 * rem,
            alignContent: 'center',
            alignItems: 'center',
        },
        linkHoursContainer: {
            height: 50 * rem,
            width: '20%',
            marginRight: 12 * rem,
            marginLeft: 24 * rem,
        },
    });

    return (
        <Modal
            visible={isModalVisible}
            animationType='fade'
            transparent={true}
        >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                <View style={styles.modalTransparency} />
            </TouchableWithoutFeedback>
            <ScrollView style={styles.modalPopupContainer}>
                <Text style={styles.modalTitle}>Licenses</Text>
                {Object.keys(licenses).length ? (<FlatList
                    data={Object.keys(licenses)}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <>
                            {/* Licenses */}
                            <View style={styles.flexRowContainer}>
                                {linkedLicenses.includes(item) ?
                                    (
                                        <>
                                            <AntDesign name="checkcircleo" size={32 * rem} style={styles.linkedLicenseIcon} />
                                            <Text style={styles.linkedLicenseText}>{licenses[item].licenseState} {licenses[item].licenseType || licenses[item].otherLicenseType}</Text>
                                        </>
                                    ) : (
                                        <>
                                            <AntDesign name="checkcircleo" size={32 * rem} style={styles.notLinkedLicenseIcon} />
                                            <Text style={styles.notLinkedLicenseText}>{licenses[item].licenseState} {licenses[item].licenseType || licenses[item].otherLicenseType}</Text>
                                        </>
                                    )}
                            </View>
                            {/* Special requirements */}
                            {licenses[item].requirements.length ?
                                (
                                    <FlatList
                                        data={licenses[item].requirements}
                                        renderItem={({ index }) => (
                                            <View style={styles.requirementFlexRowContainer}>
                                                <View style={styles.linkHoursContainer}>
                                                    <TextInput
                                                        placeholder={"Hrs"}
                                                        placeholderTextColor={colors.grey400}
                                                        style={styles.input}
                                                        defaultValue={props.id && props.id in licenses[item].requirements[index].linkedCEs ? (licenses[item].requirements[index].linkedCEs[props.id].toString()) : (null)}
                                                        onChangeText={(hours) => setRequirementHours(hours, item, index)}
                                                        keyboardType={'numeric'}
                                                        maxLength={4}
                                                    />
                                                </View>
                                                <Text style={styles.linkedReqText}>{licenses[item].requirements[index].name}</Text>
                                            </View>
                                        )}
                                    />
                                ) : (null)}
                        </>
                    )}
                >
                </FlatList>) : (<Text style={styles.emptyText}>No licenses to link to!</Text>)}

                <Text style={styles.modalTitle}>Certifications</Text>


                {/* TODO: Implement certifications */}
                {Object.keys({}).length ? (null) : (<Text style={styles.emptyText}>No certifications to link to!</Text>)}


                <TouchableOpacity
                    onPress={handleDone}
                    style={styles.linkCEButton}
                >
                    <Text style={styles.linkCEButtonText}>{('Done')}</Text>
                </TouchableOpacity>
                <Text>{"\n"}</Text>
            </ScrollView>
        </Modal>
    );
}
