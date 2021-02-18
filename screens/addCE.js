import React, { useState } from 'react';
import { useSelector, useDispatch, useEffect } from 'react-redux';
import { updateLicenses, updateCEs } from '../actions';
import { Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity, Text, TextInput, View, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Header from '../components/header.js';
import { TextInputMask } from 'react-native-masked-text';
import { useHeaderHeight } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { useRoute } from '@react-navigation/native';
import ApplyTowardLicense from '../components/applyTowardLicense';
let ceID = uuidv4();


export default function addCE(props) {
    // TODO: Create local state of licenses and update that instead of central state.
    const licenses = useSelector(state => state.licenses);
    const dispatch = useDispatch();
    const headerHeight = useHeaderHeight();

    const [name, setName] = useState("");
    const [nameErrorMsg, setNameErrorMsg] = useState("");
    const [providerName, setProviderName] = useState("");
    const [providerNameErrorMsg, setProviderNameErrorMsg] = useState("");
    const [hours, setHours] = useState("");
    const [hoursErrorMsg, setHoursErrorMsg] = useState("");
    const [completionDate, setCompletionDate] = useState("");
    const [completionErrorMsg, setCompletionErrorMsg] = useState("");
    const [providerNum, setProviderNum] = useState("");
    const [providerErrorMsg, setProviderErrorMsg] = useState("");

    const [applyingTowardsLicense, setApplyingTowardsLicense] = useState(false);

    const [generalErrorMsg, setGeneralErrorMsg] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [cePhoto, setCEPhoto] = useState("");
    const [ceThumbnail, setCEThumbnail] = useState("");

    const [linkedLicenses, setLinkedLicenses] = useState([]);
    const [localLicensesCopy, setLocalLicensesCopy] = useState(JSON.parse(JSON.stringify(licenses)));

    const route = useRoute();

    React.useEffect(() => {
        ceID = uuidv4();
    }, [])

    React.useEffect(() => {
        if (typeof props.route?.params?.thumbnailURL !== 'undefined') {
            if (ceThumbnail) {
                // User is replacing old thumbnail. Delete old one.
                // Firebase couldn't parse the URL for some reason.
                // const oldThumbnailRef = storage().refFromURL(licenseThumbnail);
                const oldThumbnailPath = ceThumbnail.replace('https://storage.googleapis.com/cetracker-2de23.appspot.com/', '');
                const oldThumbnailRef = storage().ref().child(`${oldThumbnailPath}`);

                oldThumbnailRef.delete()
                    .then(() => {
                        console.log("Deleted thumbnail successfully.");
                        setCEThumbnail(props.route?.params?.thumbnailURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old thumbnail. Error: " + error.toString());
                    })
            }
            else {
                setCEThumbnail(props.route?.params?.thumbnailURL);
            }
        }
        if (typeof props.route.params?.photoURL !== 'undefined') {
            if (cePhoto) {
                // User is replacing old photo. Delete old one.
                const firstPhotoRef = storage().refFromURL(cePhoto).toString();
                const oldPhotoPath = firstPhotoRef.replace('gs://cetracker-2de23', '');
                const oldPhotoRef = storage().ref().child(`${oldPhotoPath}`);
                oldPhotoRef.delete()
                    .then(() => {
                        console.log("Deleted photo successfully.");
                        setCEPhoto(props.route?.params?.photoURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old photo. Error: " + error.toString());
                    })
            }
            else {
                setCEPhoto(props.route?.params?.photoURL);
            }
        }
        // For tracking license ID user came from
        if (props?.route?.params?.id) {
            let temp = linkedLicenses.concat(props.route.params.id);
            setLinkedLicenses(temp);
        }
    }, [props.route.params?.thumbnailURL]);
    // Checks for license type, other license type (if Other is selected), state, and expiration of license.
    let isFormComplete = () => {
        let isComplete = true;

        if (!name) {
            isComplete = false;
            setNameErrorMsg("Enter CE Name");
        }
        else {
            setNameErrorMsg("");
        }

        if (completionDate.length !== 10) {
            isComplete = false;
            setCompletionErrorMsg("Format: (MM/DD/YYYY)");
        }
        else if (parseInt(completionDate.substring(0, 2)) === 0 || parseInt(completionDate.substring(0, 2)) > 12) {
            isComplete = false;
            setCompletionErrorMsg("Month: 1-12");
        }
        else if (parseInt(completionDate.substring(3, 5)) === 0 || parseInt(completionDate.substring(3, 5)) > 31) {
            isComplete = false;
            setCompletionErrorMsg("Days: 1-31");
        }
        else {
            setCompletionErrorMsg("");
        }

        if (!hours) {
            isComplete = false;
            setHoursErrorMsg("Enter Hrs");
        }
        else {
            setHoursErrorMsg("");
        }

        // if (!providerNum) {
        //     isComplete = false;
        //     setProviderErrorMsg("Enter Provider #");
        // }
        // else {
        //     setProviderErrorMsg("");
        // }

        if (!isComplete) {
            setIsLoading(false);
        }
        return isComplete;
    }

    let setRequirementHours = (hours, licenseID, index) => {
        // Links CE to a special requirement.
        // Set license state.
        let licensesCopy = JSON.parse(JSON.stringify(licenses));

        if (hours) {
            let temp = linkedLicenses.concat(licenseID);
            setLinkedLicenses(temp);

            if (typeof licensesCopy[licenseID].requirements[index]["linkedCEs"] == "object") {
                licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID] = Number(hours);
            }
            else {
                licensesCopy[licenseID].requirements[index]["linkedCEs"] = {};
                licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID] = Number(hours);
            }
        }
        else {
            delete licensesCopy[licenseID].requirements[index]["linkedCEs"][ceID];
            let temp = linkedLicenses.filter(id => id !== licenseID || id == props?.route?.params?.id);
            setLinkedLicenses(temp);
        }
        setLocalLicensesCopy(licensesCopy);
    }

    let setTotalRequirementHours = (hours, licenseID) => {
        // Links CE to license/the total hours required for this license.
        if (props?.route?.params?.id && props?.route?.params?.id == licenseID) {
            setHours(hours);
        }

        if (!licenseID) {
            return;
        }
        let licensesCopy = JSON.parse(JSON.stringify(licenses));
        if (hours) {
            if (typeof licensesCopy[licenseID]["linkedCEs"] == "object") {
                licensesCopy[licenseID]["linkedCEs"][ceID] = Number(hours);
            }
            else {
                licensesCopy[licenseID]["linkedCEs"] = {};
                licensesCopy[licenseID]["linkedCEs"][ceID] = Number(hours);
            }
        }
        else {
            delete licensesCopy[licenseID]["linkedCEs"][ceID];
        }
        setLocalLicensesCopy(licensesCopy);

        // Updating linkedLicenses (to display green checkmark and bolded text for license)
        for (requirementIndex in licensesCopy[licenseID].requirements) {
            for (linkedCE in licensesCopy[licenseID].requirements[requirementIndex]["linkedCEs"]) {
                if (linkedCE == ceID) {
                    let temp = linkedLicenses.concat(licenseID);
                    setLinkedLicenses(temp);
                    return;
                }
            }
        }
        for (linkedCE in licensesCopy[licenseID]["linkedCEs"]) {
            if (linkedCE == ceID) {
                let temp = linkedLicenses.concat(licenseID);
                setLinkedLicenses(temp);
                return;
            }
        }

        // No linked CEs match current CE => remove current license from linkedLicenses
        let temp = linkedLicenses.filter(id => id !== licenseID || id == props?.route?.params?.id);
        setLinkedLicenses(temp);
    }

    let addCE = () => {
        setIsLoading(true);
        if (isFormComplete()) {
            let ceData = {
                name: name,
                hours: Number(hours),
                completionDate: completionDate,
                providerNum: providerNum,
                id: ceID,
                ceThumbnail: ceThumbnail,
                cePhoto: cePhoto,
            }
            let ceObj = {}
            ceObj[ceID] = ceData;
            console.log(`CEData: ${JSON.stringify(ceData)}`);

            let uid = auth().currentUser.uid;
            let db = firestore();
            db.collection('users').doc(uid).collection('CEs').doc('CEData').set(ceObj, { merge: true })
                .then(() => {
                    console.log("CE successfully written!");
                    db.collection('users').doc(uid).collection('CEs').doc('CEData').get()
                        .then((response) => {
                            let data = response.data();
                            dispatch(updateCEs(data));
                        })
                    db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(localLicensesCopy, { merge: true })
                        .then(() => {
                            console.log("Document successfully written!");
                            dispatch(updateLicenses(localLicensesCopy));
                            props.navigation.navigate("Homepage");
                        })
                        .catch((error) => {
                            console.error("Error adding document: ", error);
                            props.navigation.navigate("Homepage");
                        });
                })
                .catch((error) => {
                    setGeneralErrorMsg("Failed to save CE. Please try again later.");
                    console.error("Error adding CE: ", error);
                    props.navigation.navigate("Homepage");
                });
        }
        else {
            this.scrollView.scrollTo({ y: 0 });
        }
    }

    let applyTowardsLicense = () => {
        setApplyingTowardsLicense(!applyingTowardsLicense);
    }
    React.useEffect(() => {
        if (applyingTowardsLicense) {
            setApplyingTowardsLicense(false);
        }
    }, [applyingTowardsLicense])

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={headerHeight}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.requirementContainer}
        >
            <ScrollView
                ref={ref => this.scrollView = ref}
                contentContainerStyle={styles.container}>

                <View style={styles.headerContainer}>
                    <Header text="CE Information" />
                </View>
                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.inputLabel}>Name of CE {nameErrorMsg ? (<Text style={styles.errorMessage}> {nameErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. Bioterrorism'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            maxLength={40}
                        />
                    </View>
                </View>

                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.inputLabel}>Provider Name {providerNameErrorMsg ? (<Text style={styles.errorMessage}> {providerNameErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. Bioterrorism'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={providerName}
                            onChangeText={setProviderName}
                            maxLength={40}
                        />
                    </View>
                </View>

                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.providerContainer}>
                        <Text style={styles.inputLabel}>Provider # {providerErrorMsg ? (<Text style={styles.errorMessage}> {providerErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. V15058'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={providerNum}
                            onChangeText={setProviderNum}
                            maxLength={40}
                        />
                    </View>
                    <View style={styles.hoursContainer}>
                        <Text style={styles.inputLabel}>Hours {hoursErrorMsg ? (<Text style={styles.errorMessage}> {hoursErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. 30'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={hours}
                            onChangeText={hourText => { setTotalRequirementHours(hourText, props?.route?.params?.id); setHours(hourText) }}
                            keyboardType={'numeric'}
                            maxLength={4}
                        />
                    </View>
                </View>

                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.inputLabel}>Completion Date {completionErrorMsg ? (<Text style={styles.errorMessage}> {completionErrorMsg}</Text>) : (null)}</Text>
                        <TextInputMask
                            style={styles.dateInput}
                            keyboardType={'numeric'}
                            placeholder={'MM/DD/YYYY'}
                            placeholderTextColor={colors.grey400}
                            type={'datetime'}
                            value={completionDate}
                            options={{
                                format: 'MM/DD/YYYY'
                            }}
                            onChangeText={text => {
                                setCompletionDate(text);
                            }}
                        />
                    </View>
                </View>

                <View style={styles.thumbnailContainer}>
                    <Text style={styles.inputLabel}>CE Photo (optional)</Text>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate('Scanner', {
                                fromThisScreen: route.name,
                                initialFilterId: 2, // Black & White
                            });
                        }}
                        style={styles.thumbnailButton}
                    >
                        {ceThumbnail ? (<FastImage
                            style={{ width: 75 * rem, aspectRatio: 1, borderRadius: 10 * rem, backgroundColor: 'black' }}
                            source={{
                                uri: ceThumbnail,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                        ) : (
                                <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                            )}
                    </TouchableOpacity>
                </View>

                <View style={styles.headerWrapContainer}>
                    <Header text="Link to Additional Licenses/Certifications" />
                </View>

                <TouchableOpacity
                    onPress={applyTowardsLicense}
                    style={styles.linkCEButton}
                >
                    <Text style={styles.linkCEButtonText}>{('Link CE')}</Text>
                </TouchableOpacity>

                <Text style={styles.errorMessage}> {generalErrorMsg}</Text>
                <TouchableOpacity
                    onPress={() => { addCE() }}
                    disabled={isLoading}
                    style={styles.addNewCEButton}
                >
                    <Text style={styles.choiceTextSelected}>{isLoading ? ('...') : ('Save')}</Text>
                </TouchableOpacity>

            </ScrollView >

            <ApplyTowardLicense open={applyingTowardsLicense} id={ceID} licenseID={props.route?.params?.id} new={true} hours={hours} setTotalRequirementHours={setTotalRequirementHours} setRequirementHours={setRequirementHours} />
        </KeyboardAvoidingView >
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    container: {
        minHeight: Dimensions.get('window').height,
        flexGrow: 1,
        backgroundColor: 'white',
        padding: 18 * rem,
    },
    headerContainer: {
        width: '100%',
        height: 40 * rem,
        marginTop: 18 * rem,
        marginBottom: 18 * rem,
        zIndex: -1,
    },
    headerWrapContainer: {
        width: '100%',
        height: 60 * rem,
        marginTop: 18 * rem,
        marginBottom: 18 * rem,
        zIndex: -1,
    },
    ceFlexRowContainer: {
        flexDirection: 'row',
        minHeight: (50 + 24) * rem,
        marginBottom: 18 * rem,
        alignContent: 'center',
        alignItems: 'center',
    },
    errorMessage: {
        fontSize: 16 * rem,
        color: colors.red500,
        fontWeight: '500',
    },
    inputLabel: {
        fontSize: 16 * rem,
        color: colors.grey800,
        fontWeight: '500',
        marginBottom: 6 * rem,
    },
    nameContainer: {
        height: 50 * rem,
        minWidth: 160 * rem,
        width: '100%',
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

    providerContainer: {
        height: 50 * rem,
        minWidth: 180 * rem,
        width: '60%',
        marginRight: '4%',
    },
    hoursContainer: {
        height: 50 * rem,
        width: '36%',
    },
    dateContainer: {
        height: 50 * rem,
        minWidth: 180 * rem,
        width: '100%',
    },
    dateInput: {
        width: '50%',
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
    addNewCEButton: {
        width: '100%',
        marginTop: 24 * rem,
        height: 50 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.blue800,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceTextSelected: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
        textAlign: 'center',
    },

    thumbnailContainer: {
        height: (75 + 24) * rem,
        minWidth: 160 * rem,
        width: '100%',
        marginTop: 12 * rem,
        marginBottom: 24 * rem,
    },
    thumbnailButton: {
        width: 75 * rem,
        aspectRatio: 1,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
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
        color: colors.blue300,
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

    emptyText: {
        fontSize: 16 * rem,
        marginBottom: 24 * rem,
        textAlign: 'center',
    },

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
    },
    modalTitle: {
        fontSize: 20 * rem,
        color: colors.grey900,
        marginBottom: 24 * rem,
    },
});

