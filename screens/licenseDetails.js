import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses } from '../actions';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image'
import CEcard from '../components/ceCard.js';
import LinkExistingCE from "../components/linkExistingCE.js";
import { v4 as uuidv4 } from 'uuid';

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback, Alert, Image } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import Header from '../components/header.js';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import Toast from 'react-native-simple-toast';

export default function licenseDetails(props) {
    // NOTE: licenseData is always followed by ? to not crash when deleting a license from this screen.
    const licenseID = props.route.params.id;
    const navigation = useNavigation();
    const route = useRoute();

    const licenses = useSelector(state => state.licenses);
    const ceData = useSelector(state => state.ces);
    const accountData = useSelector(state => state.accountData);
    const dispatch = useDispatch();

    const [renewalReady, setRenewalReady] = useState(false);

    const [showProgressBar, setShowProgressBar] = useState(false);
    const [progressFill, setProgressFill] = useState(0);
    const [totalCEHours, setTotalCEHours] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
    const [overflowOptions, setOverflowOptions] = useState(["Edit License Details", "Export Documents", "Mark License as Complete", "Delete License"])

    const [isLoading, setIsLoading] = useState(true);
    const [licenseData, setLicenseData] = useState(licenses[licenseID]);
    const [renewedLicenseCopy, setRenewedLicenseCopy] = useState({});
    const [requirements, setRequirements] = useState([]);
    const [requirementsNotMet, setRequirementsNotMet] = useState([]);
    const [selectedImage, setSelectedImage] = useState("");

    const [linkingExistingCEs, setLinkingExistingCEs] = useState(false);

    const [completedCEHours, setCompletedCEHours] = useState(0);

    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);

    // Initializing stuff
    React.useEffect(() => {
        // Setting requirements that user assigned to license.
        setLicenseData(licenses[licenseID]);

        if (licenses[licenseID]?.complete) {
            let renewOptionIndex = overflowOptions.indexOf("Mark License as Complete");
            let optionsCopy = JSON.parse(JSON.stringify(overflowOptions));
            optionsCopy[renewOptionIndex] = "Revert License to Incomplete";
            setOverflowOptions(optionsCopy);
        }

        if (licenses[licenseID]?.["requirements"]?.length) {
            let requirementsCopy = JSON.parse(JSON.stringify(licenses[licenseID]["requirements"]));
            if (typeof licenses[licenseID]["requirements"] !== "undefined" && licenses[licenseID]["requirements"].length) {
                // Adding in custom requirements
                for (const requirementIndex in requirementsCopy) {
                    let completedHours = 0;
                    for (linkedCE in requirementsCopy[requirementIndex]["linkedCEs"]) {
                        completedHours += requirementsCopy[requirementIndex]["linkedCEs"][linkedCE];
                    }
                    if (requirementsCopy[requirementIndex].name == "Total CEs Needed") {
                        setCompletedCEHours(completedHours);
                    }
                    requirementsCopy[requirementIndex].completedHours = completedHours;
                }
            }
            setRequirements(requirementsCopy);
        }


        // Some logic to determine how to fill up progress bar.
        let progressFillTemp = 0;
        if (licenses[licenseID]?.totalCEHours) {
            setShowProgressBar(true);
            setTotalCEHours(licenses[licenseID]?.totalCEHours);
        }
        if (!showProgressBar) {
            for (const requirement of licenses[licenseID]?.requirements) {
                if (requirement.name == "Total CEs Needed") {
                    setShowProgressBar(true);
                    setTotalCEHours(requirement.hours);
                }
            }
        }

        if (showProgressBar) {
            if (completedCEHours) {
                progressFillTemp = parseInt(completedCEHours) / parseInt(totalCEHours);
                if (progressFillTemp > 0.88) { setProgressFill(0.88) }
                else if (progressFillTemp < 0.1) { setProgressFill(0.1) }
                else {
                    setProgressFill(progressFillTemp);
                }
            }
        }

    }, [JSON.stringify(licenses[licenseID]), showProgressBar, totalCEHours, completedCEHours, JSON.stringify(ceData)])

    React.useEffect(() => {
        checkLicenseRequirementsComplete(licenseData);
    }, [JSON.stringify(licenses)]);

    let checkLicenseRequirementsComplete = async (licenseData) => {
        try {
            console.log("checkLicenseRequirementsComplete()");
            let db = firestore();
            const licenseType = licenseData.licenseType;
            const licenseState = licenseData.licenseState;
            let officialRequirementUpdateDate = licenseData.officialRequirementUpdateDate;
            if (officialRequirementUpdateDate?.["_seconds"]) {
                // Last updated turned into obj instead of Firestore Timestamp.
                officialRequirementUpdateDate = new firestore.Timestamp(officialRequirementUpdateDate["_seconds"], 0)
            }

            const requirements = licenseData.requirements;
            let tempRequirementsNotMet = [];

            // Checking current date against license expiration
            if (licenseData.licenseExpiration) {
                // Copy date so don't affect original
                var threeMonthsPrior = new Date(licenseData.licenseExpiration);
                // Get the current month number
                var m = threeMonthsPrior.getMonth();
                // Subtract 6 months
                threeMonthsPrior.setMonth(threeMonthsPrior.getMonth() - 3);
                // If the new month number isn't m - 6, set to last day of previous month
                // Allow for cases where m < 6
                var diff = (m + 12 - threeMonthsPrior.getMonth()) % 12;
                if (diff < 6) threeMonthsPrior.setDate(0)

                let now = new Date();
                let expirationDate = new Date(licenseData.licenseExpiration);
                if (now < threeMonthsPrior) {
                    tempRequirementsNotMet.push("License expiration date is too far away");
                }
                if (now > expirationDate) {
                    tempRequirementsNotMet.push("License already expired")
                }
            }

            let response = await db.collection("requirements").doc(licenseType).get();
            let allOfficialRequirements = response.data();
            if (!allOfficialRequirements) {
                tempRequirementsNotMet.push("License is not supported for renewals");
            }

            let officialRequirements = allOfficialRequirements[licenseState];
            if (!officialRequirements) {
                tempRequirementsNotMet.push("State is not supported for renewals");
            }

            if (officialRequirements.lastUpdated.toMillis() !== officialRequirementUpdateDate.toMillis()) {
                console.log(`Official requirements last updated: ${officialRequirements.lastUpdated.toMillis()}`);
                console.log(`User requirements last updated: ${officialRequirementUpdateDate.toMillis()}`);
                tempRequirementsNotMet.push("License requirements not up to date.");
            }
            // License requirements up to date.

            for (const requirement of requirements) {
                if (requirement.complete) continue;
                if (requirement.hours) {
                    let hoursNeeded = Number(requirement.hours);
                    let hoursDone = 0;
                    for (const id in requirement.linkedCEs) {
                        hoursDone += requirement.linkedCEs[id];
                    }
                    if (hoursDone < hoursNeeded) {
                        tempRequirementsNotMet.push("License requirements incomplete");
                    }
                }
            }
            if (!tempRequirementsNotMet.length) {
                console.log("License up to date and meets all necessary requirements");
                setRenewalReady(true);
            }
            else {
                setRequirementsNotMet(tempRequirementsNotMet);
            }
        }
        catch (e) {
            console.log(e);
            setRenewalReady(false);
        }
    }


    // Accounting for if the license type is "Other"
    let licenseTitle = '';
    if (licenseData) {
        if (licenseData['licenseType'] === 'Other') {
            const stateAcronym = getStateAcronym(licenseData['licenseState'])
            licenseTitle = `${licenseData['otherLicenseType']} License (${stateAcronym})`;
        }
        else {
            const licenseType = getShortenedTitle(licenseData['licenseType']);
            const stateAcronym = getStateAcronym(licenseData['licenseState'])
            licenseTitle = licenseType + ` License (${stateAcronym})`;
        }
    }

    // Function for calculating the status and what to display.
    let getStatus = () => {
        const now = new Date().getTime();
        const expiration = new Date(licenseData?.licenseExpiration).getTime();
        const diffInDays = (expiration - now) / (1000 * 3600 * 24);
        if (licenseData?.complete) {
            return (
                <View style={styles.statusBlue}>
                    <Text style={styles.statusTextBlue}>Complete</Text>
                </View>
            )
        }
        else if (diffInDays > 90) {
            return (
                <View style={styles.statusGreen}>
                    <Text style={styles.statusTextGreen}>Up to date</Text>
                </View>
            );
        }
        else if (diffInDays <= 90 && diffInDays > 0) {
            return (
                <View style={styles.statusYellow}>
                    <Text style={styles.statusTextYellow}>Expiring soon</Text>
                </View>
            );
        }
        else {
            return (
                <View style={styles.statusRed}>
                    <Text style={styles.statusTextRed}>Overdue</Text>
                </View>
            );
        }
    }



    let addCE = () => {
        navigation.navigate("AddCE", { licenseID: props.route.params.id });
    }

    let linkExistingCE = () => {
        setLinkingExistingCEs(!linkingExistingCEs);
    }
    useEffect(() => {
        if (linkingExistingCEs) {
            setLinkingExistingCEs(false);
        }
    }, [linkingExistingCEs])

    let openScanner = () => {
        props.navigation.navigate('Scanner', {
            fromThisScreen: route.name,
            initialFilterId: 1, // Color photo
            licenseId: licenseData?.id,
        });
    }

    let openImage = (photoUri) => {
        setSelectedImage(photoUri);
        setIsLoading(true);
        setIsModalVisible(true);
    }

    let toggleShowRequirements = (requirementID) => {
        let requirementsCopy = JSON.parse(JSON.stringify(requirements));
        for (requirement of requirementsCopy) {
            if (requirement.key == requirementID) {
                if (requirement.expanded) {
                    requirement.expanded = !requirement.expanded;
                }
                else {
                    requirement.expanded = true;
                }
                break;
            }
        }
        setRequirements(requirementsCopy)
    }

    let checkmarkClicked = (requirement) => {
        if (requirement.hours) {
            // Requirement has an hours needed component.
            let hoursNeeded = requirement.hours;
            for (const linkedCE in requirement.linkedCEs) {
                hoursNeeded -= requirement.linkedCEs[linkedCE];
            }
            if (hoursNeeded > 0) {
                Toast.showWithGravity(`Need to apply ${hoursNeeded} more hour(s) of CEs to complete requirement.`, Toast.SHORT, Toast.TOP);
            }
            else {
                Toast.showWithGravity(`Requirement already complete.`, Toast.SHORT, Toast.TOP);
            }
        }
        else {
            // Requirement does not need any CE hours.
            let licenseCopy = JSON.parse(JSON.stringify(licenseData));

            for (const index in licenseCopy.requirements) {
                if (licenseCopy.requirements[index].key == requirement.key) {
                    if (requirement.complete) {
                        delete licenseCopy.requirements[index].complete;
                    }
                    else {
                        licenseCopy.requirements[index].complete = true;
                    }

                    let uid = auth().currentUser.uid;
                    let db = firestore();

                    let licenseObj = { [licenseData?.id]: JSON.parse(JSON.stringify(licenseCopy)) }
                    db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
                        .then(() => {
                            Toast.showWithGravity(`Saved!`, Toast.SHORT, Toast.TOP);
                            let licensesCopy = JSON.parse(JSON.stringify(licenses));
                            licensesCopy[licenseData?.id] = licenseCopy;
                            dispatch(updateLicenses(licensesCopy));
                        })
                }
            }
        }
    }

    let handleOverflowOptionPressed = (option) => {
        switch (option) {
            case "Edit License Details":
                navigation.navigate("EditLicense", { licenseID: licenseID });
                setIsOverflowOpen(false);
                break;
            case "Export Documents":
                break;
            case "Mark License as Complete":
                handleMarkLicenseRenewed();
                break;
            case "Revert License to Incomplete":
                handleMarkLicenseCurrent();
                break;
            case "Delete License":
                confirmDeletion();
                break;
            default:
                console.log("option unknown");
        }
    }

    let handleMarkLicenseRenewed = () => {
        let licenseCopy = JSON.parse(JSON.stringify(licenses[licenseID]));
        licenseCopy.complete = true;

        let renewedLicense = JSON.parse(JSON.stringify(licenses[licenseID]));
        const newID = uuidv4();
        renewedLicense.complete = false;
        renewedLicense.id = newID;
        renewedLicense.completedCEHours = 0;
        let twoYearsLater = new Date(renewedLicense.licenseExpiration);
        twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
        renewedLicense.licenseExpiration = `${("0" + (twoYearsLater.getMonth() + 1)).slice(-2)}/${("0" + twoYearsLater.getDate()).slice(-2)}/${twoYearsLater.getFullYear()}`
        delete renewedLicense.linkedCEs;
        delete renewedLicense.officialRequirementUpdateDate;
        for (const index in renewedLicense.requirements) {
            renewedLicense.requirements[index].linkedCEs = {};
            renewedLicense.requirements[index].key = uuidv4();
        }
        setRenewedLicenseCopy(renewedLicense);

        let uid = auth().currentUser.uid;
        let db = firestore();

        let licenseObj = {
            [licenseData?.id]: JSON.parse(JSON.stringify(licenseCopy))
        }

        db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
            .then(() => {
                Toast.showWithGravity(`License marked complete!`, Toast.SHORT, Toast.TOP);
                let licensesCopy = JSON.parse(JSON.stringify(licenses));
                licensesCopy[licenseData?.id] = licenseCopy;
                dispatch(updateLicenses(licensesCopy));
                setIsOverflowOpen(false);
                setIsRenewModalOpen(true);
            })
    }

    let handleMarkLicenseCurrent = () => {
        let licenseCopy = JSON.parse(JSON.stringify(licenses[licenseID]));
        licenseCopy.complete = false;

        let uid = auth().currentUser.uid;
        let db = firestore();

        let licenseObj = {
            [licenseData?.id]: JSON.parse(JSON.stringify(licenseCopy))
        }
        db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
            .then(() => {
                Toast.showWithGravity(`License reverted to incomplete!`, Toast.SHORT, Toast.TOP);
                let licensesCopy = JSON.parse(JSON.stringify(licenses));
                licensesCopy[licenseData?.id] = licenseCopy;
                dispatch(updateLicenses(licensesCopy));
                setIsOverflowOpen(false);
                navigation.navigate("Homepage");
            })
    }

    let confirmDeletion = () => {
        Alert.alert(
            "Delete License",
            "Are you sure? This will delete the license and your progress PERMANENTLY.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { text: "DELETE", onPress: () => handleDeleteLicense(), style: "destructive" }
            ],
            { cancelable: true })
    }

    let handleDeleteLicense = () => {
        let uid = auth().currentUser.uid;
        let db = firestore();
        const FieldValue = firestore.FieldValue;
        let dataToBeDeleted = { [licenseID]: FieldValue.delete() }
        db.collection('users').doc(uid).collection('licenses').doc('licenseData').update(dataToBeDeleted)
            .then(() => {
                setIsOverflowOpen(false);
                let licensesCopy = JSON.parse(JSON.stringify(licenses));
                delete licensesCopy[licenseID];
                dispatch(updateLicenses(licensesCopy));
                navigation.navigate("Homepage");
            })
            .catch((error) => {
                console.error("Error deleting license: ", error);
            });
    }

    let startRenewalProcess = () => {
        if (accountData.plan !== "Concierge") {
            Alert.alert(
                "Unavailable",
                "Renewing through the app is only available on our Conceriege Plan",
                [
                    {
                        text: "Cancel",
                    },
                    { text: "Change Plan", onPress: () => { navigation.navigate("ChangePlan") }, }
                ],
                { cancelable: true })
        }
        else {
            navigation.navigate('Renewal', {
                licenseID: licenseID
            })
        }
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const progressBarWidth = (screenWidth - (160 * rem)) / 12;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'white',
        },
        licenseContainer: {
            backgroundColor: colors.grey200,
            width: screenWidth,
            padding: 18 * rem,
            paddingBottom: 36 * rem,
        },
        topContainer: {
            flexShrink: 1,
            flexDirection: 'row',
            borderRadius: 10 * rem,
        },
        thumbnailContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            width: 75 * rem,
            aspectRatio: 1,
            borderRadius: 10 * rem,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.00,

            elevation: 1,
        },
        thumbnailImgContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            width: 75 * rem,
            aspectRatio: 1,
            borderRadius: 10 * rem,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.00,

            elevation: 1,
        },
        thumbnailIcon: {
            height: 32 * rem,
            width: 32 * rem,
            position: 'absolute',
            color: colors.blue300,
        },
        infoContainer: {
            flexShrink: 1,
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        icon: {
            marginRight: 18 * rem,
            height: 20 * rem,
            width: 20 * rem,
            color: colors.blue800,
        },
        titleText: {
            position: 'relative',
            fontSize: 22 * rem,
            color: colors.grey900,
            fontWeight: '500',
            height: '100%',
            maxWidth: screenWidth - (168 * rem),
        },
        idNumContainer: {
            left: 38 * rem,
        },
        idNum: {
            fontSize: 14 * rem,
            fontWeight: '200',
            letterSpacing: 0.6 * rem,
            color: colors.grey500,
        },
        expirationContainer: {
            paddingTop: 8 * rem,
            flexDirection: 'row',
            alignItems: 'center',
        },
        expirationText: {
            position: 'relative',
            fontSize: 16 * rem,
            color: colors.grey900,
            fontWeight: '300',
        },
        statusBlue: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.blue800,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextBlue: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: 'white',
            fontWeight: '500',
        },
        statusGreen: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.green200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextGreen: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.green900,
            fontWeight: '500',
        },
        statusYellow: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.yellow200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextYellow: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.yellow800,
            fontWeight: '500',
        },
        statusRed: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.red200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextRed: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.red800,
            fontWeight: '500',
        },
        ceContainer: {
            paddingBottom: 12 * rem,
            flexShrink: 1,
            flexDirection: 'row',
        },
        ceIcon: {
            height: 20 * rem,
            width: 20 * rem,
            color: colors.blue800,
        },
        ceText: {
            fontSize: 16 * rem,
            color: colors.blue800,
            fontWeight: '500',
            textAlign: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        progressBar: {
            marginLeft: 18 * rem,
            width: screenWidth - (74 * rem),
            borderColor: colors.blue800,
            borderRadius: progressBarWidth,
            borderWidth: 2 * rem,
            height: 22 * rem,
            justifyContent: 'center',
        },
        progressBarFill: {
            position: 'absolute',
            width: (screenWidth - (96 * rem)) * (progressFill),
            borderTopLeftRadius: progressBarWidth,
            borderBottomLeftRadius: progressBarWidth,
            height: 18 * rem,
            backgroundColor: 'rgba(208,233,251,1)',
        },
        progressBarFillComplete: {
            position: 'absolute',
            width: (screenWidth - ((74 + 4) * rem)), // from progressBar
            borderRadius: progressBarWidth,
            height: 18 * rem,
            backgroundColor: colors.green200,
        },
        cardButtonsContainer: {
            flexDirection: 'row',
            width: '100%',
            borderRadius: 10 * rem,
            justifyContent: 'space-evenly',
            top: -(25 * rem),
        },
        whiteButton: {
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            flexDirection: 'row',
            borderRadius: 10 * rem,
            borderWidth: 2 * rem,
            borderColor: colors.blue800,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            minWidth: 60 * rem,
        },
        whiteButtonText: {
            color: colors.blue800,
            fontSize: 16 * rem,
            fontWeight: '500',
        },

        // Overflow menu and option styling
        overflowContainer: {
            backgroundColor: "white",
            position: "absolute",
            display: "flex",
            width: "100%",
            maxHeight: 0.4 * screenHeight,
            bottom: 0,
            borderRadius: 20 * rem,
        },
        optionContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            borderWidth: 2 * rem,
            borderColor: "transparent",
            borderBottomColor: colors.grey300,
        },
        optionText: {
            fontSize: 16 * rem,
        },
        deleteOptionText: {
            color: "red",
            fontSize: 16 * rem,
        },

        blueButton: {
            flexDirection: 'row',
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            height: 50 * rem,
            backgroundColor: colors.blue800,
            borderRadius: 10 * rem,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 80 * rem,
        },
        blueButtonText: {
            color: 'white',
            fontSize: 16 * rem,
            fontWeight: '500',
        },
        modalTransparency: {
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0, 0.50)',
            height: '100%',
            width: '100%',
        },
        imgContainer: {
            position: 'absolute',
            marginTop: (Dimensions.get('window').height / 2) - (screenWidth / 2),
            width: screenWidth,
            aspectRatio: 1,
            backgroundColor: 'black',
        },
        loadingText: {
            marginTop: Dimensions.get('window').height / 2,
            color: 'white',
            fontSize: 20 * rem,
            alignSelf: 'center',
        },
        headerContainer: {
            width: '100%',
            height: 40 * rem,
            marginBottom: 18 * rem,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        },
        requirementsContainer: {
            marginLeft: 24 * rem,
            marginBottom: 24 * rem,
            marginRight: 24 * rem,
        },
        noRequirementsText: {
            fontSize: 16 * rem,
            color: colors.grey500,
        },
        requirementContainer: {
            flexDirection: 'row',
            width: screenWidth - (36 * rem),
            lineHeight: 18 * rem,
            // marginBottom: 6 * rem,
        },
        requirementClickableArea: {
            flexDirection: 'row',
            width: screenWidth - (62 * rem),
            lineHeight: 18 * rem,
            marginBottom: 18 * rem,
        },
        requirementName: {
            fontSize: 18 * rem,
            color: colors.grey800,
            marginLeft: 18 * rem,
            flex: 1,
        },
        chevron: {
            width: 20 * rem,
            marginRight: 20 * rem,
            marginLeft: 4 * rem,
            color: colors.grey800,
        },
        requirementHoursDone: {
            fontSize: 18 * rem,
            color: colors.blue800,
            marginLeft: 18 * rem,
        },
        requirementHoursTotal: {
            fontSize: 18 * rem,
            fontWeight: '200',
            color: colors.grey400,
        },
        incompleteIcon: {
            color: colors.grey400,
            opacity: 0.6,
        },
        completeIcon: {
            color: colors.green600,
        },

        renewalButton: {
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            flexDirection: 'row',
            borderRadius: 36 * rem,
            borderWidth: 2 * rem,
            borderColor: colors.green500,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.green500,
            marginTop: 6 * rem,
            marginBottom: 6 * rem,

            shadowColor: "green",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,

            elevation: 8,
        },
        renewalButtonText: {
            color: "white",
            fontSize: 20 * rem,
            fontWeight: '500',
        },
        renewalButtonDisabled: {
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            flexDirection: 'row',
            borderRadius: 36 * rem,
            borderWidth: 2 * rem,
            borderColor: colors.grey400,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.grey400,
            marginTop: 6 * rem,
            marginBottom: 6 * rem,

            shadowColor: "green",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,

            elevation: 8,
        },
        renewalButtonTextDisabled: {
            color: "white",
            fontSize: 20 * rem,
            fontWeight: '500',
        },

        modalPopupContainer: {
            flexShrink: 1,
            alignSelf: 'center',
            marginTop: (Dimensions.get('window').height / 2) - (screenWidth / 2),
            backgroundColor: 'white',
            padding: 18 * rem,
            borderRadius: 10 * rem,
            maxHeight: screenHeight * (6 / 8),
            width: '98%',
            minHeight: screenHeight * (1.8 / 8),
        },
        flexRowContainer: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            height: 50 * rem,
            marginBottom: 18 * rem,
            marginTop: 24 * rem,
        },
        questionText: {
            textAlign: 'center',
            fontSize: 18 * rem,
            color: colors.grey800,
        },
    });

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}>
            <Modal
                visible={isModalVisible}
                animationType='fade'
                transparent={true}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalTransparency} >
                        <TouchableWithoutFeedback
                            onPress={() => setIsModalVisible(false)}
                        >
                            {isLoading ? (
                                <>
                                    <FastImage
                                        style={styles.imgContainer}
                                        source={{
                                            uri: selectedImage,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                        onLoadEnd={() => {
                                            setIsLoading(false);
                                        }}
                                    />
                                    <Text style={styles.loadingText}>Loading. . .</Text>
                                </>
                            ) : (
                                <FastImage
                                    style={styles.imgContainer}
                                    source={{
                                        uri: selectedImage,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                    onLoadEnd={() => {
                                        setIsLoading(false);
                                    }}
                                />
                            )}
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <View style={styles.licenseContainer}>
                <>
                    <View style={styles.topContainer}>
                        <View style={styles.infoContainer}>
                            <View style={styles.titleContainer}>
                                <AntDesign name="idcard" size={20 * rem} style={styles.icon} />
                                <Text style={styles.titleText}>{licenseTitle}</Text>
                            </View>
                            {licenseData?.licenseNum ? (
                                <View style={styles.idNumContainer}>
                                    <Text style={styles.idNum}>{`#${licenseData?.licenseNum}`}</Text>
                                </View>
                            ) : (null)}
                            <View style={styles.expirationContainer}>
                                <AntDesign name="calendar" size={20 * rem} style={styles.icon} />
                                <Text style={styles.expirationText}>{`Exp: ${licenseData?.licenseExpiration}`}</Text>
                            </View>
                            {getStatus()}
                        </View>
                        {licenseData?.licenseThumbnail ? (
                            <TouchableOpacity
                                style={styles.thumbnailContainer}
                                onPress={() => {
                                    openImage(licenseData?.licensePhoto);
                                }}
                            >
                                <FastImage
                                    style={styles.thumbnailImgContainer}
                                    source={{
                                        uri: licenseData?.licenseThumbnail,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.thumbnailContainer}
                                onPress={openScanner}
                            >
                                <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {showProgressBar ? (
                        <View style={styles.ceContainer}>
                            <AntDesign name="copy1" size={20 * rem} style={styles.ceIcon} />
                            <View style={styles.progressBar}>

                                {completedCEHours >= totalCEHours ? (
                                    <View style={styles.progressBarFillComplete}></View>
                                ) : (<View style={styles.progressBarFill}></View>
                                )}

                                {completedCEHours ? (
                                    <Text style={styles.ceText}>{`${completedCEHours}/${totalCEHours} CE`}</Text>
                                ) : (
                                    <Text style={styles.ceText}>{`0/${totalCEHours} CE`}</Text>
                                )}
                            </View>
                        </View>
                    ) : (null)}

                    {renewalReady ? (
                        <View>
                            <TouchableOpacity style={styles.renewalButton}
                                onPress={startRenewalProcess}>
                                <Text style={styles.renewalButtonText}>Start Renewal!</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity style={styles.renewalButtonDisabled}
                                disabled={true}>
                                <Text style={styles.renewalButtonText}>Start Renewal!</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            </View>
            <View style={styles.cardButtonsContainer}>
                <TouchableOpacity style={styles.blueButton}
                    onPress={linkExistingCE}>
                    <Text style={styles.blueButtonText}>Apply Existing CE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whiteButton}
                    onPress={addCE}>
                    <AntDesign
                        name='addfile'
                        size={20 * rem}
                        color={colors.blue800}
                    />
                    <Text style={styles.whiteButtonText}> Add CE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whiteButton}
                    onPress={() => { setIsOverflowOpen(true) }}>
                    <AntDesign
                        name='ellipsis1'
                        size={20 * rem}
                        color={colors.blue800}
                    />
                </TouchableOpacity>
                <Modal visible={isOverflowOpen}
                    animationType='slide'
                    transparent={true}
                >
                    <TouchableWithoutFeedback onPress={() => setIsOverflowOpen(false)}>
                        <View style={styles.modalTransparency} />
                    </TouchableWithoutFeedback>
                    <View style={styles.overflowContainer}>
                        <FlatList
                            style={{ marginTop: 0, marginBottom: 32 * rem, }}
                            data={overflowOptions}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { handleOverflowOptionPressed(item) }}
                                    style={styles.optionContainer}>
                                    {item == "Delete License" ? (
                                        <Text style={styles.deleteOptionText}>{item}</Text>
                                    ) : (
                                        <Text style={styles.optionText}>{item}</Text>
                                    )}
                                </TouchableOpacity>
                            )}>
                        </FlatList>
                    </View>
                </Modal>
            </View>

            {requirementsNotMet.length > 0 &&
                (<>
                    <View style={styles.headerContainer}>
                        <Header text="Needed for Renewal" />
                    </View>
                    <View style={styles.requirementsContainer}>
                        <FlatList
                            scrollEnabled={false}
                            data={requirementsNotMet}
                            keyExtractor={item => item.key}
                            renderItem={({ item, index }) => (
                                <Text>{item}</Text>
                            )}
                        />
                    </View>
                </>)}

            <View style={styles.headerContainer}>
                <Header text="Requirements" />
            </View>
            <View style={styles.requirementsContainer}>
                {requirements.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={requirements}
                        keyExtractor={item => item.key}
                        renderItem={({ item, index }) => (
                            <>
                                <TouchableOpacity
                                    onPress={() => { toggleShowRequirements(item.key) }}
                                    style={styles.requirementClickableArea}>
                                    <View style={styles.requirementContainer}>
                                        {((item.hours && item.hours <= item.completedHours) || item.complete) ? (
                                            <TouchableOpacity onPress={() => { checkmarkClicked(item) }}>
                                                <AntDesign name="checkcircleo" size={24 * rem} style={styles.completeIcon} />
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={() => { checkmarkClicked(item) }}>
                                                <AntDesign name="checkcircleo" size={24 * rem} style={styles.incompleteIcon} />
                                            </TouchableOpacity>
                                        )}

                                        {item.hours ? (
                                            <>
                                                <Text style={styles.requirementHoursDone}>{item.completedHours}</Text>
                                                <Text style={styles.requirementHoursTotal}>/{item.hours}hrs</Text>
                                            </>
                                        ) : (null)}
                                        <Text style={styles.requirementName}>{item.name}</Text>
                                        {item.expanded ? (<AntDesign name="up" size={20 * rem} style={styles.chevron} />
                                        ) : (<AntDesign name="down" size={20 * rem} style={styles.chevron} />)}
                                    </View>
                                </TouchableOpacity>
                                {item.expanded ? (
                                    // Requirement is expanded: show linked CE cards
                                    <>
                                        <FlatList
                                            scrollEnabled={false}
                                            style={{ marginTop: 0, marginBottom: 32 * rem, }}
                                            data={Object.keys(item["linkedCEs"]).sort((a, b) => {
                                                if (ceData)
                                                    return new Date(ceData[b]?.completionDate) - new Date(ceData[a]?.completionDate)
                                            })}
                                            keyExtractor={ce => ce}
                                            renderItem={(ce) => (
                                                <>
                                                    {(typeof item["linkedCEs"] !== "undefined" && ce["item"] in item?.["linkedCEs"])
                                                        ? (
                                                            <CEcard data={ceData?.[ce["item"]]} licenseHours={item["linkedCEs"][ce["item"]]} />
                                                        ) : (null)}
                                                </>
                                            )
                                            }>
                                        </FlatList>
                                    </>
                                ) : (null)}
                            </>
                        )}>
                    </FlatList>
                ) : (
                    <Text style={styles.noRequirementsText}>Edit license details to add requirements.</Text>
                )
                }
            </View >

            {licenses[licenseID] && <LinkExistingCE open={linkingExistingCEs} licenseID={licenseID} />}
            <Modal visible={isRenewModalOpen}
                animationType='fade'
                transparent={true}
            >
                <TouchableWithoutFeedback onPress={() => { setIsRenewModalOpen(false); }}>
                    <View style={styles.modalTransparency} />
                </TouchableWithoutFeedback>
                <View style={styles.modalPopupContainer}>
                    <Text style={styles.questionText}>Would you like to add this license again with a new expiration date?</Text>
                    <View style={styles.flexRowContainer}>
                        <TouchableOpacity style={styles.whiteButton}
                            onPress={() => { setIsRenewModalOpen(false); navigation.navigate("Homepage") }}>
                            <Text style={styles.whiteButtonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.blueButton}
                            onPress={() => { setIsRenewModalOpen(false); navigation.navigate("AddNew", { licenseData: JSON.parse(JSON.stringify(renewedLicenseCopy)) }) }}>
                            <Text style={styles.blueButtonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView >
    );
}

let getShortenedTitle = (longTitle) => {
    switch (longTitle) {
        case "Licensed Vocational Nurse (LVN)":
            return "LVN";
        case "Registered Nurse (RN)":
            return "RN";
        default:
            return "";
    }
}

let getStateAcronym = (stateFullName) => {
    return this.stateList[stateFullName];
}

stateList = {
    'Arizona': 'AZ',
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}