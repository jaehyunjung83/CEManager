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
export default function addLicense({ navigation }) {

    const headerHeight = useHeaderHeight();

    measure = () => {
        this.text.measure((x, y, width, height, px, py) => {
            setPositionY(px + y - (6 * rem));
        })
    }

    scrollToCallBack = () => {
        this.scrollView.scrollTo({ y: positionY });
    }

    const [isLicenseSelected, setIsLicenseSelected] = useState(false);
    const [isCertSelected, setIsCertSelected] = useState(false);
    const [licenseType, setLicenseType] = useState("");
    const [licenseState, setLicenseState] = useState("");
    const [licenseNum, setLicenseNum] = useState("");
    const [licenseExpiration, setLicenseExpiration] = useState("");
    const [ceHoursRequired, setCEHoursRequired] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
    const [requirements, setRequirements] = useState([{ key: "", hours: "", name: "", }]);
    const [positionY, setPositionY] = useState(0);

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
        let temp = [...requirements];
        temp.push(newRequirement);
        setRequirements(temp);
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
        // TODO:
    }

    let submitToState = () => {
        // TODO:
    }

    let cardPressed = () => {
        // TODO:
    }

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
                            <Header text="License Information (required)" />
                        </View>
                        <View style={styles.licenseInfoContainer}>
                            <Text style={styles.inputLabel}>License Type (required)</Text>
                            <TouchableOpacity
                                style={styles.selectLicenseType}
                                onPress={() => setIsModalVisible(true)}
                            >
                                <Text style={styles.selectLicenseTypeText}>{licenseType ? (licenseType) : ('Select License Type')}</Text>
                            </TouchableOpacity>
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
                                        style={styles.inputLabel}>State (required)</Text>
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
                                    />
                                </View>
                            </View>

                            <View style={styles.flexRowContainer}>
                                <View style={styles.expirationContainer}>
                                    <Text style={styles.inputLabel}>Expiration (required)</Text>
                                    <TextInputMask
                                        style={styles.licenseNumInput}
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

                            <View style={styles.requirementsContainer}>
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
                                                placeholder={'Hr'}
                                                placeholderTextColor={colors.grey400}
                                                style={styles.requirementHoursInput}
                                                value={item.hours}
                                                onChangeText={text => {handleHours(text, index)}}
                                                keyboardType={'numeric'}
                                            />
                                            <TextInput
                                                placeholder={'e.g. Bioterrorism'}
                                                placeholderTextColor={colors.grey400}
                                                style={styles.requirementInput}
                                                value={item.name}
                                                onChangeText={text => {handleName(text, index)}}
                                            />
                                        </View>
                                    )}
                                />
                            </View>

                            {/* <View style={styles.requirementsContainer}>
                                <View style={styles.requirementContainer}>
                                    <TouchableOpacity style={styles.deleteButton}>
                                        <AntDesign
                                            name='closecircle'
                                            size={36 * rem}
                                            color={colors.blue800}
                                        />
                                    </TouchableOpacity>
                                    <TextInput
                                        placeholder={'Hr'}
                                        placeholderTextColor={colors.grey400}
                                        style={styles.requirementHoursInput}
                                        value={ceHoursRequired}
                                        onChangeText={setCEHoursRequired}
                                        keyboardType={'numeric'}
                                    />
                                    <TextInput
                                        placeholder={'e.g. Bioterrorism'}
                                        placeholderTextColor={colors.grey400}
                                        style={styles.requirementInput}
                                        value={ceHoursRequired}
                                        onChangeText={setCEHoursRequired}
                                    />
                                </View>
                            </View> */}


                            {/* <Modal
                            visible={isRequirementModalOpen}
                            animationType='fade'
                            transparent={true}
                            style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}
                        >
                            <TouchableWithoutFeedback onPress={() => setIsRequiremetModalOpen(false)}>
                                <View style={styles.modalTransparency} />
                            </TouchableWithoutFeedback>
                            <View style={styles.modalPopupContainer}>
                                <Text style={styles.modalTitle}>Add Subject Requirement</Text>
                            </View>
                        </Modal> */}
                        </View>
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
    },
    choiceTextSelected: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
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
        marginBottom: 24 * rem,
    },
    expirationContainer: {
        height: 50 * rem,
        minWidth: 160 * rem,
        width: '45%',
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
        alignSelf: 'center',
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
    }
});

