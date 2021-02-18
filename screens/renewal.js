import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Dimensions, FlatList, TextInput, TouchableOpacity, ScrollView, Switch, Modal, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../components/colors.js';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { TextInputMask } from 'react-native-masked-text';
import AntDesign from 'react-native-vector-icons/AntDesign';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';



export default function renewal(props) {
    const licenses = useSelector(state => state.licenses);
    const allCEData = useSelector(state => state.ces);
    const dispatch = useDispatch();
    const licenseID = props.route.params.licenseID;
    const licenseData = licenses[licenseID];
    const licenseType = licenseData.licenseType == "Other" ? "Other" : licenseData.licenseType;

    const route = useRoute();
    const navigation = useNavigation();

    const [allRenewalData, setAllRenewalData] = useState([]);
    const [workHoursOptions, setWorkHoursOptions] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [latinoTypeOptions, setLatinoTypeOptions] = useState([]);
    const [asianTypeOptions, setAsianTypeOptions] = useState([]);
    const [pacificIslanderTypeOptions, setPacificIslanderTypeOptions] = useState([]);
    const [planToRetireOptions, setPlanToRetireOptions] = useState([]);

    React.useEffect(() => {
        // Grabbing work hour options.
        let db = firestore();
        db.collection('renewalFormData').doc(licenseType).get()
            .then(response => {
                setAllRenewalData(response.data());

                let options = JSON.parse(JSON.stringify(response.data().pages.workLocation.dropDowns.workHours.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setDropdownOptions(options);
                setWorkHoursOptions(options);

                options = JSON.parse(JSON.stringify(response.data().pages.healingArtSurvey.dropDowns.language.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setLanguageOptions(options);

                options = JSON.parse(JSON.stringify(response.data().pages.healingArtSurvey.dropDowns.latinoType.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setLatinoTypeOptions(options);

                options = JSON.parse(JSON.stringify(response.data().pages.healingArtSurvey.dropDowns.asianType.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setAsianTypeOptions(options);

                options = JSON.parse(JSON.stringify(response.data().pages.healingArtSurvey.dropDowns.pacificIslanderType.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setPacificIslanderTypeOptions(options);

                options = JSON.parse(JSON.stringify(response.data().pages.healingArtSurvey.dropDowns.planToRetire.options));
                for (const i in options) {
                    options[i] = options[i].text;
                }
                setPlanToRetireOptions(options);
            })
    }, [])

    const [pageIndex, setPageIndex] = useState(0);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [changingContactInfo, setChangingContactInfo] = useState(false);
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [line3, setLine3] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [county, setCounty] = useState('');
    const [zip, setZip] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [altPhone, setAltPhone] = useState('');

    const [renewingInactive, setRenewingInactive] = useState(false);

    const [convictedOfCrime, setConvictedOfCrime] = useState(false);
    const [crimes, setCrimes] = useState([]);
    let addCrime = () => {
        let newCrime = {
            location: '',
            date: '',
            courtCaseNum: '',
            charges: '',
            additionalInfo: '',
        }

        if (crimes.length) {
            let temp = [...crimes];
            temp.push(newCrime);
            setCrimes(temp);
        }
        else {
            temp = [newCrime];
            setCrimes(temp);
        }
    }
    let handleCrimeInput = (text, index, key) => {
        let temp = [...crimes];
        temp[index][key] = text;
        setCrimes(temp);
    }

    const [disciplined, setDisciplined] = useState(false);
    const [disciplinaryActions, setDisciplinaryActions] = useState([]);
    let addDisciplinaryAction = () => {
        let newDisciplinaryAction = {
            location: '',
            date: '',
            courtCaseNum: '',
            charges: '',
            additionalInfo: '',
        }

        if (disciplinaryActions.length) {
            let temp = [...disciplinaryActions];
            temp.push(newDisciplinaryAction);
            setDisciplinaryActions(temp);
        }
        else {
            temp = [newDisciplinaryAction];
            setDisciplinaryActions(temp);
        }
    }
    handleDisciplinaryActionInput = (text, index, key) => {
        let temp = [...disciplinaryActions];
        temp[index][key] = text;
        setDisciplinaryActions(temp);
    }

    const [servedMilitary, setServedMilitary] = useState(false);
    const toggleMilitary = () => setServedMilitary(previousState => !previousState);
    const [expertPracticeFacilitator, setExpertPracticeFacilitator] = useState(false);
    const toggleExpertPracticeFacilitator = () => setExpertPracticeFacilitator(previousState => !previousState);
    const [nurseSupportGroupFacilitator, setNurseSupportGroupFacilitator] = useState(false);
    const toggleNurseSupportGroupFacilitator = () => setNurseSupportGroupFacilitator(previousState => !previousState);
    const [interventionEvaluationCommitteeMember, setInterventionEvaluationCommitteeMember] = useState(false);
    const toggleInterventionEvaluationCommitteeMember = () => setInterventionEvaluationCommitteeMember(previousState => !previousState);
    const [ceCourseContentEvaluator, setCECourseContentEvaluator] = useState(false);
    const toggleCECourseContentEvaluator = () => setCECourseContentEvaluator(previousState => !previousState);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState([])
    const [workLocationSurvey, setWorkLocationSurvey] = useState(false);
    const [workLocationData, setWorkLocationData] = useState([])
    let addWorkLocation = () => {
        let newWorkLocation = {
            years: '',
            selfEmployed: false,
            county: '',
            zip: '',
            healthOccupation: '',
            workHours: '',
            acuteCare: false,
            homeCare: false,
            longTermAcuteCare: false,
            skilledNursingFacility: false,
            accreditedEducationProgram: false,
            manufacturer: false,
            outpatient: false,
            clinic: false,
            other: '',
            percentPatientCare: '',
            percentResearch: '',
            percentTeaching: '',
            percentAdministration: '',
            percentOther: '',
        }

        if (workLocationData.length) {
            let temp = [...workLocationData];
            temp.push(newWorkLocation);
            setWorkLocationData(temp);
        }
        else {
            temp = [newWorkLocation];
            setWorkLocationData(temp);
        }
    }
    handleWorkLocationDataInput = (value, index, key, numbersOnly = false) => {
        if (numbersOnly) {
            value = value.replace(/[^0-9]/g, '');
        }
        let temp = [...workLocationData];
        temp[index][key] = value;
        setWorkLocationData(temp);
    }
    let handleDropdownOptionPressed = (option, index, key) => {
        // Cases where there are multiple entries need to be handled differently.
        // e.g. adding multiple work locations
        let temp = [...workLocationData];
        temp[index][key] = option;
        setWorkLocationData(temp);
        setIsDropdownOpen(false);
    }

    const [healingArtsSurvey, setHealingArtsSurvey] = useState(false);
    const [persuingCredentials, setPersuingCredentials] = useState(false);
    const togglePersuingCredentials = () => setPersuingCredentials(previousState => !previousState);
    const [nameOfCredential, setNameOfCredential] = useState(false);
    const [completionYear, setCompletionYear] = useState(false);
    const [nameOfSchool, setNameOfSchool] = useState(false);
    const [addressOfSchool, setAddressOfSchool] = useState(false);
    const [africanAmerican, setAfricanAmerican] = useState(false);
    const toggleAfricanAmerican = () => setAfricanAmerican(previousState => !previousState);
    const [nativeAmerican, setNativeAmerican] = useState(false);
    const toggleNativeAmerican = () => setNativeAmerican(previousState => !previousState);
    const [white, setWhite] = useState(false);
    const toggleWhite = () => setWhite(previousState => !previousState);
    const [latino, setLatino] = useState(false);
    const toggleLatino = () => setLatino(previousState => !previousState);
    const [latinoType, setLatinoType] = useState(false);
    const [asian, setAsian] = useState(false);
    const toggleAsian = () => setAsian(previousState => !previousState);
    const [asianType, setAsianType] = useState(false);
    const [pacificIslander, setPacificIslander] = useState(false);
    const togglePacificIslander = () => setPacificIslander(previousState => !previousState);
    const [pacificIslanderType, setPacificIslanderType] = useState(false);
    const [noneOfTheAbove, setNoneOfTheAbove] = useState(false);
    const toggleNoneOfTheAbove = () => setNoneOfTheAbove(previousState => !previousState);
    const [declineToState, setDeclineToState] = useState(false);
    const toggleDeclineToState = () => setDeclineToState(previousState => !previousState);
    const [fluentInOtherLanguages, setFluentInOtherLanguages] = useState(false);
    const toggleFluentInOtherLanguages = () => setFluentInOtherLanguages(previousState => !previousState);
    const [selectedDropdown, setSelectedDropdown] = useState("");
    const [language1, setLanguage1] = useState("");
    const [language2, setLanguage2] = useState("");
    const [language3, setLanguage3] = useState("");
    const [language4, setLanguage4] = useState("");

    let handleScroll = (event: Object) => {
        setPageIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth));
    }

    let nextPage = () => {
        this.scrollView.scrollTo({ x: (pageIndex + 1) * screenWidth, y: 0, animated: true })
    }

    handleModalOptionInput = (item) => {
        if (dropdownOptions[0] == latinoTypeOptions[0]) {
            setLatinoType(item);
        }
        else if (dropdownOptions[0] == asianTypeOptions[0]) {
            setAsianType(item);
        }
        else if (dropdownOptions[0] == pacificIslanderTypeOptions[0]) {
            setPacificIslanderType(item);
        }
        else if (selectedDropdown == "language1") {
            setLanguage1(item);
        }
        else if (selectedDropdown == "language2") {
            setLanguage2(item);
        }
        else if (selectedDropdown == "language3") {
            setLanguage3(item);
        }
        else if (selectedDropdown == "language4") {
            setLanguage4(item);
        }
        setIsDropdownOpen(false);
    }

    let submitRenewal = async () => {
        const uid = auth().currentUser.uid;
        let userData = {
            username: username,
            password: password,
            uid: uid,
            licenseID: licenseID
        }
        let changingAddress = changingContactInfo;
        let renewingInactive = renewingInactive;
        let applicationQuestionData = {
            disciplinedOrConvicted: disciplined || convictedOfCrime,
            servedMilitary: servedMilitary,
            expertPracticeFacilitator: expertPracticeFacilitator,
            nurseSupportGroupFacilitator: nurseSupportGroupFacilitator,
            interventionEvaluationCommitteeMember: interventionEvaluationCommitteeMember,
            ceCourseContentEvaluator: ceCourseContentEvaluator,
        }
        let convictionData = {
            status: convictedOfCrime,
            convictions: crimes,
        }
        let disciplineData = {
            status: disciplined,
            disciplinaryActions: disciplinaryActions,
        }
        let workLocation = {
            status: workLocationSurvey,
            locations: workLocationData,
        }
        let latinoTypeValue = "";
        let asianTypeValue = "";
        let pacificIslanderTypeValue = "";
        let language1Value = "";
        let language2Value = "";
        let language3Value = "";
        let language4Value = "";

        for (const option of allRenewalData.pages.healingArtSurvey.dropDowns.latinoType.options) {
            if (option.text == latinoType) {
                latinoTypeValue = option.value;
            }
        }
        for (const option of allRenewalData.pages.healingArtSurvey.dropDowns.asianType.options) {
            if (option.text == asianType) {
                asianTypeValue = option.value;
            }
        }
        for (const option of allRenewalData.pages.healingArtSurvey.dropDowns.pacificIslanderType.options) {
            if (option.text == pacificIslanderType) {
                pacificIslanderTypeValue = option.value;
            }
        }
        for (const option of allRenewalData.pages.healingArtSurvey.dropDowns.language.options) {
            if (option.text == language1) {
                language1Value = option.value;
            }
            if (option.text == language2) {
                language2Value = option.value;
            }
            if (option.text == language3) {
                language3Value = option.value;
            }
            if (option.text == language4) {
                language4Value = option.value;
            }
        }

        let healingArtSurveyData = {
            status: healingArtsSurvey,
            persuingCredentials: persuingCredentials,
            nameOfCredential: nameOfCredential,
            completionYear: completionYear,
            nameOfSchool: nameOfSchool,
            addressOfSchool: addressOfSchool,

            africanAmerican: africanAmerican,
            nativeAmerican: nativeAmerican,
            white: white,
            latino: latino,
            latinoType: latinoTypeValue, // dropdown
            asian: asian,
            asianType: asianTypeValue, // dropdown
            pacificIslander: pacificIslander,
            pacificIslanderType: pacificIslanderTypeValue, // dropdown
            noneOfTheAbove: noneOfTheAbove,
            declineToState: declineToState,
            fluentInOtherLanguages: fluentInOtherLanguages,
            language1: language1Value, // dropdown
            language2: language2Value, // dropdown
            language3: language3Value, // dropdown
            language4: language4Value, // dropdown
        }
        const response = await fetch('https://us-central1-cetracker-2de23.cloudfunctions.net/renewLicense', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userData: userData,
                changingAddress: changingAddress,
                renewingInactive: renewingInactive,
                applicationQuestionData: applicationQuestionData,
                convictionData: convictionData,
                disciplineData: disciplineData,
                workLocation: workLocation,
                healingArtSurveyData: healingArtSurveyData,
            })
        })
        console.log(response);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({

        backgroundView: {
            width: screenWidth,
            backgroundColor: 'white',
            justifyContent: 'center',
            flex: 1,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        },
        flexRowContainer: {
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginTop: 6 * rem,
            marginBottom: 12 * rem,
        },

        title: {
            color: colors.green600,
            fontSize: 28 * rem,
            textAlign: 'center',
            marginBottom: 20 * rem,
        },
        bodyText: {
            fontSize: 17 * rem,
            textAlign: 'center',
            marginBottom: 12 * rem,
        },
        greyText: {
            fontSize: 17 * rem,
            textAlign: 'center',
            color: colors.grey500,
            marginBottom: 14 * rem,
        },

        textInput: {
            height: 50 * rem,
            width: '100%',
            fontSize: 16 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
            color: colors.grey900,
            marginBottom: 6 * rem,
        },

        roundButton: {
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
            minWidth: 120 * rem,
            marginTop: 18 * rem,
            // marginBottom: 6 * rem,

            shadowColor: "green",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,

            elevation: 8,
        },
        roundButtonText: {
            color: "white",
            fontSize: 20 * rem,
            fontWeight: '500',
        },

        deleteButton: {
            alignSelf: 'center',
            margin: 6 * rem,
            marginLeft: 0,
        },

        crimesContainer: {
            flexDirection: 'column',
            flexGrow: 1,
        },

        switchText: {
            marginTop: 3 * rem,
            lineHeight: 27 * rem,
            width: '80%',
            fontSize: 17 * rem,
            marginBottom: 3 * rem,
            color: colors.grey800,
        },

        dropdownButton: {
            marginTop: 2 * rem,
            marginBottom: 2 * rem,
            borderRadius: 8 * rem,
            backgroundColor: 'white',
            borderColor: colors.grey500,
            borderWidth: 2 * rem,
        },
        dropdownText: {
            justifyContent: 'space-between',
            lineHeight: 40 * rem,
            fontSize: 16 * rem,
            marginLeft: 8 * rem,
            paddingBottom: 2 * rem,
        },
        dropdownIcon: {
            position: 'absolute',
            top: 0,
            right: 0,
            height: 40 * rem,
            marginTop: 8 * rem,
            marginRight: 6 * rem,
        },
        modalTransparency: {
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0, 0.40)',
            height: '100%',
            width: '100%',
        },

        // Dropdown menu and option styling
        dropdownContainer: {
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

        questionText: {
            marginTop: 24 * rem,
            fontSize: 17 * rem,
            textAlign: 'left',
            marginBottom: 12 * rem,
            width: '100%',
            color: colors.grey900,
        },
        heading: {
            marginTop: 24 * rem,
            fontSize: 19 * rem,
            marginBottom: 12 * rem,
            fontWeight: "500",
        }
    });

    return (
        <ScrollView
            ref={ref => this.scrollView = ref}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={true}
            onScroll={this.handleScroll}
        >
            {/* Intro page */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Congratulations!</Text>
                <Text style={styles.bodyText}>Your license is ready for renewal. We'll need some information about you to properly submit. These questions are taken directly from BreeZe's renewal process.</Text>
                <TouchableOpacity style={styles.roundButton}
                    onPress={nextPage}>
                    <Text style={styles.roundButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* Username & Password */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Login Info</Text>
                <Text style={styles.bodyText}>What is your BreeZe username and password?</Text>
                <Text style={styles.greyText}>Note: This is only used once and is not stored at any point</Text>
                <TextInput
                    placeholder={'Username'}
                    placeholderTextColor={colors.grey400}
                    style={styles.textInput}
                    onChangeText={setUsername}

                />
                <TextInput
                    placeholder={'Password'}
                    placeholderTextColor={colors.grey400}
                    style={styles.textInput}
                    onChangeText={setPassword}

                />
                <TouchableOpacity style={styles.roundButton}
                    onPress={nextPage}>
                    <Text style={styles.roundButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* Contact Info */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Contact Info</Text>
                <Text style={styles.bodyText}>Do you need to change your contact info on BreeZe's record?</Text>
                {changingContactInfo == false &&
                    <View style={styles.flexRowContainer}>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={() => { setChangingContactInfo("Yes") }}>
                            <Text style={styles.roundButtonText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={nextPage}>
                            <Text style={styles.roundButtonText}>No</Text>
                        </TouchableOpacity>
                    </View>
                }
                {changingContactInfo == "Yes" &&
                    <ScrollView style={{ marginTop: 12 * rem, marginBottom: 60 * rem }}>
                        <TextInput
                            placeholder={'Address line 1'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setLine1}

                        />
                        <TextInput
                            placeholder={'Address line 2'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setLine2}

                        />
                        <TextInput
                            placeholder={'Address line 3'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setLine3}

                        />
                        <TextInput
                            placeholder={'City'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setCity}

                        />
                        <TextInput
                            placeholder={'State'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setState}

                        />
                        <TextInput
                            placeholder={'Country'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setCountry}

                        />
                        <TextInput
                            placeholder={'County'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setCounty}
                        />
                        <TextInput
                            placeholder={'Zip'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setZip}
                            keyboardType={'numeric'}
                        />
                        <TextInput
                            placeholder={'Phone number'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setPhoneNum}
                        />
                        <TextInput
                            placeholder={'Alternative phone number'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setAltPhone}
                        />
                        <TouchableOpacity style={styles.roundButton}
                            onPress={() => { nextPage }}>
                            <Text style={styles.roundButtonText}>Continue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={() => { setChangingContactInfo(false) }}>
                            <Text style={styles.roundButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>}
            </View>

            {/* Renewing Inactive */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Renewing Inactive</Text>
                <Text style={styles.bodyText}>Are you renewing inactive?</Text>
                {/* TODO */}
                <Text style={styles.greyText}>ADD RENEWING INACTIVE EXPLANATION HERE</Text>
                <View style={styles.flexRowContainer}>
                    <TouchableOpacity style={styles.roundButton}
                        onPress={() => { setRenewingInactive(true); nextPage(); }}>
                        <Text style={styles.roundButtonText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton}
                        onPress={nextPage}>
                        <Text style={styles.roundButtonText}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Convicted Crime */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Crime Convictions</Text>
                {!convictedOfCrime && <Text style={styles.bodyText}>Have you been convicted of a crime since your last renewal?</Text>}
                {!convictedOfCrime &&
                    <View style={styles.flexRowContainer}>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={() => { setConvictedOfCrime(true) }}>
                            <Text style={styles.roundButtonText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={nextPage}>
                            <Text style={styles.roundButtonText}>No</Text>
                        </TouchableOpacity>
                    </View>
                }
                {convictedOfCrime &&
                    <ScrollView style={{ marginBottom: 60 * rem, paddingBottom: 48 * rem }}>
                        <Text style={styles.bodyText}>For each crime, please fill out some details.</Text>
                        {crimes.length > 0 &&
                            <View style={styles.crimesContainer}>
                                <FlatList
                                    keyExtractor={item => item.key}
                                    data={crimes}
                                    extraData={crimes}
                                    renderItem={({ item, index }) => (
                                        <View >
                                            <TextInput
                                                placeholder={'Location. City, county, state, and country'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.hours}
                                                style={styles.textInput}
                                                onChangeText={text => { handleCrimeInput(text, index, "location") }}
                                            />
                                            <TextInputMask
                                                style={styles.textInput}
                                                keyboardType={'numeric'}
                                                placeholder={'MM/DD/YYYY'}
                                                placeholderTextColor={colors.grey400}
                                                type={'datetime'}
                                                value={item.date}
                                                options={{
                                                    format: 'MM/DD/YYYY'
                                                }}
                                                onChangeText={text => {
                                                    handleCrimeInput(text, index, "date");
                                                }}
                                            />
                                            <TextInput
                                                placeholder={'Court case number'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.courseCaseNum}
                                                style={styles.textInput}
                                                onChangeText={text => { handleCrimeInput(text, index, "courtCaseNum") }}
                                            />
                                            <TextInput
                                                placeholder={'Charges'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.charges}
                                                style={styles.textInput}
                                                onChangeText={text => { handleCrimeInput(text, index, "charges") }}
                                            />
                                            <TextInput
                                                placeholder={'Additional info'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.additionalInfo}
                                                style={styles.textInput}
                                                onChangeText={text => { handleCrimeInput(text, index, "additionalInfo") }}
                                            />
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    let temp = [...crimes];
                                                    temp.splice(index, 1);
                                                    setCrimes(temp)
                                                }}
                                            >
                                                <AntDesign
                                                    name='closecircle'
                                                    size={36 * rem}
                                                    color={colors.blue800}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        }
                        <TouchableOpacity style={styles.roundButton}
                            onPress={addCrime}>
                            <Text style={styles.roundButtonText}>Add another crime</Text>
                        </TouchableOpacity>
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setConvictedOfCrime(false) }}>
                                <Text style={styles.roundButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={nextPage}>
                                <Text style={styles.roundButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                }
            </View>

            {/* Disciplinary Actions */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Disciplinary Actions</Text>
                {!disciplined && <Text style={styles.bodyText}>Have you been disciplined by a government agency or other disciplinary body since your last renewal?</Text>}
                {!disciplined &&
                    <View style={styles.flexRowContainer}>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={() => { setDisciplined(true) }}>
                            <Text style={styles.roundButtonText}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton}
                            onPress={nextPage}>
                            <Text style={styles.roundButtonText}>No</Text>
                        </TouchableOpacity>
                    </View>
                }
                {disciplined &&
                    <ScrollView style={{ marginBottom: 60 * rem, paddingBottom: 48 * rem }}>
                        <Text style={styles.bodyText}>For each disciplinary action, please fill out some details.</Text>
                        {disciplinaryActions.length > 0 &&
                            <View style={styles.crimesContainer}>
                                <FlatList
                                    keyExtractor={item => item.key}
                                    data={disciplinaryActions}
                                    extraData={disciplinaryActions}
                                    renderItem={({ item, index }) => (
                                        <View >
                                            <TextInput
                                                placeholder={'License'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.license}
                                                style={styles.textInput}
                                                onChangeText={text => { handleDisciplinaryActionInput(text, index, "license") }}
                                            />
                                            <TextInput
                                                placeholder={'License number'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.licenseNum}
                                                style={styles.textInput}
                                                onChangeText={text => { handleDisciplinaryActionInput(text, index, "licenseNum") }}
                                            />
                                            <TextInput
                                                placeholder={'State Issued'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.stateIssued}
                                                style={styles.textInput}
                                                onChangeText={text => { handleDisciplinaryActionInput(text, index, "stateIssued") }}
                                            />
                                            <TextInputMask
                                                style={styles.textInput}
                                                keyboardType={'numeric'}
                                                placeholder={'MM/DD/YYYY'}
                                                placeholderTextColor={colors.grey400}
                                                type={'datetime'}
                                                value={item.date}
                                                options={{
                                                    format: 'MM/DD/YYYY'
                                                }}
                                                onChangeText={text => {
                                                    handleDisciplinaryActionInput(text, index, "date");
                                                }}
                                            />
                                            <TextInput
                                                placeholder={'Case number'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.caseNum}
                                                style={styles.textInput}
                                                onChangeText={text => { handleDisciplinaryActionInput(text, index, "caseNum") }}
                                            />
                                            <TextInput
                                                placeholder={'Additional info'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.additionalInfo}
                                                style={styles.textInput}
                                                onChangeText={text => { handleDisciplinaryActionInput(text, index, "additionalInfo") }}
                                            />
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    let temp = [...crimes];
                                                    temp.splice(index, 1);
                                                    setDisciplinaryActions(temp)
                                                }}
                                            >
                                                <AntDesign
                                                    name='closecircle'
                                                    size={36 * rem}
                                                    color={colors.blue800}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        }
                        <TouchableOpacity style={styles.roundButton}
                            onPress={addDisciplinaryAction}>
                            <Text style={styles.roundButtonText}>Add disciplinary action</Text>
                        </TouchableOpacity>
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setDisciplined(false) }}>
                                <Text style={styles.roundButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={nextPage}>
                                <Text style={styles.roundButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                }
            </View>

            {/* Renewing Inactive */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>General Questions</Text>
                <View style={styles.flexRowContainer}>
                    <Text style={styles.switchText}>Have you served in the military at any point?</Text>
                    <Switch
                        trackColor={{ false: colors.green900, true: colors.green600 }}
                        thumbColor={servedMilitary ? colors.blue800 : colors.grey500}
                        ios_backgroundColor="colors.green600"
                        onValueChange={toggleMilitary}
                        value={servedMilitary}
                    />
                </View>
                <View style={styles.flexRowContainer}>
                    <Text style={styles.switchText}>Are you interested in becoming an expert practice facilitator?</Text>
                    <Switch
                        trackColor={{ false: colors.green900, true: colors.green600 }}
                        thumbColor={expertPracticeFacilitator ? colors.green900 : colors.grey500}
                        ios_backgroundColor="colors.green600"
                        onValueChange={toggleExpertPracticeFacilitator}
                        value={expertPracticeFacilitator}
                    />
                </View>
                <View style={styles.flexRowContainer}>
                    <Text style={styles.switchText}>Are you interested in becoming a nurse support group facilitator?</Text>
                    <Switch
                        trackColor={{ false: colors.green900, true: colors.green600 }}
                        thumbColor={nurseSupportGroupFacilitator ? colors.green900 : colors.grey500}
                        ios_backgroundColor="colors.green600"
                        onValueChange={toggleNurseSupportGroupFacilitator}
                        value={nurseSupportGroupFacilitator}
                    />
                </View>
                <View style={styles.flexRowContainer}>
                    <Text style={styles.switchText}>Are you interested in becoming an intervention evaluation committee member?</Text>
                    <Switch
                        trackColor={{ false: colors.green900, true: colors.green600 }}
                        thumbColor={interventionEvaluationCommitteeMember ? colors.green900 : colors.grey500}
                        ios_backgroundColor="colors.green600"
                        onValueChange={toggleInterventionEvaluationCommitteeMember}
                        value={interventionEvaluationCommitteeMember}
                    />
                </View>
                <View style={styles.flexRowContainer}>
                    <Text style={styles.switchText}>Are you interested becoming a CE course content evaluator?</Text>
                    <Switch
                        trackColor={{ false: colors.green900, true: colors.green600 }}
                        thumbColor={ceCourseContentEvaluator ? colors.green900 : colors.grey500}
                        ios_backgroundColor="colors.green600"
                        onValueChange={toggleCECourseContentEvaluator}
                        value={ceCourseContentEvaluator}
                    />
                </View>
                <TouchableOpacity style={styles.roundButton}
                    onPress={nextPage}>
                    <Text style={styles.roundButtonText}>Continue</Text>
                </TouchableOpacity>
            </View>

            {/* Work Location */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Work Location Survey (Optional)</Text>

                {!workLocationSurvey &&
                    <>
                        <Text style={styles.bodyText}>Would you like to answer an optional survey relating to your work?</Text>
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setWorkLocationSurvey(true) }}>
                                <Text style={styles.roundButtonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={nextPage}>
                                <Text style={styles.roundButtonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }

                {workLocationSurvey &&
                    <ScrollView style={{ marginBottom: 60 * rem, paddingBottom: 48 * rem }}>
                        <Text style={styles.bodyText}>For each work location, please fill out some details.</Text>
                        {workLocationData.length > 0 &&
                            <View style={styles.crimesContainer}>
                                <FlatList
                                    keyExtractor={item => item.key}
                                    data={workLocationData}
                                    extraData={workLocationData}
                                    renderItem={({ item, index }) => (
                                        <View >
                                            <Text style={styles.heading}>Work Location #{index + 1}</Text>
                                            <TextInput
                                                placeholder={'Years Employed Here'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.years}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "years") }}
                                            />
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Self employed?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].selfEmployed ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "selfEmployed") }}
                                                    value={workLocationData[index].selfEmployed}
                                                />
                                            </View>
                                            <TextInput
                                                placeholder={'County'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.county}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "county") }}
                                            />
                                            <TextInput
                                                placeholder={'Zip'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.zip}
                                                keyboardType={'numeric'}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "zip") }}
                                            />
                                            <TextInput
                                                placeholder={'Health Occupation'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.healthOccupation}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "healthOccupation") }}
                                            />
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.questionText}>Work hours per week:</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.dropdownButton}
                                                onPress={() => { setIsDropdownOpen(true) }}
                                            >
                                                <Text style={styles.dropdownText}>{workLocationData[index].workHours ? workLocationData[index].workHours : "Work Hours"}
                                                </Text>
                                                <AntDesign
                                                    name='down'
                                                    size={26 * rem}
                                                    color={colors.grey500}
                                                    style={styles.dropdownIcon}
                                                />
                                            </TouchableOpacity>
                                            <Modal visible={isDropdownOpen}
                                                animationType='slide'
                                                transparent={true}
                                            >
                                                <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
                                                    <View style={styles.modalTransparency} />
                                                </TouchableWithoutFeedback>
                                                <View style={styles.dropdownContainer}>
                                                    <FlatList
                                                        style={{ marginTop: 0, marginBottom: 32 * rem, }}
                                                        data={dropdownOptions}
                                                        keyExtractor={item => item}
                                                        renderItem={({ item }) => (
                                                            <TouchableOpacity
                                                                onPress={() => { handleDropdownOptionPressed(item, index, "workHours") }}
                                                                style={styles.optionContainer}>
                                                                <Text style={styles.optionText}>{item}</Text>
                                                            </TouchableOpacity>
                                                        )}>
                                                    </FlatList>
                                                </View>
                                            </Modal>

                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.questionText}>Would you describe your workplace as: </Text>
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Acute care?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].acuteCare ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "acuteCare") }}
                                                    value={workLocationData[index].acuteCare}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Home care/Durable medical equipment?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].homeCare ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "homeCare") }}
                                                    value={workLocationData[index].homeCare}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Long-term acute care?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].longTermAcuteCare ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "longTermAcuteCare") }}
                                                    value={workLocationData[index].longTermAcuteCare}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Skilled nursing facility?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].skilledNursingFacility ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "skilledNursingFacility") }}
                                                    value={workLocationData[index].skilledNursingFacility}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Accredited education program?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].accreditedEducationProgram ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "accreditedEducationProgram") }}
                                                    value={workLocationData[index].accreditedEducationProgram}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Manufacturer/Distributer?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].manufacturer ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "manufacturer") }}
                                                    value={workLocationData[index].manufacturer}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Outpatient?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].outpatient ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "outpatient") }}
                                                    value={workLocationData[index].outpatient}
                                                />
                                            </View>
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.switchText}>Clinic?</Text>
                                                <Switch
                                                    trackColor={{ false: colors.green900, true: colors.green600 }}
                                                    thumbColor={workLocationData[index].clinic ? colors.green900 : colors.grey500}
                                                    ios_backgroundColor="colors.green600"
                                                    onValueChange={value => { handleWorkLocationDataInput(value, index, "clinic") }}
                                                    value={workLocationData[index].clinic}
                                                />
                                            </View>
                                            <TextInput
                                                placeholder={'Other?'}
                                                placeholderTextColor={colors.grey400}
                                                value={item.other}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "other") }}
                                            />
                                            <View style={styles.flexRowContainer}>
                                                <Text style={styles.questionText}>Please estimate what percent of your work falls into each category:</Text>
                                            </View>
                                            <TextInput
                                                placeholder={'Percent patient care'}
                                                placeholderTextColor={colors.grey400}
                                                keyboardType={'numeric'}
                                                value={item.percentPatientCare}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "percentPatientCare", true) }}
                                            />
                                            <TextInput
                                                placeholder={'Percent research'}
                                                placeholderTextColor={colors.grey400}
                                                keyboardType={'numeric'}
                                                value={item.percentResearch}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "percentResearch", true) }}
                                            />
                                            <TextInput
                                                placeholder={'Percent teaching'}
                                                placeholderTextColor={colors.grey400}
                                                keyboardType={'numeric'}
                                                value={item.percentTeaching}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "percentTeaching", true) }}
                                            />
                                            <TextInput
                                                placeholder={'Percent administration'}
                                                placeholderTextColor={colors.grey400}
                                                keyboardType={'numeric'}
                                                value={item.percentAdministration}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "percentAdministration", true) }}
                                            />
                                            <TextInput
                                                placeholder={'Percent other'}
                                                placeholderTextColor={colors.grey400}
                                                keyboardType={'numeric'}
                                                value={item.percentOther}
                                                style={styles.textInput}
                                                onChangeText={text => { handleWorkLocationDataInput(text, index, "percentOther", true) }}
                                            />
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => {
                                                    let temp = [...workLocationData];
                                                    temp.splice(index, 1);
                                                    setWorkLocationData(temp)
                                                }}
                                            >
                                                <AntDesign
                                                    name='closecircle'
                                                    size={36 * rem}
                                                    color={colors.blue800}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        }
                        <TouchableOpacity style={styles.roundButton}
                            onPress={addWorkLocation}>
                            <Text style={styles.roundButtonText}>Add another work location</Text>
                        </TouchableOpacity>
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setWorkLocationSurvey(false) }}>
                                <Text style={styles.roundButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={nextPage}>
                                <Text style={styles.roundButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                }
            </View>

            {/* Healing Arts Survey */}
            <View style={styles.backgroundView}>
                <Modal visible={isDropdownOpen}
                    animationType='slide'
                    transparent={true}
                >
                    <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
                        <View style={styles.modalTransparency} />
                    </TouchableWithoutFeedback>
                    <View style={styles.dropdownContainer}>
                        <FlatList
                            style={{ marginTop: 0, marginBottom: 32 * rem, }}
                            data={dropdownOptions}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { handleModalOptionInput(item) }}
                                    style={styles.optionContainer}>
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            )}>
                        </FlatList>
                    </View>
                </Modal>
                <Text style={styles.title}>Healing Arts Survey (Optional)</Text>
                {!healingArtsSurvey &&
                    <>
                        <Text style={styles.bodyText}>Would you like to answer an optional survey related to your profession?</Text>
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setHealingArtsSurvey(true) }}>
                                <Text style={styles.roundButtonText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={nextPage}>
                                <Text style={styles.roundButtonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                {healingArtsSurvey &&
                    <ScrollView style={{ marginBottom: 60 * rem, paddingBottom: 48 * rem }}>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Are you currently pursuing credentials or certifications?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={persuingCredentials ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={togglePersuingCredentials}
                                value={persuingCredentials}
                            />
                        </View>
                        <TextInput
                            placeholder={'Name of Credential'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setNameOfCredential}
                        />
                        <TextInput
                            placeholder={'Year of completion (YYYY)'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            keyboardType={'numeric'}
                            onChangeText={setCompletionYear}
                        />
                        <TextInput
                            placeholder={'Name of School'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setNameOfSchool}
                        />
                        <TextInput
                            placeholder={'Address of School'}
                            placeholderTextColor={colors.grey400}
                            style={styles.textInput}
                            onChangeText={setAddressOfSchool}
                        />

                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as African American?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={africanAmerican ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleAfricanAmerican}
                                value={africanAmerican}
                            />
                        </View>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as American Indian/Native American/Alaskan Native?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={nativeAmerican ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleNativeAmerican}
                                value={nativeAmerican}
                            />
                        </View>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as Caucasian/White European/Middle Eastern?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={white ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleWhite}
                                value={white}
                            />
                        </View>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as Latino/Hispanic?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={latino ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleLatino}
                                value={latino}
                            />
                        </View>
                        {latino &&
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => { setDropdownOptions(latinoTypeOptions); setIsDropdownOpen(true); }}
                            >
                                <Text style={styles.dropdownText}>{latinoType ? latinoType : "Type"}
                                </Text>
                                <AntDesign
                                    name='down'
                                    size={26 * rem}
                                    color={colors.grey500}
                                    style={styles.dropdownIcon}
                                />
                            </TouchableOpacity>
                        }
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as Asian?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={asian ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleAsian}
                                value={asian}
                            />
                        </View>
                        {asian &&
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => { setDropdownOptions(asianTypeOptions); setIsDropdownOpen(true); }}
                            >
                                <Text style={styles.dropdownText}>{asianType ? asianType : "Type"}
                                </Text>
                                <AntDesign
                                    name='down'
                                    size={26 * rem}
                                    color={colors.grey500}
                                    style={styles.dropdownIcon}
                                />
                            </TouchableOpacity>
                        }
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as Native Hawaiian/Pacific Islander?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={pacificIslander ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={togglePacificIslander}
                                value={pacificIslander}
                            />
                        </View>
                        {pacificIslander &&
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => { setDropdownOptions(pacificIslanderTypeOptions); setIsDropdownOpen(true); }}
                            >
                                <Text style={styles.dropdownText}>{pacificIslanderType ? pacificIslanderType : "Type"}
                                </Text>
                                <AntDesign
                                    name='down'
                                    size={26 * rem}
                                    color={colors.grey500}
                                    style={styles.dropdownIcon}
                                />
                            </TouchableOpacity>
                        }
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Do you identify as none of the above?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={noneOfTheAbove ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleNoneOfTheAbove}
                                value={noneOfTheAbove}
                            />
                        </View>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Prefer not to answer?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={declineToState ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleDeclineToState}
                                value={declineToState}
                            />
                        </View>
                        <View style={styles.flexRowContainer}>
                            <Text style={styles.switchText}>Fluent in other languages?</Text>
                            <Switch
                                trackColor={{ false: colors.green900, true: colors.green600 }}
                                thumbColor={fluentInOtherLanguages ? colors.blue800 : colors.grey500}
                                ios_backgroundColor="colors.green600"
                                onValueChange={toggleFluentInOtherLanguages}
                                value={fluentInOtherLanguages}
                            />
                        </View>
                        {fluentInOtherLanguages &&
                            <>
                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => { setDropdownOptions(languageOptions); setSelectedDropdown("language1"); setIsDropdownOpen(true); }}
                                >
                                    <Text style={styles.dropdownText}>{language1 ? language1 : "Language 1"}
                                    </Text>
                                    <AntDesign
                                        name='down'
                                        size={26 * rem}
                                        color={colors.grey500}
                                        style={styles.dropdownIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => { setDropdownOptions(languageOptions); setSelectedDropdown("language2"); setIsDropdownOpen(true); }}
                                >
                                    <Text style={styles.dropdownText}>{language2 ? language2 : "Language 2"}
                                    </Text>
                                    <AntDesign
                                        name='down'
                                        size={26 * rem}
                                        color={colors.grey500}
                                        style={styles.dropdownIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => { setDropdownOptions(languageOptions); setSelectedDropdown("language3"); setIsDropdownOpen(true); }}
                                >
                                    <Text style={styles.dropdownText}>{language3 ? language3 : "Language 3"}
                                    </Text>
                                    <AntDesign
                                        name='down'
                                        size={26 * rem}
                                        color={colors.grey500}
                                        style={styles.dropdownIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.dropdownButton}
                                    onPress={() => { setDropdownOptions(languageOptions); setSelectedDropdown("language4"); setIsDropdownOpen(true); }}
                                >
                                    <Text style={styles.dropdownText}>{language4 ? language4 : "Language 4"}
                                    </Text>
                                    <AntDesign
                                        name='down'
                                        size={26 * rem}
                                        color={colors.grey500}
                                        style={styles.dropdownIcon}
                                    />
                                </TouchableOpacity>
                            </>
                        }
                        <View style={styles.flexRowContainer}>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { setHealingArtsSurvey(false) }}>
                                <Text style={styles.roundButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton}
                                onPress={() => { nextPage }}>
                                <Text style={styles.roundButtonText}>Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>}
            </View>

            {/* Summary page */}
            <View style={styles.backgroundView}>
                <Text style={styles.title}>Summary Page</Text>
                <View style={styles.flexRowContainer}>
                    <TouchableOpacity style={styles.roundButton}
                        onPress={() => { submitRenewal() }}>
                        <Text style={styles.roundButtonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton}
                        onPress={() => { navigation.navigate("Homepage") }}>
                        <Text style={styles.roundButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
