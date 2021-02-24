import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, TouchableHighlight, ScrollView, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import ExpandingCE from "../components/expandingCE.js";
import { updateLicenses } from '../actions';

import Toast from 'react-native-simple-toast';

export default function linkExistingCE(props) {
    let licenseID = props.licenseID;

    const SELECTING_REQUIREMENT = 0;
    const SELECTING_CE = 1;
    const INPUTTING_CE_HOURS = 2;
    const CONFIRMATION_PAGE = 3;

    // Types of CE changes
    const UNLINKED = "UNLINKED";
    const UPDATED = "UPDATED";
    const NEWLY_LINKED = "NEWLY LINKED";

    const licenses = useSelector(state => state.licenses);
    const allCEData = useSelector(state => state.ces);
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState("");
    const [licenseCopy, setLicenseCopy] = useState(JSON.parse(JSON.stringify(licenses[licenseID])));
    const [ceDataCopy, setCEDataCopy] = useState(JSON.parse(JSON.stringify(allCEData)));
    const [currentStep, setCurrentStep] = useState(SELECTING_REQUIREMENT);
    const [previousStep, setPreviousStep] = useState(0);
    const [ceChanges, setCEChanges] = useState([]);
    const [linkedHoursInputs, setLinkedHoursInputs] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");


    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        if (props.open) {
            resetState();
            setIsModalVisible(true);
        }
    }, [props.open], JSON.stringify(allCEData));

    let resetState = () => {
        setCurrentStep(SELECTING_REQUIREMENT);
        setSelectedRequirement("");
        setLicenseCopy(JSON.parse(JSON.stringify(licenses[licenseID])));
        setPreviousStep(0);
        setCEChanges([]);
        setLinkedHoursInputs([]);
        setErrorMsg("");
    }

    let handleDone = () => {
        setPreviousStep(currentStep);
        setCurrentStep(CONFIRMATION_PAGE);
        calculateCEChanges();
    }

    let calculateCEChanges = () => {
        let oldLinkedCEs = licenses?.[licenseID]?.requirements?.[selectedRequirement]?.linkedCEs;
        let newLinkedCEs = licenseCopy.requirements?.[selectedRequirement]?.linkedCEs;
        let ceChangesArr = [];
        if (!oldLinkedCEs) {
            setCEChanges([]);
            return;
        }
        for (const linkedCE in newLinkedCEs) {
            if (linkedCE in oldLinkedCEs) {
                if (oldLinkedCEs[linkedCE] !== newLinkedCEs[linkedCE]) {
                    // CE was previously linked, number of hours changed.
                    console.log(`${allCEData[linkedCE].name} changed from ${oldLinkedCEs[linkedCE]} to ${newLinkedCEs[linkedCE]}`);
                    ceChangesArr.push({
                        type: UPDATED,
                        ceID: linkedCE,
                        hours: newLinkedCEs[linkedCE],
                        name: allCEData[linkedCE].name,
                        completionDate: allCEData[linkedCE].completionDate,
                    })
                }
            }
            else {
                // CE is newly linked.
                console.log(`Newly linked CE ${allCEData[linkedCE].name}: ${newLinkedCEs[linkedCE]}`);
                ceChangesArr.push({
                    type: NEWLY_LINKED,
                    ceID: linkedCE,
                    hours: newLinkedCEs[linkedCE],
                    name: allCEData[linkedCE].name,
                    completionDate: allCEData[linkedCE].completionDate,
                })
            }
        }

        for (const linkedCE in oldLinkedCEs) {
            if (linkedCE in newLinkedCEs) continue;
            // CE that was previously in the old linked CEs is not in new linked CEs.
            // Therefore, it has been unlinked.
            console.log(`Unlinked CE: ${allCEData[linkedCE].name}`);
            ceChangesArr.push({
                type: UNLINKED,
                ceID: linkedCE,
                name: allCEData[linkedCE].name,
                completionDate: allCEData[linkedCE].completionDate,
            })
        }

        if (ceChangesArr.length) {
            ceChangesArr.sort((a, b) => { return new Date(b.completionDate) - new Date(a.completionDate) });
            ceChangesArr.sort((a, b) => {
                if (a.type == NEWLY_LINKED && b.type !== NEWLY_LINKED) return -1;
                if (b.type == NEWLY_LINKED && a.type !== NEWLY_LINKED) return 1;
                if (a.type == UNLINKED && b.type !== UNLINKED) return 1;
                if (b.type == UNLINKED && a.type !== UNLINKED) return -1;
            });
            setCEChanges(ceChangesArr);
        }
    }

    let handleBack = () => {
        if (currentStep == INPUTTING_CE_HOURS) {
            setCurrentStep(0);
        }
        else if (currentStep == CONFIRMATION_PAGE) {
            setCurrentStep(previousStep);
        }
        else {
            setCurrentStep(currentStep - 1);
        }
    }

    let handleSave = () => {
        if (ceChanges.length) {
            let uid = auth().currentUser.uid;
            let db = firestore();
            let licenseObj = { [licenseCopy.id]: JSON.parse(JSON.stringify(licenseCopy)) }
            db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
                .then(() => {
                    console.log("Document successfully written!");
                    db.collection('users').doc(uid).collection('licenses').doc('licenseData').get()
                        .then(response => {
                            dispatch(updateLicenses(response.data()));
                            setIsModalVisible(false);
                            Toast.showWithGravity(`Saved!`, Toast.LONG, Toast.TOP);
                            resetState();
                        })
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    setErrorMsg("Something went wrong, please try again");
                });
        }
        else {
            setIsModalVisible(false);
        }
    }

    let handleRequirementSelected = (requirement, index) => {
        console.log(`Selected requirement: ${requirement} index: ${index}`);
        setSelectedRequirement(index);
        if (requirement.hours) {
            setCurrentStep(INPUTTING_CE_HOURS);
        }
        else {
            setCurrentStep(SELECTING_CE);
        }
    }

    let handleLinkedHours = (hours, ceID, index) => {
        if (hours) {
            hours = hours.replace(/[^0-9.]/g, '');
            if (hours.replace(/[^.]/g, "").length > 1) {
                // Making it so there can only be on decimal point.
                let decimalIndex = hours.indexOf(".");
                hours = hours.replace(/[^0-9]/g, '');
                hours = hours.slice(0, decimalIndex) + "." + hours.slice(decimalIndex);
            }
            while (hours.charAt(0) == "0") {
                hours = hours.substring(1);
            }
            if (!hours.includes(".")) {
                hours = Number(hours);
            }

            let linkedHoursInputsCopy = JSON.parse(JSON.stringify(linkedHoursInputs));
            linkedHoursInputsCopy[index] = hours.toString();
            setLinkedHoursInputs(linkedHoursInputsCopy);
        }
        else {
            let linkedHoursInputsCopy = JSON.parse(JSON.stringify(linkedHoursInputs));
            linkedHoursInputsCopy[index] = "0";
            setLinkedHoursInputs(linkedHoursInputsCopy);
        }

        hours = Number(hours);
        let localLicenseCopy = JSON.parse(JSON.stringify(licenseCopy));
        if (!hours) {
            delete localLicenseCopy.requirements[selectedRequirement].linkedCEs[ceID];
        }
        else {
            if (localLicenseCopy.requirements[selectedRequirement].linkedCEs) {
                localLicenseCopy.requirements[selectedRequirement].linkedCEs[ceID] = hours;
            }
            else {
                localLicenseCopy.requirements[selectedRequirement].linkedCEs = {};
                localLicenseCopy.requirements[selectedRequirement].linkedCEs[ceID] = hours;
            }
        }
        setLicenseCopy(JSON.parse(JSON.stringify(localLicenseCopy)));
    }

    let getDefaultCEHours = (ceID) => {
        if (licenseCopy.requirements[selectedRequirement].linkedCEs && Object.keys(licenseCopy.requirements[selectedRequirement].linkedCEs).includes(ceID)) {
            return licenseCopy.requirements[selectedRequirement].linkedCEs[ceID].toString();
        }
        if (licenseCopy.linkedCEs && Object.keys(licenseCopy.linkedCEs).includes(ceID)) {
            return licenseCopy.linkedCEs[ceID].toString();
        }
        return "0";
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
            position: 'absolute',
        },
        modalPopupContainer: {
            flexShrink: 1,
            backgroundColor: 'white',
            padding: 18 * rem,
            borderRadius: 10 * rem,
            maxHeight: screenHeight * (6 / 8),
            width: '98%',
            minHeight: screenHeight * (2 / 8),
        },
        emptyText: {
            fontSize: 16 * rem,
            marginBottom: 24 * rem,
            textAlign: 'center',
        },
        modalTitle: {
            fontSize: 22 * rem,
            color: colors.grey900,
            marginBottom: 24 * rem,
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

        // SELECTING_REQUIREMENT
        requirementContainer: {
            borderWidth: 2 * rem,
            borderColor: "transparent",
            borderBottomColor: colors.grey300,
            marginBottom: 16 * rem,
            justifyContent: "center"
        },
        requirementText: {
            fontSize: 18 * rem,
            margin: 0,
            padding: 0,
            marginLeft: 8 * rem,
            marginRight: 20 * rem,
        },
        requirementHoursNeeded: {
            fontSize: 18 * rem,
            color: colors.green600,
        },
        nextArrow: {
            alignSelf: "flex-end",
            position: "absolute",
        },

        // SELECTING_CE
        flexRowContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'space-evenly',
        },
        expandingCEContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            alignContent: 'flex-start',
            alignItems: 'flex-start',
            paddingBottom: 6 * rem,
            marginBottom: 18 * rem,
            borderWidth: 2 * rem,
            borderColor: "transparent",
            borderBottomColor: colors.grey300,
        },
        hoursInput: {
            width: 60 * rem,
            height: 50 * rem,
            marginRight: 12 * rem,
            fontSize: 16 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            padding: 12 * rem,
            color: colors.grey900,
        },

        // CONFIRMATION_PAGE
        requirementName: {
            fontSize: 17 * rem,
            marginBottom: 9 * rem,
        },
        unlinkedType: {
            marginLeft: 12 * rem,
            marginRight: 12 * rem,
            marginBottom: 6 * rem,
            fontSize: 14 * rem,
            color: "red",
        },
        updatedType: {
            marginLeft: 12 * rem,
            marginRight: 12 * rem,
            marginBottom: 6 * rem,
            fontSize: 14 * rem,
            color: "orange",
        },
        newlyLinkedType: {
            marginLeft: 12 * rem,
            marginRight: 12 * rem,
            marginBottom: 6 * rem,
            fontSize: 14 * rem,
            color: colors.green600,
        },
        ceName: {
            fontWeight: "500",
            fontSize: 17 * rem,
        },
        ceHours: {
            paddingLeft: 4 * rem,
            fontWeight: "500",
            fontSize: 17 * rem,
        }
    });

    return (
        <Modal
            visible={isModalVisible}
            animationType='fade'
            transparent={true}
        >
            <View style={{
                flex: 1,
                justifyContent: 'center',
                margin: 0,
            }}>
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalTransparency} />
                </TouchableWithoutFeedback>

                {currentStep == SELECTING_REQUIREMENT ? (
                    <View style={styles.modalPopupContainer}>
                        <ScrollView keyboardShouldPersistTaps={'always'}>
                            <Text style={styles.modalTitle}>Select a requirement</Text>
                            {licenseCopy.requirements.length ? (<FlatList
                                data={licenseCopy.requirements}
                                keyExtractor={item => item.key}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={styles.requirementContainer}
                                        onPress={() => { handleRequirementSelected(item, index) }}>
                                        <Text style={styles.requirementText}>
                                            {item.hours ? (<Text style={styles.requirementHoursNeeded}>{item.hours}  </Text>) : (null)}{item.name}
                                        </Text>
                                        <AntDesign name="right" size={20 * rem} style={styles.nextArrow} />

                                    </TouchableOpacity>
                                )}
                            >
                            </FlatList>) : (<Text style={styles.emptyText}>No requirements to apply to! Edit license to add requirements.</Text>)}

                            <TouchableHighlight
                                onPress={() => { setIsModalVisible(false) }}
                                style={styles.linkCEButton}
                            >
                                <Text style={styles.linkCEButtonText}>Cancel</Text>
                            </TouchableHighlight>
                        </ScrollView>
                    </View>) : (null)}

                {currentStep == INPUTTING_CE_HOURS ? (
                    <View style={styles.modalPopupContainer}>
                        <ScrollView keyboardShouldPersistTaps={'always'}>
                            <Text style={styles.modalTitle}>Input CE Hours</Text>
                            {Object.keys(ceDataCopy).length ? (<FlatList
                                data={Object.keys(ceDataCopy).sort((a, b) => { return new Date(ceDataCopy[b].completionDate) - new Date(ceDataCopy[a].completionDate) })}
                                keyExtractor={item => item}
                                renderItem={({ item, index }) => (
                                    <View style={styles.expandingCEContainer}>
                                        <TextInput
                                            placeholder={"Hrs"}
                                            placeholderTextColor={colors.grey400}
                                            style={styles.hoursInput}
                                            defaultValue={getDefaultCEHours(item)}
                                            value={linkedHoursInputs[index]}
                                            onChangeText={(hours) => { handleLinkedHours(hours, item, index) }}
                                            keyboardType={'numeric'}
                                            maxLength={4}
                                        />
                                        <ExpandingCE data={ceDataCopy[item]} />
                                    </View>
                                )}
                            >
                            </FlatList>) : (<Text style={styles.emptyText}>No CEs to link!</Text>)}
                        </ScrollView>
                        <View style={styles.flexRowContainer}>
                            <Text>You can review your changes on the next screen</Text>
                        </View>
                        <View style={styles.flexRowContainer}>
                            <TouchableHighlight
                                onPress={() => { handleBack() }}
                                style={styles.linkCEButton}
                            >
                                <Text style={styles.linkCEButtonText}>{('Back')}</Text>
                            </TouchableHighlight>

                            <TouchableOpacity
                                onPress={() => { handleDone() }}
                                style={styles.linkCEButton}
                            >
                                <Text style={styles.linkCEButtonText}>{('Done')}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text>{"\n"}</Text>
                    </View>) : (null)}

                {currentStep == SELECTING_CE ? (
                    // TODO: HANDLE SELECTING CE. User should be able to select a CE to link it without inputting hours it is worth.
                    null
                ) : (null)}

                {currentStep == CONFIRMATION_PAGE ? (
                    <View style={styles.modalPopupContainer}>
                        <ScrollView keyboardShouldPersistTaps={'always'}>
                            <Text style={styles.modalTitle}>Changes Summary</Text>
                            <Text style={styles.requirementName}>REQUIREMENT: {licenseCopy.requirements[selectedRequirement].name}</Text>
                            {ceChanges.length ? (<FlatList
                                data={ceChanges}
                                keyExtractor={item => item.ceID}
                                renderItem={({ item }) => {
                                    if (item.type == UNLINKED) return (
                                        <Text style={styles.unlinkedType}>{item.type}: <Text style={styles.ceName}>{item.name}</Text></Text>
                                    )
                                    else if (item.type == UPDATED) return (
                                        <Text style={styles.updatedType}>{item.type}: <Text style={styles.ceName}><Text style={styles.ceHours}>{item.hours}Hrs</Text> - {item.name}</Text></Text>
                                    )
                                    else if (item.type == NEWLY_LINKED) return (
                                        <Text style={styles.newlyLinkedType}>{item.type}: <Text style={styles.ceName}><Text style={styles.ceHours}>{item.hours}Hrs</Text> - {item.name}</Text></Text>
                                    )
                                }}
                            >
                            </FlatList>) : (<Text style={styles.emptyText}>No changes made!</Text>)}

                            <Text>{errorMsg}</Text>
                            <View style={styles.flexRowContainer}>
                                <TouchableHighlight
                                    onPress={() => { handleBack() }}
                                    style={styles.linkCEButton}
                                >
                                    <Text style={styles.linkCEButtonText}>{('Back')}</Text>
                                </TouchableHighlight>

                                <TouchableOpacity
                                    onPress={() => { handleSave() }}
                                    style={styles.linkCEButton}
                                >
                                    <Text style={styles.linkCEButtonText}>{('Save')}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text>{"\n"}</Text>
                        </ScrollView>
                    </View>
                ) : (null)}
            </View>
        </Modal>
    );
}
