import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, TouchableHighlight, ScrollView, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import ExpandingCE from "../components/expandingCE.js";


export default function linkExistingCE(props) {
    let licenseID = props.licenseID;

    const SELECTING_REQUIREMENT = 0;
    const SELECTING_CE = 1;
    const INPUTTING_CE_HOURS = 2;
    const CONFIRMATION_PAGE = 3;

    const licenses = useSelector(state => state.licenses);
    const ceData = useSelector(state => state.ces);
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState("");
    const [licenseCopy, setLicenseCopy] = useState(JSON.parse(JSON.stringify(licenses[licenseID])));
    const [requirementsCopy, setRequirementsCopy] = useState([]);
    const [ceDataCopy, setCEDataCopy] = useState(JSON.parse(JSON.stringify(ceData)));
    const [currentStep, setCurrentStep] = useState(SELECTING_REQUIREMENT);
    const [previousStep, setPreviousStep] = useState(0);
    const [ceChanges, setCEChanges] = useState([]);

    const [completedCEHours, setCompletedCEHours] = useState(0);


    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        // Setting requirements that user assigned to license.
        // Adding in license total CE hours requirement
        let licenseData = licenses[licenseID];
        if (licenseData["totalCEHours"] || licenseData["requirements"]?.length) {
            let requirementsCopy = JSON.parse(JSON.stringify(licenseData["requirements"]));
            if (licenseData["totalCEHours"]) {
                requirementsCopy.push({
                    key: "5416f212-dd53-4d40-a563-dbc4fede097c",
                    hours: licenseData["totalCEHours"],
                    name: "Total CEs Needed",
                    linkedCEs: licenseData["linkedCEs"],
                })
            }
            setRequirementsCopy(requirementsCopy);
        }
    }, [JSON.stringify(licenses)])

    React.useEffect(() => {
        if (props.open) {
            setCurrentStep(SELECTING_REQUIREMENT);
            setIsModalVisible(true);
        }
    }, [props.open]);

    let handleDone = () => {
        setPreviousStep(currentStep);
        setCurrentStep(CONFIRMATION_PAGE);
    }

    let handleBack = () => {
        if (currentStep == INPUTTING_CE_HOURS) {
            setCurrentStep(0);
        }
        else if(currentStep == CONFIRMATION_PAGE) {
            setCurrentStep(previousStep);
        }
        else {
            setCurrentStep(currentStep - 1);
        }
    }

    let handleSave = () => {
        if(ceChanges.length) {
            //TODO: Save to firebase
        }
        else {
            setIsModalVisible(false);
        }
    }

    let handleRequirementSelected = (requirement) => {
        setSelectedRequirement(requirement);
        if (requirement.hours) {
            setCurrentStep(INPUTTING_CE_HOURS);
        }
        else {
            setCurrentStep(SELECTING_CE);
        }
    }

    let handleLinkedHours = (hours, ceID) => {
        console.log(`Hours: ${hours}. Item: ${ceID}`);
        let localLicenseCopy = JSON.parse(JSON.stringify(licenseCopy));
        if (selectedRequirement.name == "Total CEs Needed") {
            if (!hours) {
                delete localLicenseCopy.linkedCEs?.[ceID];
            }
            else {
                if (localLicenseCopy.linkedCEs) {
                    localLicenseCopy.linkedCEs[ceID] = hours;
                }
                else {
                    localLicensesCopy.linkedCEs = {};
                    localLicenseCopy.linkedCEs[ceID] = hours;
                }
            }
        }
        else {
            if (!hours && localLicenseCopy.requirements[selectedRequirement].linkedCEs?.[ceID]) {
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
        }
        setLicenseCopy(localLicenseCopy);
    }

    let getDefaultCEHours = (ceID) => {
        if (Object.keys(licenses[licenseID].linkedCEs).includes(ceID)) {
            return licenses[licenseID].linkedCEs[ceID].toString();
        }
        for (requirement of requirementsCopy) {
            if (Object.keys(requirement.linkedCEs).includes(ceID)) {
                return requirement.linkedCEs[ceID].toString();
            }
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
            marginBottom: 18 * rem,
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

            {currentStep == SELECTING_REQUIREMENT ? (
                <ScrollView style={styles.modalPopupContainer}>
                    <Text style={styles.modalTitle}>Select a requirement</Text>
                    {requirementsCopy.length ? (<FlatList
                        data={requirementsCopy}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.requirementContainer}
                                onPress={() => { handleRequirementSelected(item) }}>
                                <Text style={styles.requirementText}>
                                    {item.hours ? (<Text style={styles.requirementHoursNeeded}>{item.hours}  </Text>) : (null)}{item.name}
                                </Text>
                                <AntDesign name="right" size={20 * rem} style={styles.nextArrow} />

                            </TouchableOpacity>
                        )}
                    >
                    </FlatList>) : (<Text style={styles.emptyText}>No requirements to apply to! Edit license to add requirements.</Text>)}

                </ScrollView>) : (null)}

            {currentStep == INPUTTING_CE_HOURS ? (
                <ScrollView style={styles.modalPopupContainer}>
                    <Text style={styles.modalTitle}>Input CE Hours</Text>
                    {Object.keys(ceDataCopy).length ? (<FlatList
                        data={Object.keys(ceDataCopy).sort((a, b) => { return new Date(ceDataCopy[b].completionDate) - new Date(ceDataCopy[a].completionDate) })}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <View style={styles.expandingCEContainer}>
                                <TextInput
                                    placeholder={"Hrs"}
                                    placeholderTextColor={colors.grey400}
                                    style={styles.hoursInput}
                                    defaultValue={getDefaultCEHours(item)}
                                    onChangeText={(hours) => { handleLinkedHours(hours, item) }}
                                    keyboardType={'numeric'}
                                    maxLength={4}
                                />
                                <ExpandingCE data={ceDataCopy[item]} />
                            </View>
                        )}
                    >
                    </FlatList>) : (<Text style={styles.emptyText}>No CEs to link!</Text>)}

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
                </ScrollView>) : (null)}

            {currentStep == SELECTING_CE ? (
                // TODO: HANDLE SELECTING CE. User should be able to select a CE to link it without inputting hours it is worth.
                null
            ) : (null)}

            {currentStep == CONFIRMATION_PAGE ? (
                <ScrollView style={styles.modalPopupContainer}>
                <Text style={styles.modalTitle}>Changes Summary</Text>
                {Object.keys(ceChanges).length ? (<FlatList
                    data={Object.keys(ceChanges).sort((a, b) => { return new Date(ceChanges[b].completionDate) - new Date(ceChanges[a].completionDate) })}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <View style={styles.expandingCEContainer}>
                            {{item}}
                        </View>
                    )}
                >
                </FlatList>) : (<Text style={styles.emptyText}>No changes made!</Text>)}

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
            ) : (null)}
        </Modal>
    );
}
