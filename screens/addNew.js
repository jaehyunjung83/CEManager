import React, { useState, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions, TouchableHighlight, Easing, ScrollView, Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import LicenseCard from '../components/licenseCard.js';
import Header from '../components/header.js';
import AutoCompleteInput from '../components/autoCompleteInput.js';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useHeaderHeight } from '@react-navigation/stack';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import FastImage from 'react-native-fast-image'

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
export default function addLicense(props) {

    const headerHeight = useHeaderHeight();

    // Used for getting position of text label of state input. This is a workaround to get the effect of KeyboardAvoidingView.
    measure = () => {
        this.text.measure((x, y, width, height, px, py) => {
            setTextPositionY(py);
        })
    }

    scrollToCallBack = () => {
        if (licenseType === "Other") {
            this.scrollView.scrollTo({ y: textPositionY - (245 * rem) });
        }
        else {
            this.scrollView.scrollTo({ y: textPositionY - (330 * rem) });
        }
    }

    const [isLicenseSelected, setIsLicenseSelected] = useState(false);
    const [isCertSelected, setIsCertSelected] = useState(false);
    const [licenseType, setLicenseType] = useState("");
    const [typeErrorMsg, setTypeErrorMsg] = useState("");
    const [otherLicenseType, setOtherLicenseType] = useState("");
    const [otherTypeErrorMsg, setOtherTypeErrorMsg] = useState("");
    const [licenseState, setLicenseState] = useState("");
    const [stateErrorMsg, setStateErrorMsg] = useState("");
    const [licenseNum, setLicenseNum] = useState("");
    const [licenseExpiration, setLicenseExpiration] = useState("");
    const [expirationErrorMsg, setExpirationErrorMsg] = useState("");
    const [ceHoursRequired, setCEHoursRequired] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [requirements, setRequirements] = useState([]);
    const [textPositionY, setTextPositionY] = useState(0);
    const [licenseThumbnail, setlicenseThumbnail] = useState("");
    const [licensePhoto, setLicensePhoto] = useState("");

    let selectLicense = () => {
        if (!isLicenseSelected) {
            setIsLicenseSelected(true);
        }
        setIsCertSelected(false);
    }

    let selectCertification = () => {
        if (!isCertSelected) {
            setIsCertSelected(true);
        }
        setIsLicenseSelected(false);
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

    let addLicense = () => {
        if (isFormComplete()) {
            // TODO: Add new license to homepage, return to homepage

            licenseData = {
                licenseType: licenseType,
                otherLicenseType: otherLicenseType,
                licenseState: licenseState,
                licenseNum: licenseNum,
                licenseExpiration: licenseExpiration,
                licensePhoto: licensePhoto,
                licenseThumbnail: licenseThumbnail,
                totalCEHours: ceHoursRequired,
                requirements: requirements,
            }
            console.log(licenseData);
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
        return isComplete;
    }

    React.useEffect(() => {
        if (typeof props.route.params?.thumbnailURL !== 'undefined') {
            console.log("Setting thumbnail to: " + props.route.params.thumbnailURL);
            if(typeof props.route.params?.photoURL !== 'undefined') {
                setLicensePhoto(props.route.params.photoURL);
            }
            setlicenseThumbnail(props.route.params.thumbnailURL);
        }
        else {
            console.log("route updated, no thumbnail");
            console.log(props.route.params);
        }
    }, [props.route.params?.thumbnailURL]);

    // TODO: Grab these from firebase instead of hardcoding.
    const licenseTypes = ["Registed Nurse (RN)", "Licensed Vocational Nurse (LVN)", "Other"];
    const states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={headerHeight}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.requirementContainer}
        >
            <ScrollView
                ref={ref => this.scrollView = ref}
                contentContainerStyle={styles.container}>
                <View style={styles.addChoiceContainer}>
                    <Text style={styles.choiceText}>Which would you like to add?</Text>
                    <View style={styles.choiceButtonsContainer}>
                        <TouchableHighlight style={isLicenseSelected ? styles.licenseButtonSelected : styles.licenseButtonNotSelected}
                            onPress={selectLicense}
                            underlayColor={colors.underlayColor}
                        >
                            <Text style={isLicenseSelected ? styles.choiceTextSelected : styles.choiceTextNotSelected}>License</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={isCertSelected ? styles.certButtonSelected : styles.certButtonNotSelected}
                            onPress={selectCertification}
                            underlayColor={colors.underlayColor}
                        >
                            <Text style={isCertSelected ? styles.choiceTextSelected : styles.choiceTextNotSelected}>Certification</Text>
                        </TouchableHighlight>
                    </View>
                </View>
                {isLicenseSelected ? (
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
                                            value={otherLicenseType}
                                            onChangeText={setOtherLicenseType}
                                            maxLength={70}
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
                                        inputVal={licenseState}
                                    />
                                </View>
                                <View style={styles.licenseNumContainer}>
                                    <Text style={styles.inputLabel}>License # (optional)</Text>
                                    <TextInput
                                        placeholder={'e.g. 589304502'}
                                        placeholderTextColor={colors.grey400}
                                        style={styles.licenseNumInput}
                                        value={licenseNum}
                                        onChangeText={setLicenseNum}
                                        keyboardType={'numeric'}
                                        maxLength={40}
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
                                        options={{
                                            format: 'MM/DD/YYYY'
                                        }}
                                        value={licenseExpiration}
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
                                            fromThisScreen: 'AddNew',
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

                            {requirements.length ? (<View style={styles.requirementsContainer}>
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
                                addLicense();
                            }}
                            style={styles.addNewLicenseButton}
                        >
                            <Text style={styles.choiceTextSelected}>Add New License</Text>
                        </TouchableOpacity>
                    </FadeInView>
                ) : (null)
                }
                {
                    isCertSelected ? (
                        <FadeInView style={styles.formContainer}>
                            <LicenseCard />
                        </FadeInView>
                    ) : (null)
                }
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
        alignContent: 'center',
        justifyContent: 'center',
        marginBottom: 18 * rem,
        borderRadius: 10 * rem,
    },
    selectLicenseTypeText: {
        fontSize: 16 * rem,
        color: colors.grey900,
        paddingLeft: 18 * rem,
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
        alignContent: 'center',
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
        padding: 18 * rem,
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
        padding: 18 * rem,
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
        alignContent: 'center',
        marginBottom: 6 * rem,
    },
    deleteButton: {
        alignSelf: 'center',
        margin: 12 * rem,
        marginTop: 6 * rem,
        marginBottom: 6 * rem,
    },
    requirementHoursInput: {
        width: 65 * rem,
        marginRight: 6 * rem,
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        padding: 18 * rem,
        color: colors.grey900,
    },
    requirementInput: {
        flex: 1,
        height: '100%',
        fontSize: 16 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.grey200,
        padding: 18 * rem,
        color: colors.grey900,
    },
    noRequirementsText: {
        fontSize: 16 * rem,
        color: colors.grey500,
    },
    addNewLicenseButton: {
        width: '100%',
        height: 50 * rem,
        borderRadius: 10 * rem,
        backgroundColor: colors.blue800,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: 24 * rem,
    },
});

