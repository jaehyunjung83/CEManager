import React, { useState } from 'react';
import { Dimensions, Text, StyleSheet, View } from 'react-native';
import { colors } from '../components/colors.js';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

// const stripePromise = loadStripe('pk_test_cGkQlPvs51UzF6W4lfRdq7gu00faHg5vSC');


export default function account({ navigation }) {
    const [plan, setPlan] = useState("");

    React.useEffect(() => {
        getAccountStatus();
    }, [])

    let getAccountStatus = async () => {
        let db = firestore();
        let uid = auth().currentUser.uid;

        let response = await db.collection("users").doc(uid).get();
        let data = response.data();
        if (!data) {
            setPlan("Free");
        }
        else {
            setPlan(data.plan);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Account status: {plan}</Text>
            <Text style={styles.header}>Payment Information</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12 * rem,
        paddingTop: 50 * rem,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 20 * rem,
        fontWeight: '500',
        color: colors.grey800,
    },
    header2: {
        fontSize: 30,
        fontWeight: '500',
        color: 'cyan',
    },
});