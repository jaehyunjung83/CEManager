import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCertifications } from '../actions';
import { Animated, View, Text, StyleSheet, Dimensions, TouchableHighlight, Easing, ScrollView, Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity, TextInput, KeyboardAvoidingView, Image } from 'react-native';
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
// TODO: Delete pic and thumbnail if adding certification is cancelled.
export default function editCertification(props) {
    certificationID = props.route.params.certificationID;

    const headerHeight = useHeaderHeight();
    const route = useRoute();
    const certifications = useSelector(state => state.certifications);
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (!certifications[certificationID]) return;
        setName(certifications[certificationID].name);
        setExpiration(certifications[certificationID].expiration);
        for (const index in certifications[certificationID].requirements) {
            if (certifications[certificationID].requirements[index].name == "Total CEs Needed") {
                setCEHoursRequired(certifications[certificationID].requirements[index].hours);
            }
        }
        if (certifications[certificationID].requirements.length) {
            setRequirements(certifications[certificationID].requirements.filter(requirement => requirement.name !== "Total CEs Needed"));
        }
        setCertificationThumbnail(certifications[certificationID].thumbnail);
        setCertificationPhoto(certifications[certificationID].photo);
    }, [JSON.stringify(certifications)]);

    const [name, setName] = useState("");
    const [nameErrorMsg, setNameErrorMsg] = useState("");
    const [expiration, setExpiration] = useState("");
    const [expirationErrorMsg, setCertExpirationErrorMsg] = useState("");

    const [ceHoursRequired, setCEHoursRequired] = useState('');
    const [requirements, setRequirements] = useState([]);
    const [thumbnail, setCertificationThumbnail] = useState("");
    const [photo, setCertificationPhoto] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    let addNewRequirement = () => {
        const key = uuidv4();
        let newRequirement = {
            key: key,
            hours: '',
            name: '',
            linkedCEs: {},
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

    let editCertification = () => {
        setIsLoading(true);
        if (isFormComplete()) {
            let requirementsCopy = [...requirements];
            let totalHoursRequirementAdded = false;
            let totalHoursRequirement = {};

            for (const index in requirementsCopy) {
                if (requirementsCopy[index].name == "Total CEs Needed") {
                    totalHoursRequirementAdded = true;
                }
            }
            if (!totalHoursRequirementAdded) {
                let found = false;
                for (const index in certifications[certificationID].requirements) {
                    if (certifications[certificationID].requirements[index].name == "Total CEs Needed") {
                        found = true;

                        if (!isNaN(Number(ceHoursRequired)) && Number(ceHoursRequired) > 0) {
                            totalHoursRequirement = certifications[certificationID].requirements[index];
                            totalHoursRequirement.hours = ceHoursRequired;
                            requirementsCopy.push(totalHoursRequirement);
                        }
                    }
                }
                if (!found && !isNaN(Number(ceHoursRequired)) && Number(ceHoursRequired) > 0) {
                    requirementsCopy.push({
                        key: uuidv4(),
                        hours: ceHoursRequired,
                        name: "Total CEs Needed",
                        linkedCEs: {},
                    })
                }
            }

            certificationData = {
                name: name,
                expiration: expiration,
                photo: photo,
                thumbnail: thumbnail,
                requirements: requirementsCopy,
                id: certificationID,
            }
            let certificationObj = {
                [certificationID]: certificationData,
            }

            let uid = auth().currentUser.uid;
            let db = firestore();
            db.collection('users').doc(uid).collection('certifications').doc('certificationData').set(certificationObj, { merge: true })
                .then(() => {
                    console.log("Document successfully written!");
                    db.collection('users').doc(uid).collection('certifications').doc('certificationData').get()
                        .then(response => {
                            dispatch(updateCertifications(response.data()));
                        })
                    props.navigation.navigate("Homepage");
                })
                .catch((error) => {
                    console.error("Error adding document: ", error);
                    props.navigation.navigate("Homepage");
                });
        }
    }

    // Checks for certification type, other certification type (if Other is selected), state, and expiration of certification.
    let isFormComplete = () => {
        let isComplete = true;
        if (!name) {
            isComplete = false;
            setNameErrorMsg("Enter certification name");
            this.scrollView.scrollTo({ y: 0 });
        }
        else {
            setNameErrorMsg("");
        }

        if (expiration.length !== 10) {
            isComplete = false;
            setCertExpirationErrorMsg("Format: (MM/DD/YYYY)");
            this.scrollView.scrollTo({ y: 0 });
        }
        else if (parseInt(expiration.substring(0, 2)) === 0 || parseInt(expiration.substring(0, 2)) > 12) {
            isComplete = false;
            setCertExpirationErrorMsg("Month: 1-12");
            this.scrollView.scrollTo({ y: 0 });
        }
        else if (parseInt(expiration.substring(3, 5)) === 0 || parseInt(expiration.substring(3, 5)) > 31) {
            isComplete = false;
            setCertExpirationErrorMsg("Days: 1-31");
            this.scrollView.scrollTo({ y: 0 });
        }
        else {
            setCertExpirationErrorMsg("");
        }
        if (!isComplete) {
            setIsLoading(false);
        }
        return isComplete;
    }

    React.useEffect(() => {
        if (typeof props.route?.params?.thumbnailURL !== 'undefined') {
            if (thumbnail) {
                // User is replacing old thumbnail. Delete old one.
                // Firebase couldn't parse the URL for some reason.
                // const oldThumbnailRef = storage().refFromURL(thumbnail);
                const oldThumbnailPath = thumbnail.replace('https://storage.googleapis.com/cetracker-2de23.appspot.com/', '');
                const oldThumbnailRef = storage().ref().child(`${oldThumbnailPath}`);

                oldThumbnailRef.delete()
                    .then(() => {
                        console.log("Deleted thumbnail successfully.");
                        setCertificationThumbnail(props.route?.params?.thumbnailURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old thumbnail. Error: " + error.toString());
                    })
            }
            else {
                setCertificationThumbnail(props.route?.params?.thumbnailURL);
            }
        }
        if (typeof props.route.params?.photoURL !== 'undefined') {
            if (photo) {
                // User is replacing old photo. Delete old one.
                const firstPhotoRef = storage().refFromURL(photo).toString();
                const oldPhotoPath = firstPhotoRef.replace('gs://cetracker-2de23', '');
                const oldPhotoRef = storage().ref().child(`${oldPhotoPath}`);
                oldPhotoRef.delete()
                    .then(() => {
                        console.log("Deleted photo successfully.");
                        setCertificationPhoto(props.route?.params?.photoURL);
                    })
                    .catch(error => {
                        console.log("Failed to delete old photo. Error: " + error.toString());
                    })
            }
            else {
                setCertificationPhoto(props.route?.params?.photoURL);
            }
        }
    }, [props.route.params?.thumbnailURL]);

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
        certificationButtonNotSelected: {
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
        certificationButtonSelected: {
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

        // Certification Form
        headerContainer: {
            width: '100%',
            height: 40 * rem,
            marginBottom: 18 * rem,
            zIndex: -1,
        },
        certificationInfoContainer: {
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
        selectName: {
            width: '100%',
            height: 50 * rem,
            backgroundColor: colors.grey200,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18 * rem,
            borderRadius: 10 * rem,
        },
        selectNameText: {
            fontSize: 16 * rem,
            color: colors.grey900,
            textAlign: 'left',
        },
        modalTransparency: {
            backgroundColor: 'rgba(0,0,0, 0.50)',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            position: 'absolute',
        },
        modalPopupContainer: {
            flexShrink: 1,
            backgroundColor: 'white',
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
        otherName: {
            height: 50 * rem,
            width: '100%',
        },
        stateAndCertificationNumContainer: {
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
        certificationNumContainer: {
            height: 50 * rem,
            width: '48%',
        },
        certificationNumInput: {
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
        addNewCertificationButton: {
            width: '100%',
            height: 50 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.blue800,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24 * rem,
        },
    });


    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={headerHeight}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.requirementContainer}
        >
            <ScrollView
                ref={ref => this.scrollView = ref}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps={'always'}>
                <FadeInView style={styles.formContainer}>
                    <View style={styles.headerContainer}>
                        <Header text="Certification Information" />
                    </View>
                    <View style={styles.certificationInfoContainer}>
                        <View style={styles.flexRowContainer}>
                            <View style={styles.otherName}>
                                <Text style={styles.inputLabel}>Certification Name {nameErrorMsg ? (<Text style={styles.errorMessage}> {nameErrorMsg}</Text>) : (null)}</Text>
                                <TextInput
                                    placeholder={'e.g. Physician'}
                                    placeholderTextColor={colors.grey400}
                                    style={styles.certificationNumInput}
                                    onChangeText={setName}
                                    maxLength={36}
                                    value={name}
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
                                    value={expiration}
                                    options={{
                                        format: 'MM/DD/YYYY'
                                    }}
                                    onChangeText={text => {
                                        setExpiration(text);
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.thumbnailContainer}>
                            <Text style={styles.inputLabel}>Certification Photo (optional)</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    props.navigation.navigate('Scanner', {
                                        fromThisScreen: route.name,
                                        initialFilterId: 1, // Color photo
                                    });
                                }}
                                style={styles.thumbnailButton}
                            >
                                {thumbnail ? (<FastImage
                                    style={{ width: 75 * rem, aspectRatio: 1, borderRadius: 10 * rem, backgroundColor: 'black' }}
                                    source={{
                                        uri: thumbnail,
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
                                    style={styles.certificationNumInput}
                                    value={ceHoursRequired}
                                    onChangeText={setCEHoursRequired}
                                    keyboardType={'numeric'}
                                    maxLength={5}
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Additional Requirements</Text>
                        <View style={styles.flexRowContainer}>
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

                        {requirements.length ? (
                            <View style={styles.requirementsContainer}>
                                <Text style={styles.hoursOptionalText}>Inputting hours is optional.</Text>
                                <FlatList
                                    keyExtractor={item => item.key}
                                    data={requirements}
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
                                                placeholder={'e.g. Bioethics'}
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
                            <Text style={styles.noRequirementsText}>Some states have special requirements for certification renewal. Click Add Requirement to add some!</Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            editCertification();
                        }}
                        disabled={isLoading}
                        style={styles.addNewCertificationButton}
                    >
                        <Text style={styles.choiceTextSelected}>{isLoading ? ('...') : ('Save')}</Text>
                    </TouchableOpacity>
                </FadeInView>
            </ScrollView >
        </KeyboardAvoidingView>
    )
}