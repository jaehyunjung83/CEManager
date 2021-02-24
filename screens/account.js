import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Dimensions, Text, StyleSheet, View, TouchableOpacity } from 'react-native';

import Button from "../components/Button";
import { colors } from '../components/colors.js';

import { updateAccountData } from '../actions';
import { useSelector, useDispatch } from 'react-redux';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

// const stripePromise = loadStripe('pk_test_cGkQlPvs51UzF6W4lfRdq7gu00faHg5vSC');


export default function account() {
    const [plan, setPlan] = useState("");
    const [stripeCustomerID, setStripeCustomerID] = useState("");
    const [email, setEmail] = useState("");
    const [last4, setLast4] = useState("");
    const [expMonth, setExpMonth] = useState("");
    const [expYear, setExpYear] = useState("");


    const navigation = useNavigation();
    const dispatch = useDispatch();
    const accountData = useSelector(state => state.accountData);

    React.useEffect(() => {
        updateAccountStatus();
    }, [JSON.stringify(accountData)]);

    React.useEffect(() => {
        getAccountStatus();
    }, []);

    let getAccountStatus = async () => {
        let db = firestore();
        let uid = auth().currentUser.uid;

        let response = await db.collection("users").doc(uid).get();
        let data = response.data();
        dispatch(updateAccountData(data));
    }

    let updateAccountStatus = () => {
        const data = accountData;

        if (!Object.keys(data).length) {
            setPlan("Free");
            return;
        }

        setPlan(data.plan);
        setStripeCustomerID(data.stripeCustomerID);
        setEmail(data.email);
        if (data.stripeCard && Object.keys(data.stripeCard).length) {
            setLast4(data.stripeCard.last4);
            setExpMonth(data.stripeCard.exp_month);
            setExpYear(data.stripeCard.exp_year);
        }
    }

    let openCardInput = () => {
        navigation.navigate("CustomCardScreen");
    }

    let handleChangePlan = () => {
        console.log("Change plan");
        navigation.navigate("ChangePlan");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Account plan: <Text style={styles.currentPlan}>{plan}</Text></Text>
            <Button
                text="Change Plan"
                onPress={handleChangePlan}
            />
            <View style={styles.divider} />


            <Text style={styles.header}>Payment Information</Text>
            <View style={styles.card}>
                <Text style={styles.cardText}>Card ending in: <Text style={styles.userInfo}>{last4}</Text></Text>
                <Text style={styles.cardText}>Expiration: <Text style={styles.userInfo}>{expMonth}/{expYear}</Text></Text>
            </View>
            <Button text="Update Payment Info" onPress={openCardInput}>Update Payment Info</Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12 * rem,
        paddingTop: 50 * rem,
        backgroundColor: colors.grey100,
    },
    header: {
        fontSize: 18 * rem,
        fontWeight: '400',
        color: colors.grey900,
    },
    currentPlan: {
        fontWeight: '500',
        color: colors.blue800,
    }, 
    header2: {
        fontSize: 30,
        fontWeight: '500',
        color: 'cyan',
    },

    divider: {
        marginTop: 8 * rem,
        marginBottom: 12 * rem,
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    card: {
        flexShrink: 1,
        padding: 12 * rem,
        marginLeft: 16 * rem,
        marginRight: 16 * rem,
        width: screenWidth - (48 * rem),
        borderRadius: 10 * rem,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginTop: 24 * rem,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        zIndex: -1,
    },
    cardText: {
        textAlign: 'center',
        fontSize: 14 * rem,
    },
    userInfo: {
        fontWeight: '500',
    }
});