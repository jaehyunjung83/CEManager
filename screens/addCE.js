import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, TextInput, View, StyleSheet, Dimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Header from '../components/header.js';
import { TextInputMask } from 'react-native-masked-text';
import { useHeaderHeight } from '@react-navigation/stack';
import FastImage from 'react-native-fast-image'
import { v4 as uuidv4 } from 'uuid';


export default function addCE(props) {

    const headerHeight = useHeaderHeight();

    const [name, setName] = useState("");
    const [nameErrorMsg, setNameErrorMsg] = useState("");
    const [hours, setHours] = useState("");
    const [hoursErrorMsg, setHoursErrorMsg] = useState("");
    const [completionDate, setCompletionDate] = useState("");
    const [completionErrorMsg, setCompletionErrorMsg] = useState("");
    const [providerNum, setProviderNum] = useState("");
    const [providerErrorMsg, setProviderErrorMsg] = useState("");

    const [isLoading, setIsLoading] = useState(false);

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

    let addCE = () => {
        setIsLoading(true);
        if (isFormComplete()) {
            const licenseId = uuidv4();
            let CEData = {
                name: name,
                hours: hours,
                completionDate: completionDate,
                providerNum: providerNum,
            }
            console.log(`CEData: ${JSON.stringify(CEData)}`);
            // licenseData = {
            //     licenseType: licenseType,
            //     otherLicenseType: otherLicenseType,
            //     licenseState: licenseState,
            //     licenseNum: licenseNum,
            //     licenseExpiration: licenseExpiration,
            //     licensePhoto: licensePhoto,
            //     licenseThumbnail: licenseThumbnail,
            //     totalCEHours: ceHoursRequired,
            //     completedCEHours: 0,
            //     requirements: requirements,
            //     id: licenseId,
            // }
            // let licenseObj = {
            //     [licenseId]: licenseData,
            // }

            // let uid = auth().currentUser.uid;
            // let db = firestore();
            // db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licenseObj, { merge: true })
            //     .then(() => {
            //         console.log("Document successfully written!");
            //         props.navigation.navigate("Homepage", { refreshPage: true });
            //     })
            //     .catch((error) => {
            //         console.error("Error adding document: ", error);
            //         props.navigation.navigate("Homepage", { refreshPage: true });
            //     });
        }
        else {
            this.scrollView.scrollTo({ y: 0 });
        }
    }

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
                <View style={styles.flexRowContainer}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.inputLabel}>Name of CE {nameErrorMsg ? (<Text style={styles.errorMessage}> {nameErrorMsg}</Text>) : (null)}</Text>
                        <TextInput
                            placeholder={'e.g. Bioterrorism'}
                            placeholderTextColor={colors.grey400}
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            maxLength={70}
                        />
                    </View>
                </View>

                <View style={styles.flexRowContainer}>
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
                            onChangeText={setHours}
                            keyboardType={'numeric'}
                            maxLength={5}
                        />
                    </View>
                </View>

                <View style={styles.flexRowContainer}>
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

                <View style={styles.headerContainer}>
                    <Header text="Link CE to Licenses" />
                </View>

                <TouchableOpacity
                    onPress={() => {
                        addCE();
                    }}
                    disabled={isLoading}
                    style={styles.addNewLicenseButton}
                >
                    <Text style={styles.choiceTextSelected}>{isLoading ? ('...') : ('Add New CE')}</Text>
                </TouchableOpacity>

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
    headerContainer: {
        width: '100%',
        height: 40 * rem,
        marginBottom: 18 * rem,
        zIndex: -1,
    },
    errorMessage: {
        fontSize: 16 * rem,
        color: colors.red500,
        fontWeight: '500',
    },
    flexRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: (50 + 24) * rem,
        marginBottom: 18 * rem,
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
        padding: 18 * rem,
        color: colors.grey900,
    },

    providerContainer: {
        height: 50 * rem,
        minWidth: 180 * rem,
        width: '60%',
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
        padding: 18 * rem,
        color: colors.grey900,
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
    choiceTextSelected: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
        textAlign: 'center',
    },
});

