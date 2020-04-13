import React, { useState, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions, TouchableHighlight, Easing, ScrollView, Modal, FlatList, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import LicenseCard from '../components/licenseCard.js';
import Header from '../components/header.js';
import AutoCompleteInput from '../components/autoCompleteInput.js';
import { colors } from '../components/colors.js';

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

// TODO: Change AutoComplete flatlist to just a view. Also, change height when text input is focused so that input can be scrolled to the top. Alternatively, use another modal with the textinput at the top.
export default function addLicense({ navigation }) {

    const [isLicenseSelected, setIsLicenseSelected] = useState(false);
    const [isCertSelected, setIsCertSelected] = useState(false);
    const [licenseType, setLicenseType] = useState("");
    const [licenseState, setLicenseState] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);

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
        <ScrollView contentContainerStyle={styles.container}>
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
                            <TouchableWithoutFeedback
                                onPress={() => setIsModalVisible(false)}
                            >
                                <View
                                    style={styles.modalTransparency}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <View style={styles.licenseTypeContainer}>
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
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>

                        <Text style={styles.inputLabel}>State (required)</Text>
                        <View style={styles.stateContainer}>
                            <AutoCompleteInput
                                height={50 * rem}
                                placeholder="California"
                                maxSuggestions={3}
                                data={states}
                            />
                        </View>
                        <Text style={styles.inputLabel}>License Number (optional)</Text>
                    </View>
                </FadeInView>
            ) : (null)}
            {isCertSelected ? (
                <FadeInView style={styles.formContainer}>
                    <LicenseCard />
                </FadeInView>
            ) : (null)}
        </ScrollView>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
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
        fontWeight: '600',
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
    },
    licenseInfoContainer: {
        padding: 6 * rem,
    },
    inputLabel: {
        fontSize: 16 * rem,
        color: colors.grey800,
        fontWeight: '400',
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
        justifyContent: 'center',
    },
    licenseTypeContainer: {
        flexShrink: 1,
        minHeight: '22%',
        backgroundColor: 'white',
        width: '85%',
        maxHeight: '60%',
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
        fontSize: 16 * rem,
        color: colors.grey900,
        alignContent: 'center',
        justifyContent: 'center',
    },
    stateContainer: {
        height: 50 * rem,
        minWidth: 170 * rem,
        width: '40%',
        marginBottom: 18 * rem,
    },
});

