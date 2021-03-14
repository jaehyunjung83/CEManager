import React, { useState, useEffect } from 'react';
import { updateLicenses, updateCertifications } from '../actions';
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
    const certifications = useSelector(state => state.certifications);
    const allCEData = useSelector(state => state.ces);
    const dispatch = useDispatch();
    let ceID = props?.id;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalHasBeenOpened, setModalHasBeenOpened] = useState(false)

    // Linked licenses and certifications IDs stored in linkedData
    const [linkedData, setLinkedData] = useState([]);
    const [localLicensesCopy, setLocalLicensesCopy] = useState(JSON.parse(JSON.stringify(licenses)));
    const [localCertificationsCopy, setLocalCertificationsCopy] = useState(JSON.parse(JSON.stringify(certifications)));

    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        // For tracking license ID user came from
        let linkedDataCopy = JSON.parse(JSON.stringify(linkedData));
        if (props?.licenseID) {
            linkedDataCopy.push(props?.licenseID);
        }
        if (props?.certificationID) {
            linkedDataCopy.push(props?.certificationID);
        }

        for (const licenseID in licenses) {
            for (const requirement of licenses[licenseID].requirements) {
                for (linkedCE in requirement.linkedCEs) {
                    if (linkedCE == props.id && !linkedDataCopy.includes(licenseID)) {
                        linkedDataCopy.push(licenseID);
                    }
                }
            }
        }

        for (const certificationID in certifications) {
            for (const requirement of certifications[certificationID].requirements) {
                for (linkedCE in requirement.linkedCEs) {
                    if (linkedCE == props.id && !linkedDataCopy.includes(certificationID)) {
                        linkedDataCopy.push(certificationID);
                    }
                }
            }
        }
        setLinkedData(linkedDataCopy);
    }, []);

    React.useEffect(() => {
        if (props.open) {
            getDefaultHoursValue();
            if(!modalHasBeenOpened && props.hours && (props.licenseID || props.certificationID)) {
                let tempCopy = props.licenseID ? JSON.parse(JSON.stringify(licenses)) : JSON.parse(JSON.stringify(certifications))
                const dataID = props.licenseID ? props.licenseID : props.certificationID;
                for(const index in tempCopy[dataID].requirements) {
                    if(tempCopy[dataID].requirements[index].name == "Total CEs Needed") {
                        tempCopy[dataID].requirements[index].linkedCEs[ceID] = Number(props.hours);
                        props.licenseID ? setLocalLicensesCopy(tempCopy) : setLocalCertificationsCopy(tempCopy);
                        const idToPass = props.licenseID ? {licenseID: dataID} : {certificationID: dataID};
                        setRequirementHours(props.hours, index, idToPass)
                    }
                }
            }
            setIsModalVisible(true);
        }
    }, [props.open]);

    let getDefaultHoursValue = (item, index) => {
        // console.log(`getDefaultHoursValue(): modalHasBeenOpened: ${modalHasBeenOpened}, hours: ${props.hours}, item: ${item}, index: ${index}`);
        if (!modalHasBeenOpened && props.hours && props.licenseID && props.licenseID == item && licenses[item].requirements[index].name == "Total CEs Needed") {
            // If this is the first time this has been opened, we can set hours to hours on Add CE screen.
            return props.hours.toString();
        }
        else if (localLicensesCopy[item] && ceID && ceID in localLicensesCopy[item].requirements[index].linkedCEs) {
            console.log(localLicensesCopy[item].requirements[index]?.["linkedCEs"]?.[ceID].toString())
            return localLicensesCopy[item].requirements[index]?.["linkedCEs"]?.[ceID].toString();
        }
        // Certifications
        else if (!modalHasBeenOpened && props.hours && props.certificationID && props.certificationID == item && certifications[item].requirements[index].name == "Total CEs Needed") {
            // If this is the first time this has been opened, we can set hours to hours on Add CE screen.
            return props.hours.toString();
        }
        else if (localCertificationsCopy[item] && ceID && ceID in localCertificationsCopy[item].requirements[index].linkedCEs) {
            console.log(localCertificationsCopy[item].requirements[index]?.["linkedCEs"]?.[ceID].toString())
            return localCertificationsCopy[item].requirements[index]?.["linkedCEs"]?.[ceID].toString();
        }
        else {
            return null;
        }
    }

    let handleDone = () => {
        setModalHasBeenOpened(true);
        setIsModalVisible(false);
        if (props.new) return; // Don't save if user is adding new CE. Save will be handled elsewhere if this is for a new CE.
        if (!Object.keys(localLicensesCopy).length) return;
        let uid = auth().currentUser.uid;
        let db = firestore();
        if (JSON.parse(JSON.stringify(licenses)) !== JSON.parse(JSON.stringify(localLicensesCopy))) {
            db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(localLicensesCopy, { merge: true })
                .then(() => {
                    console.log("CE successfully applied!");
                    dispatch(updateLicenses(localLicensesCopy));
                })
                .catch((error) => {
                    console.error("Error applying CE: ", error);
                });
        }

        if (JSON.parse(JSON.stringify(certifications)) !== JSON.parse(JSON.stringify(localCertificationsCopy))) {
            db.collection('users').doc(uid).collection('certifications').doc('certificationData').set(localCertificationsCopy, { merge: true })
                .then(() => {
                    console.log("CE successfully applied!");
                    dispatch(updateCertifications(localCertificationsCopy));
                })
                .catch((error) => {
                    console.error("Error applying CE: ", error);
                });
        }
    }

    let setRequirementHours = (hours, index, id = { licenseID: "", certificationID: "" }) => {
        // Links CE to special requirement.
        // Set license state.
        const dataID = id.licenseID || id.certificationID;
        let dataCopy = id.licenseID ? JSON.parse(JSON.stringify(localLicensesCopy)) : JSON.parse(JSON.stringify(localCertificationsCopy));

        if (props.setRequirementHours && props.setRequirementHours !== null) {
            id.licenseID ? props.setRequirementHours(hours, index, { licenseID: dataID }) : props.setRequirementHours(hours, index, { certificationID: dataID })
        }


        if (hours && hours !== "0") {
            let temp = linkedData.concat(dataID);
            setLinkedData(temp);

            if (typeof dataCopy[dataID].requirements[index]["linkedCEs"] == "object") {
                dataCopy[dataID].requirements[index]["linkedCEs"][ceID] = Number(hours);
            }
            else {
                dataCopy[dataID].requirements[index]["linkedCEs"] = {};
                dataCopy[dataID].requirements[index]["linkedCEs"][ceID] = Number(hours);
            }
        }
        else {
            delete dataCopy[dataID].requirements[index]["linkedCEs"][ceID];
            let temp = linkedData.filter(id => id !== dataID || id == props?.route?.params?.id);
            setLinkedData(temp);
        }
        id.licenseID ? setLocalLicensesCopy(dataCopy) : setLocalCertificationsCopy(dataCopy);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({
        modalTransparency: {
            backgroundColor: 'rgba(0,0,0, 0.50)',
            height: '100%',
            width: '100%',
            position: 'absolute',
        },
        modalPopupContainer: {
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
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
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

        fixedBottomContainer: {
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
            marginBottom: 12 * rem,
            width: '100%',
            backgroundColor: 'white',
        }
    });

    return (
        <Modal
            visible={isModalVisible}
            animationType='fade'
            transparent={true}
        >
            <TouchableWithoutFeedback onPress={() => { setIsModalVisible(false); setModalHasBeenOpened(true); }}>
                <View style={styles.modalTransparency} />
            </TouchableWithoutFeedback>
            <View style={styles.modalPopupContainer}>
                <ScrollView keyboardShouldPersistTaps={'always'} style={{marginBottom: 64 * rem}}>
                    <Text style={styles.modalTitle}>Licenses</Text>
                    {Object.keys(licenses).length ? (<FlatList
                        data={Object.keys(licenses).filter(key => !licenses[key].complete)}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <>
                                {/* Licenses */}
                                <View style={styles.flexRowContainer}>
                                    {linkedData.includes(item) ?
                                        (
                                            <>
                                                <AntDesign name="checkcircleo" size={32 * rem} style={styles.linkedLicenseIcon} />
                                                <Text style={styles.linkedLicenseText}>{licenses[item].licenseState} {licenses[item].licenseType !== "Other" ? licenses[item].licenseType : licenses[item].otherLicenseType}</Text>
                                            </>
                                        ) : (
                                            <>
                                                <AntDesign name="checkcircleo" size={32 * rem} style={styles.notLinkedLicenseIcon} />
                                                <Text style={styles.notLinkedLicenseText}>{licenses[item].licenseState} {licenses[item].licenseType !== "Other" ? licenses[item].licenseType : licenses[item].otherLicenseType}</Text>
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
                                                            defaultValue={props.id && props.id in licenses[item].requirements[index].linkedCEs ? (licenses[item].requirements[index].linkedCEs[props.id].toString()) : (getDefaultHoursValue(item, index))}
                                                            onChangeText={(hours) => setRequirementHours(hours, index, { licenseID: item })}
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
                    </FlatList>) : (<Text style={styles.emptyText}>No licenses to apply to!</Text>)}

                    <Text style={styles.modalTitle}>Certifications</Text>


                    {Object.keys(certifications).length ? (
                        <FlatList
                            data={Object.keys(certifications).filter(key => !certifications[key].complete)}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <>
                                    {/* Certifications */}
                                    <View style={styles.flexRowContainer}>
                                        {linkedData.includes(item) ?
                                            (
                                                <>
                                                    <AntDesign name="checkcircleo" size={32 * rem} style={styles.linkedLicenseIcon} />
                                                    <Text style={styles.linkedLicenseText}>{certifications[item].name}</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <AntDesign name="checkcircleo" size={32 * rem} style={styles.notLinkedLicenseIcon} />
                                                    <Text style={styles.notLinkedLicenseText}>{certifications[item].name}</Text>
                                                </>
                                            )}
                                    </View>
                                    {/* Special requirements */}
                                    {certifications[item].requirements.length ?
                                        (
                                            <FlatList
                                                data={certifications[item].requirements}
                                                renderItem={({ index }) => (
                                                    <View style={styles.requirementFlexRowContainer}>
                                                        <View style={styles.linkHoursContainer}>
                                                            <TextInput
                                                                placeholder={"Hrs"}
                                                                placeholderTextColor={colors.grey400}
                                                                style={styles.input}
                                                                defaultValue={props.id && props.id in certifications[item].requirements[index].linkedCEs ? (certifications[item].requirements[index].linkedCEs[props.id].toString()) : (getDefaultHoursValue(item, index))}
                                                                onChangeText={(hours) => setRequirementHours(hours, index, { certificationID: item })}
                                                                keyboardType={'numeric'}
                                                                maxLength={4}
                                                            />
                                                        </View>
                                                        <Text style={styles.linkedReqText}>{certifications[item].requirements[index].name}</Text>
                                                    </View>
                                                )}
                                            />
                                        ) : (null)}
                                </>
                            )}
                        >
                        </FlatList>
                    ) : (<Text style={styles.emptyText}>No certifications to apply to!</Text>)}

                </ScrollView>
                <View style={styles.fixedBottomContainer}>
                        <TouchableOpacity
                            onPress={handleDone}
                            style={styles.linkCEButton}
                        >
                            <Text style={styles.linkCEButtonText}>{('Done')}</Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </Modal>
    );
}
