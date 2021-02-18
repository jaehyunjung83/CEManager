import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses } from '../actions';
import { Animated, View, Text, StyleSheet, Dimensions, TouchableHighlight, Easing, ScrollView, Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import Header from '../components/header.js';
import AutoCompleteInput from '../components/autoCompleteInput.js';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useHeaderHeight } from '@react-navigation/stack';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import FastImage from 'react-native-fast-image'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { useRoute } from '@react-navigation/native';


const FadeInView = (props) => {
    const openAnim = useRef(new Animated.Value(0)).current  // Initial value for opacity: 0

    React.useEffect(() => {
        Animated.timing(
            openAnim,
            {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
        ).start();
    }, [])

    return (
        <Animated.View
            style={{
                ...props.style,
                opacity: openAnim.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0, 1]
                }),
                transform: [{
                    scaleX: openAnim
                },
                {
                    scaleY: openAnim
                }]
            }}
        >
            {props.children}
        </Animated.View>
    );
}


// TODO: Remember auto generate CE's needed and requirements for specific states.
// TODO: Delete pic and thumbnail if adding license is cancelled.
export default function editLicense(props) {
    licenseID = props.route.params.licenseID;

    const headerHeight = useHeaderHeight();
    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    const route = useRoute();
    const licenses = useSelector(state => state.licenses);
    const dispatch = useDispatch();


    React.useEffect(() => {
        let db = firestore();
        db.collection('licenseConfig').doc('licenseTypes').get()
            .then(response => {
                setLicenseTypes(response.data().licenseTypes);
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }, [licenseTypes])

    React.useEffect(() => {
        if (!licenses[licenseID]) return;
        setLicenseType(licenses[licenseID].licenseType);
        setOtherLicenseType(licenses[licenseID].otherLicenseType);
        setLicenseState(licenses[licenseID].licenseState);
        setLicenseNum(licenses[licenseID].licenseNum);
        setLicenseExpiration(licenses[licenseID].licenseExpiration);
        for (const index in licenses[licenseID].requirements) {
            if (licenses[licenseID].requirements[index].name == "Total CEs Needed") {
                setCEHoursRequired(licenses[licenseID].requirements[index].hours);
            }
        }
        if (licenses[licenseID].requirements.length > 1 || licenses[licenseID].requirements[0]?.name !== "Total CEs Needed") {
            setRequirements(licenses[licenseID].requirements);
        }
        setLicenseThumbnail(licenses[licenseID].licenseThumbnail);
        setLicensePhoto(licenses[licenseID].licensePhoto);
    }, [JSON.stringify(licenses)]);

    const [licenseTypes, setLicenseTypes] = useState([]);
    const [licenseType, setLicenseType] = useState("");
    const [typeErrorMsg, setTypeErrorMsg] = useState("");

    const [otherLicenseType, setOtherLicenseType] = useState("");
    const [otherTypeErrorMsg, setOtherTypeErrorMsg] = useState("");

    const [licenseState, setLicenseState] = useState("");
    const [stateErrorMsg, setStateErrorMsg] = useState("");

    const [licenseNum, setLicenseNum] = useState("");
    const [licenseExpiration, setLicenseExpiration] = useState("");
    const [expirationErrorMsg, setExpirationErrorMsg] = useState("");

    const [ceHoursRequired, setCEHoursRequired] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [requirements, setRequirements] = useState([]);
    const [textPositionY, setTextPositionY] = useState(0);
    const [licenseThumbnail, setLicenseThumbnail] = useState("");
    const [licensePhoto, setLicensePhoto] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Used for getting position of text label of state input. This is a workaround to get the effect of KeyboardAvoidingView.
    let measure = () => {
        this.text.measure((x, y, width, height, px, py) => {
            setTextPositionY(py);
        })
    }

    let scrollToCallBack = () => {
        if (licenseType === "Other") {
            this.scrollView.scrollTo({ y: textPositionY - (245 * rem) });
        }
        else {
            this.scrollView.scrollTo({ y: textPositionY - (330 * rem) });
        }
    }


    let addNewRequirement = () => {
        const key = uuidv4();
        let newRequirement = {
            key: key,
            hours: '',
            name: ''
        }
        if (requirements.length) {
            let temp = [...requirements];
            temp.push(newRequirement);
            setRequirements(temp);
        }
        else {
            temp = [newRequirement];
            setRequirements(temp);
        }
    }

    let handleHours = (text, index) => {
        let temp = [...requirements];
        temp[index].hours = text;
        setRequirements(temp);
    }

    let handleName = (text, index) => {
        let temp = [...requirements];
        temp[index].name = text;
        setRequirements(temp);
    }

    let editLicense = () => {
        setIsLoading(true);
        if (isFormComplete()) {
            let requirementsCopy = [...requirements];
            if (ceHoursRequired) {
                requirementsCopy.push({
                    key: uuidv4(),
                    hours: ceHoursRequired,
                    name: "Total CEs Needed",
                    linkedCEs: {},
                })
            }
            licenseData = {
                licenseType: licenseType,
                otherLicenseType: otherLicenseType,
                licenseState: licenseState,
                licenseNum: licenseNum,
                licenseExpiration: licenseExpiration,
                licensePhoto: licensePhoto,
                licenseThumbnail: licenseThumbnail,
                requirements: requirementsCopy,
                id: licenseID,
            }
            let licenseObj = {
                [licenseID]: licenseData,
            }

            let uid = auth().currentUser.uid;
            let db = firestore();
            db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
                .then(() => {
                    console.log("Document successfully written!");
                    db.collection('users').doc(uid).collection('licenses').doc('licenseData').get()
                        .then(response => {
                            dispatch(updateLicenses(response.data()));
                        })
                    props.navigation.navigate("Homepage");
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    props.navigation.navigate("Homepage");
                });
        }
    }

    // Checks for license type, other license type (if Other is selected), state, and expiration of license.
    let isFormComplete = () => {
        let isComplete = true;
        if (!licenseTypes.includes(licenseType)) {
            isComplete = false;
            setTypeErrorMsg("Select a license type");
            this.scrollView.scrollTo({ y: 0 });
        }
        else {
            setTypeErrorMsg("");
        }
        if (licenseType === "Other") {
            if (!otherLicenseType) {
                isComplete = false;
                setOtherTypeErrorMsg("Enter type of license");
                this.scrollView.scrollTo({ y: 0 });
            }
            else {
                setOtherTypeErrorMsg("");
            }
        }
        if (!states.includes(licenseState)) {
            isComplete = false;
            setStateErrorMsg("Select a state");
            this.scrollView.scrollTo({ y: 0 });
        }
        else {
            setStateErrorMsg("");
        }
        if (licenseExpiration.length !== 10) {
            isComplete = false;
            setExpirationErrorMsg("Format: (MM/DD/YYYY)");
            this.scrollView.scrollTo({ y: 0 });
        }
        else if (parseInt(licenseExpiration.substring(0, 2)) === 0 || parseInt(licenseExpiration.substring(0, 2)) > 12) {
            isComplete = false;
            setExpirationErrorMsg("Month: 1-12");
            this.scrollView.scrollTo({ y: 0 });
        }
        else if (parseInt(licenseExpiration.substring(3, 5)) === 0 || parseInt(licenseExpiration.substring(3, 5)) > 31) {
            isComplete = false;
            setExpirationErrorMsg("Days: 1-31");
            this.scrollView.scrollTo({ y: 0 });
        }
        else {
            setExpirationErrorMsg("");
        }
        if (!isComplete) {
            setIsLoading(false);
        }
        return isComplete;
    }

    React.useEffect(() => {
        if (typeof props.route?.params?.thumbnailURL !== 'undefined') {
            if (licenseThumbnail) {
                // User is replacing old thumbnail. Delete old one.
                // Firebase couldn't parse the URL for some reason.
                // const oldThumbnailRef = storage().refFromURL(licenseThumbnail);
                const oldThumbnailPath = licenseThumbnail.replace('https://storage.googleapis.com/cetracker-2de23.appspot.com/', '');
                const oldThumbnailRef = storage().ref().child(`${oldThumbnailPath}`);

                oldThumbnailRef.delete()
                    .then(() => {
                        console.log("Deleted thumbnail successfully.");
                        setLicenseThumbnail(props.route?.params?.thumbnailURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old thumbnail. Error: " + error.toString());
                    })
            }
            else {
                setLicenseThumbnail(props.route?.params?.thumbnailURL);
            }
        }
        if (typeof props.route.params?.photoURL !== 'undefined') {
            if (licensePhoto) {
                // User is replacing old photo. Delete old one.
                const firstPhotoRef = storage().refFromURL(licensePhoto).toString();
                const oldPhotoPath = firstPhotoRef.replace('gs://cetracker-2de23', '');
                const oldPhotoRef = storage().ref().child(`${oldPhotoPath}`);
                oldPhotoRef.delete()
                    .then(() => {
                        console.log("Deleted photo successfully.");
                        setLicensePhoto(props.route?.params?.photoURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old photo. Error: " + error.toString());
                    })
            }
            else {
                setLicensePhoto(props.route?.params?.photoURL);
            }
        }
    }, [props.route.params?.thumbnailURL]);

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={headerHeight}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.requirementContainer}
        >
            <ScrollView
                ref={ref => this.scrollView = ref}
                contentContainerStyle={styles.container}>
                <FadeInView style={styles.formContainer}>
                    <View style={styles.headerContainer}>
                        <Header text="License Information" />
                    </View>
                    <View style={styles.licenseInfoContainer}>
                        <Text style={styles.inputLabel}>License Type {typeErrorMsg ? (<Text style={styles.errorMessage}> {typeErrorMsg}</Text>) : (null)}</Text>
                        <TouchableOpacity
                            style={styles.selectLicenseType}
                            onPress={() => setIsModalVisible(true)}
                        >
                            <Text style={styles.selectLicenseTypeText}>{licenseType ? (licenseType) : ('Select License Type')}</Text>
                        </TouchableOpacity>
                        {(licenseType === "Other") ? (
                            <View style={styles.flexRowContainer}>
                                <View style={styles.otherLicenseType}>
                                    <Text style={styles.inputLabel}>Please specify {otherTypeErrorMsg ? (<Text style={styles.errorMessage}> {otherTypeErrorMsg}</Text>) : (null)}</Text>
                                    <TextInput
                                        placeholder={'e.g. Physician'}
                                        placeholderTextColor={colors.grey400}
                                        style={styles.licenseNumInput}
                                        onChangeText={setOtherLicenseType}
                                        maxLength={36}
                                        value={otherLicenseType}
                                    />
                                </View>
                            </View>
                        ) : (
                                null
                            )}
                        <Modal
                            visible={isModalVisible}
                            animationType='fade'
                            transparent={true}
                        >
                            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                                <View style={styles.modalTransparency} />
                            </TouchableWithoutFeedback>
                            <View style={styles.modalPopupContainer}>
                                <Text style={styles.modalTitle}>Select License Type</Text>
                                <FlatList
                                    data={licenseTypes}
                                    keyExtractor={item => item}
                                    renderItem={({ item }) => (
                                        <TouchableHighlight
                                            style={styles.listItemContainer}
                                            onPress={() => { setLicenseType(item); setIsModalVisible(false) }}
                                            underlayColor={colors.underlayColor}
                                        >
                                            <Text style={styles.itemText}>{item}</Text>
                                        </TouchableHighlight>
                                    )}
                                />
                            </View>
                        </Modal>

                        <View style={styles.stateAndLicenseNumContainer}>
                            <View style={styles.stateContainer}>
                                <Text
                                    onLayout={() => {
                                        measure();
                                    }}
                                    ref={ref => this.text = ref}
                                    style={styles.inputLabel}>State {stateErrorMsg ? (<Text style={styles.errorMessage}> {stateErrorMsg}</Text>) : (null)}</Text>
                                <AutoCompleteInput
                                    data={states}
                                    height={50 * rem}
                                    placeholder="e.g. California"
                                    maxSuggestions={3}
                                    scrollToCallBack={scrollToCallBack}
                                    setParentState={setLicenseState}
                                    inputVal={licenses[licenseID].licenseState}
                                />
                            </View>
                            <View style={styles.licenseNumContainer}>
                                <Text style={styles.inputLabel}>License # (optional)</Text>
                                <TextInput
                                    placeholder={'e.g. 589304502'}
                                    placeholderTextColor={colors.grey400}
                                    style={styles.licenseNumInput}
                                    onChangeText={setLicenseNum}
                                    value={licenseNum}
                                    keyboardType={'numeric'}
                                    maxLength={15}
                                />
                            </View>
                        </View>

                        <View style={styles.flexRowContainer}>
                            <View style={styles.expirationContainer}>
                                <Text style={styles.inputLabel}>Expiration {expirationErrorMsg ? (<Text style={styles.errorMessage}> {expirationErrorMsg}</Text>) : (null)}</Text>
                                <TextInputMask
                                    style={styles.expirationInput}
                                    keyboardType={'numeric'}
                                    placeholder={'MM/DD/YYYY'}
                                    placeholderTextColor={colors.grey400}
                                    type={'datetime'}
                                    value={licenseExpiration}
                                    options={{
                                        format: 'MM/DD/YYYY'
                                    }}
                                    onChangeText={text => {
                                        setLicenseExpiration(text);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.thumbnailContainer}>
                            <Text style={styles.inputLabel}>License Photo (optional)</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    props.navigation.navigate('Scanner', {
                                        fromThisScreen: route.name,
                                        initialFilterId: 1, // Color photo
                                    });
                                }}
                                style={styles.thumbnailButton}
                            >
                                {licenseThumbnail ? (<FastImage
                                    style={{ width: 75 * rem, aspectRatio: 1, borderRadius: 10 * rem, backgroundColor: 'black' }}
                                    source={{
                                        uri: licenseThumbnail,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                                ) : (
                                        <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                                    )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.headerContainer}>
                        <Header text="CE Requirements (optional)" />
                    </View>
                    <View style={styles.ceRequirementsContainer}>
                        <View style={styles.flexRowContainer}>
                            <View style={styles.ceHoursRequired}>
                                <Text style={styles.inputLabel}>Total Hours</Text>
                                <TextInput
                                    placeholder={'e.g. 30'}
                                    placeholderTextColor={colors.grey400}
                                    style={styles.licenseNumInput}
                                    value={ceHoursRequired}
                                    onChangeText={setCEHoursRequired}
                                    keyboardType={'numeric'}
                                    maxLength={5}
                                />
                            </View>
                            <TouchableOpacity style={styles.addRequirementButton}
                                onPress={() => addNewRequirement()}>
                                <AntDesign
                                    name='book'
                                    size={20 * rem}
                                    color={colors.blue800}
                                />
                                <Text style={styles.addRequirementText}> Add Requirement</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Additional Requirements</Text>

                        {requirements.length ? (
                            <View style={styles.requirementsContainer}>
                                <Text style={styles.hoursOptionalText}>Inputting hours is optional.</Text>
                                <FlatList
                                    keyExtractor={item => item.key}
                                    data={requirements}
                                    extraData={requirements}
                                    renderItem={({ item, index }) => (
                                        <View style={styles.requirementContainer}>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    let temp = [...requirements];
                                                    temp.splice(index, 1);
                                                    setRequirements(temp)
                                                }}
                                            >
                                                <AntDesign
                                                    name='closecircle'
                                                    size={36 * rem}
                                                    color={colors.blue800}
                                                />
                                            </TouchableOpacity>
                                            <TextInput
                                                placeholder={'Hrs'}
                                                placeholderTextColor={colors.grey400}
                                                style={styles.requirementHoursInput}
                                                value={item.hours}
                                                onChangeText={text => { handleHours(text, index) }}
                                                keyboardType={'numeric'}
                                                maxLength={5}
                                            />
                                            <TextInput
                                                placeholder={'e.g. Bioterrorism'}
                                                placeholderTextColor={colors.grey400}
                                                style={styles.requirementInput}
                                                value={item.name}
                                                onChangeText={text => { handleName(text, index) }}
                                                maxLength={70}
                                            />
                                        </View>
                                    )}
                                />
                            </View>
                        ) : (
                                <Text style={styles.noRequirementsText}>Some states have special requirements for license renewal. Click Add Requirement to add some!</Text>
                            )}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            editLicense();
                        }}
                        disabled={isLoading}
                        style={styles.addNewLicenseButton}
                    >
                        <Text style={styles.choiceTextSelected}>{isLoading ? ('...') : ('Save')}</Text>
                    </TouchableOpacity>
                </FadeInView>
            </ScrollView >
        </KeyboardAvoidingView>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    container: {
        minHeight: Dimensions.get('window').height,
        flexGrow: 1,
        backgroundColor: 'white',
        padding: 18 * rem,
    },
    addChoiceContainer: {
        top: 0,
        width: '100%',
        aspectRatio: 4.8,
        marginBottom: 24 * rem,
    },
    choiceButtonsContainer: {
        bottom: 0,
        marginTop: 18 * rem,
        flexDirection: 'row',
        height: 45 * rem,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    licenseButtonNotSelected: {
        width: screenWidth / 2 - (12 * rem),
        aspectRatio: 1,
        maxHeight: 45 * rem,
        borderTopLeftRadius: 10 * rem,
        borderBottomLeftRadius: 10 * rem,
        borderColor: colors.grey200,
        borderRightColor: colors.grey500,
        borderWidth: 2 * rem,
        marginRight: -1 * rem,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.grey200,
    },
    licenseButtonSelected: {
        width: screenWidth / 2 - (12 * rem),
        aspectRatio: 1,
        maxHeight: 45 * rem,
        backgroundColor: colors.blue800,
        borderTopLeftRadius: 10 * rem,
        borderBottomLeftRadius: 10 * rem,
        borderWidth: 2 * rem,
        marginRight: -1 * rem,
        borderColor: colors.blue800,
        alignItems: 'center',
        justifyContent: 'center',
    },
    certButtonNotSelected: {
        width: screenWidth / 2 - (12 * rem),
        aspectRatio: 1,
        maxHeight: 45 * rem,
        borderTopRightRadius: 10 * rem,
        borderBottomRightRadius: 10 * rem,
        borderColor: colors.grey200,
        borderLeftWidth: 0,
        borderWidth: 2 * rem,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.grey200,
    },
    certButtonSelected: {
        width: screenWidth / 2 - (12 * rem),
        aspectRatio: 1,
        maxHeight: 45 * rem,
        backgroundColor: colors.blue800,
        borderTopRightRadius: 10 * rem,
        borderBottomRightRadius: 10 * rem,
        borderWidth: 2 * rem,
        borderLeftWidth: 0,
        borderColor: colors.blue800,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceText: {
        fontSize: 18 * rem,
        fontWeight: '400',
        color: colors.grey900,
    },
    choiceTextNotSelected: {
        color: colors.grey500,
        fontSize: 18 * rem,
        fontWeight: '500',
        textAlign: 'center',
    },
    choiceTextSelected: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
        textAlign: 'center',
    },
    topContainer: {
        flex: 5,
        flexDirection: 'row',
    },
    formContainer: {
        height: '100%',
        width: '100%',
        marginTop: 18 * rem,
    },

    // License Form
    headerContainer: {
        width: '100%',
        height: 40 * rem,
        marginBottom: 18 * rem,
        zIndex: -1,
    },
    licenseInfoContainer: {
        padding: 6 * rem,
    },
    inputLabel: {
        fontSize: 16 * rem,
        color: colors.grey800,
        fontWeight: '500',
        marginBottom: 6 * rem,
    },
    errorMessage: {
        fontSize: 16 * rem,
        color: colors.red500,
        fontWeight: '500',
        marginBottom: 6 * rem,
    },
    selectLicenseType: {
        width: '100%',
        height: 50 * rem,
        backgroundColor: colors.grey200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18 * rem,
        borderRadius: 10 * rem,
    },
    selectLicenseTypeText: {
        fontSize: 16 * rem,
        color: colors.grey900,
        textAlign: 'left',
    },
    modalTransparency: {
        backgroundColor: 'rgba(0,0,0, 0.30)',
        height: '100%',
        width: '100%',
    },
    modalPopupContainer: {
        position: 'absolute',
        flexGrow: 1,
        marginTop: Dimensions.get('window').height / 2,
        transform: [{ translateY: '-50%', }],
        backgroundColor: 'white',
        alignSelf: 'center',
        padding: 18 * rem,
        borderRadius: 10 * rem,
    },
    modalTitle: {
        fontSize: 20 * rem,
        color: colors.grey900,
        marginBottom: 24 * rem,
    },
    listItemContainer: {
        paddingLeft: 6 * rem,
        height: 50 * rem,
        justifyContent: 'center',
    },
    otherLicenseType: {
        height: 50 * rem,
        width: '100%',
    },
    stateAndLicenseNumContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: (50 + 24) * rem,
        marginBottom: 18 * rem,
        zIndex: 999,
    },
    stateContainer: {
        height: 50 * rem,
        minWidth: 160 * rem,
        width: '40%',
        zIndex: 999,
    },
    licenseNumContainer: {
        height: 50 * rem,
        width: '48%',
    },
    licenseNumInput: {
        width: '100%',
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        color: colors.grey900,
    },
    flexRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: (50 + 24) * rem,
        marginBottom: 18 * rem,
    },
    expirationContainer: {
        height: 50 * rem,
        minWidth: 160 * rem,
        width: '100%',
    },
    expirationInput: {
        width: '42%',
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        color: colors.grey900,
    },
    thumbnailContainer: {
        height: (75 + 24) * rem,
        minWidth: 160 * rem,
        width: '100%',
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

    ceRequirementsContainer: {
        padding: 6 * rem,
    },
    ceHoursRequired: {
        height: 50 * rem,
        minWidth: 130 * rem,
        width: '30%',
    },
    addRequirementButton: {
        padding: 12 * rem,
        paddingTop: 6 * rem,
        paddingBottom: 6 * rem,
        flexDirection: 'row',
        borderRadius: 10 * rem,
        borderWidth: 2 * rem,
        borderColor: colors.blue800,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        height: 50 * rem,
        alignSelf: 'flex-end',
    },
    addRequirementText: {
        color: colors.blue800,
        fontSize: 16 * rem,
        fontWeight: '500',
    },
    requirementsContainer: {
        flexDirection: 'column',
        flexGrow: 1,
    },
    requirementContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6 * rem,
    },
    deleteButton: {
        alignSelf: 'center',
        margin: 6 * rem,
        marginLeft: 0,
    },
    requirementHoursInput: {
        width: 65 * rem,
        marginRight: 6 * rem,
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        color: colors.grey900,
    },
    requirementInput: {
        flex: 1,
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        color: colors.grey900,
    },
    noRequirementsText: {
        fontSize: 16 * rem,
        color: colors.grey500,
    },
    hoursOptionalText: {
        fontSize: 16 * rem,
        color: colors.grey500,
        marginBottom: 12 * rem,
    },
    addNewLicenseButton: {
        width: '100%',
        height: 50 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.blue800,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24 * rem,
    },
});

