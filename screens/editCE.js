import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses, updateCertifications, updateCEs } from '../actions';
import { Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity, Text, TextInput, View, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView, Image } from 'react-native';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Header from '../components/header.js';
import { TextInputMask } from 'react-native-masked-text';
import { useHeaderHeight } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import ApplyTowardLicense from '../components/applyTowardLicense';
import { useRoute } from '@react-navigation/native';


export default function editCE(props) {
    const licenses = useSelector(state => state.licenses);
    const certifications = useSelector(state => state.certifications);
    const allCEData = useSelector(state => state.ces);
    const dispatch = useDispatch();
    const headerHeight = useHeaderHeight();
    let ceID = props.route.params.ceData.id;

    const [licenseID, setLicenseID] = useState("");
    const [name, setName] = useState(props.route.params.ceData.name);
    const [nameErrorMsg, setNameErrorMsg] = useState("");
    const [providerName, setProviderName] = useState(props.route.params.ceData.providerName);
    const [providerNameErrorMsg, setProviderNameErrorMsg] = useState("");
    const [hours, setHours] = useState(props.route.params.ceData.hours.toString());
    const [hoursErrorMsg, setHoursErrorMsg] = useState("");
    const [completionDate, setCompletionDate] = useState(props.route.params.ceData.completionDate);
    const [completionErrorMsg, setCompletionErrorMsg] = useState("");
    const [providerNum, setProviderNum] = useState(props.route.params.ceData.providerNum);
    const [providerErrorMsg, setProviderErrorMsg] = useState("");

    const [generalErrorMsg, setGeneralErrorMsg] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [cePhoto, setCEPhoto] = useState(props.route.params.ceData?.cePhoto ? props.route.params.ceData?.cePhoto : "");
    const [ceThumbnail, setCEThumbnail] = useState(""); // Handled in useEffect block below.

    const [linkedData, setLinkedData] = useState([]);
    const [localLicensesCopy, setLocalLicensesCopy] = useState(JSON.parse(JSON.stringify(licenses)));
    const [localCertificationsCopy, setLocalCertificationsCopy] = useState(JSON.parse(JSON.stringify(certifications)));

    const [applyingTowardsLicense, setApplyingTowardsLicense] = useState(false);

    const route = useRoute();

    React.useEffect(() => {
        setLocalLicensesCopy(JSON.parse(JSON.stringify(licenses)));

        if (props.route?.params?.ceData?.ceThumbnail) {
            setCEThumbnail(props.route?.params?.ceData?.ceThumbnail);
        }

        if (allCEData[ceID].cePhoto !== cePhoto) {
            setCEPhoto(allCEData[ceID].cePhoto);
        }
        if (allCEData[ceID].ceThumbnail !== ceThumbnail) {
            setCEPhoto(allCEData[ceID].ceThumbnail);
        }

        // For tracking license ID user came from
        if (props?.route?.params?.fromLicenseID) {
            let isArr = Object.prototype.toString.call(linkedData) == '[object Array]';
            setLicenseID(props.route.params.fromLicenseID);
            let temp = linkedData.concat(props.route.params.fromLicenseID);
            setLinkedData(temp);
        }
    }, [JSON.stringify(allCEData)]);


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

        if (!providerNum) {
            isComplete = false;
            setProviderErrorMsg("Enter Provider #");
        }
        else {
            setProviderErrorMsg("");
        }

        if (!isComplete) {
            setIsLoading(false);
        }
        return isComplete;
    }

    let setRequirementHours = (hours, index, id = { licenseID: "", certificationID: "" }) => {
        // Links CE to special requirement.
        // Set license state2
        const dataID = id.licenseID ? id.licenseID : id.certificationID;
        let dataCopy = id.licenseID ? JSON.parse(JSON.stringify(localLicensesCopy)) : JSON.parse(JSON.stringify(localCertificationsCopy));

        if (index == null) {
            setHours(hours);
            return
        }
        if (hours) {
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

    let editCE = () => {
        setIsLoading(true);

        if (isFormComplete()) {
            let ceData = {
                name: name,
                providerName: providerName,
                hours: Number(hours),
                completionDate: completionDate,
                providerNum: providerNum,
                id: ceID,
                ceThumbnail: ceThumbnail,
                cePhoto: cePhoto,
            }
            let ceObj = {
                [ceID]: ceData,
            }

            let uid = auth().currentUser.uid;
            let db = firestore();
            db.collection('users').doc(uid).collection('CEs').doc('CEData').set(ceObj, { merge: true })
                .then(() => {
                    console.log("CE successfully written!");
                    db.collection('users').doc(uid).collection('CEs').doc('CEData').get()
                        .then((response) => {
                            let data = response.data();
                            // Checking if data is empty
                            if (typeof data == 'undefined' || Object.keys(data).length === 0 && data.constructor === Object) {
                                dispatch(updateCEs({}));
                            }
                            else {
                                dispatch(updateCEs(data));
                            }

                            db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(localLicensesCopy, { merge: true })
                                .then(() => {
                                    console.log("License data successfully written!");
                                    dispatch(updateLicenses(localLicensesCopy));
                                    props.navigation.navigate("Homepage");
                                })
                                .catch((error) => {
                                    console.error("Error adding document: ", error);
                                    props.navigation.navigate("Homepage");
                                });
                        })
                        .catch((error) => {
                            console.log("Error getting CEs: ", error);
                        });
                })
                .catch((error) => {
                    setGeneralErrorMsg("Failed to save CE. Please try again later.");
                    console.error("Error adding CE: ", error);
                });
        }
        else {
            this.scrollView.scrollTo({ y: 0 });
        }
    }

    let applyTowardsLicense = () => {
        setApplyingTowardsLicense(!applyingTowardsLicense);
    }

    useEffect(() => {
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
                contentContainerStyle={styles.container} keyboardShouldPersistTaps={'always'}>

                {/* <View style={styles.headerContainer}>
                    <Header text="CE Information" />
                </View> */}
                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.inputLabel}>Name of CE {nameErrorMsg ? (<Text style={styles.errorMessage}> {nameErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. Bioethics'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            maxLength={70}
                        />
                    </View>
                </View>

                <View style={styles.ceFlexRowContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.inputLabel}>Provider Name {providerNameErrorMsg ? (<Text style={styles.errorMessage}> {providerNameErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. Nurse.com'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={providerName}
                            onChangeText={setProviderName}
                            maxLength={70}
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
                            maxLength={70}
                        />
                    </View>
                    <View style={styles.hoursContainer}>
                        <Text style={styles.inputLabel}>Hours {hoursErrorMsg ? (<Text style={styles.errorMessage}> {hoursErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. 30'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={hours}
                            onChangeText={hourText => { setRequirementHours(hourText, null, { licenseID: props?.route?.params?.licenseID, certificationID: props?.route?.params?.certificationID }); setHours(hourText) }}
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
                                ceID: ceID,
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

                {/* <View style={styles.headerWrapContainer}>
                    <Header text="Apply to Additional Licenses/Certifications" />
                </View> */}

                {/* <TouchableOpacity
                    onPress={applyTowardsLicense}
                    style={styles.linkCEButton}
                >
                    <Text style={styles.linkCEButtonText}>{('Apply CE')}</Text>
                </TouchableOpacity> */}

                <View style={styles.additionalQuestionContainer}>
                    <Text style={styles.inputLabel}>Would you like to apply this CE to other credentials?</Text>

                    <View style={styles.dateContainer}>
                        <TouchableOpacity
                            onPress={applyTowardsLicense}
                            style={styles.linkCEButton}
                        >
                            <Text style={styles.linkCEButtonText}>{('Apply to Other Credentials')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.errorMessage}> {generalErrorMsg}</Text>
                <TouchableOpacity
                    onPress={() => { editCE() }}
                    disabled={isLoading}
                    style={styles.addNewCEButton}
                >
                    <Text style={styles.choiceTextSelected}>{isLoading ? ('...') : ('Save')}</Text>
                </TouchableOpacity>

            </ScrollView >

            <ApplyTowardLicense open={applyingTowardsLicense} id={ceID} licenseID={props.route?.params?.licenseID} certificationID={props.route?.params?.certificationID} setRequirementHours={setRequirementHours} hours={hours} />
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
        paddingLeft: 18 * rem, paddingRight: 18 * rem,
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
        alignSelf: 'flex-start',
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

    emptyText: {
        fontSize: 16 * rem,
        marginBottom: 24 * rem,
        textAlign: 'center',
    },

    modalTransparency: {
        backgroundColor: 'rgba(0,0,0, 0.50)',
        height: '100%',
        width: '100%',
        position: 'absolute',
    },
    modalPopupContainer: {
        flexShrink: 1,
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

    additionalQuestionContainer: {
        flexDirection: 'column',
        minHeight: (50 + 24) * rem,
        marginBottom: 18 * rem,
    },
});

