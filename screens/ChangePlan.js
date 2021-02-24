import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, StyleSheet, Dimensions, } from 'react-native'
import stripe from 'tipsi-stripe'
import Button from '../components/Button'
import { PaymentCardTextField } from 'tipsi-stripe'

import { updateAccountData } from '../actions';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ChangePlan() {
  const accountData = useSelector(state => state.accountData);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [currentPlan, setCurrentPlan] = useState("");

  React.useEffect(() => {
    setCurrentPlan(accountData.plan);
    if(!accountData.plan) {
      getAccountStatus();
    }
  }, [JSON.stringify(accountData)]);

  let getAccountStatus = async () => {
    let db = firestore();
    let uid = auth().currentUser.uid;

    let response = await db.collection("users").doc(uid).get();
    let data = response.data();
    dispatch(updateAccountData(data));
}

  let handleChangePlan = async (selectedPlan) => {
    const uid = auth().currentUser.uid;
    let db = firestore();

    const data = {
      plan: selectedPlan
    };

    await db.collection("users").doc(uid).set(data, { merge: true });

    let accountDataCopy = JSON.parse(JSON.stringify(accountData));
    accountDataCopy.plan = selectedPlan;
    dispatch(updateAccountData(accountDataCopy));
  }

  // Used to make element sizes more consistent across screen sizes.
  const screenWidth = Math.round(Dimensions.get('window').width);
  const rem = (screenWidth / 380);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.grey100,
      padding: 12 * rem,
    },
    header: {
      fontSize: 17 * rem,
      marginBottom: 12 * rem,
      color: colors.grey900,
      textAlign: 'center',
    },
    currentPlan: {
      fontWeight: '500',
      color: colors.blue800,
    },
    planDetails: {
      width: '100%',
      borderRadius: 6 * rem,
      backgroundColor: 'white',
      padding: 12 * rem,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,

      marginBottom: 32 * rem,
    },
    price: {
      textAlign: 'center',
      fontSize: 40 * rem,
      fontWeight: '200',
    },
    priceMonth: {
      fontSize: 20 * rem,
    },
    details: {
      textAlign: 'center',
      fontSize: 16 * rem,
      lineHeight: 20 * rem,
      marginBottom: 12 * rem,
      color: colors.grey900,
    },
    checkIcon: {
      color: colors.blue800,
    },

    divider: {
      marginTop: 8 * rem,
      marginBottom: 24 * rem,
      borderBottomColor: colors.grey400,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  })

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}>
      <Text style={styles.header}>Current plan: <Text style={styles.currentPlan}>{currentPlan}</Text></Text>
      <View style={styles.divider} />

      <View style={styles.planDetails}>
        <Text style={styles.price}>$0<Text style={styles.priceMonth}>/mo</Text></Text>
        <View style={styles.divider} />
        <Text style={styles.details}>
          <AntDesign name="check" size={20 * rem} style={styles.checkIcon} />
            Upcoming renewal reminders
        </Text>
        <Button
          text="Select Free Plan"
          onPress={() => handleChangePlan("Free")}
        />
      </View>


      <View style={styles.planDetails}>
        <Text style={styles.price}>$2.00<Text style={styles.priceMonth}>/mo</Text></Text>
        <Text style={styles.price}><Text style={styles.priceMonth}>(billed annually)</Text></Text>
        <View style={styles.divider} />


        <Text style={styles.details}>
          <AntDesign name="check" size={20 * rem} style={styles.checkIcon} />
            Upcoming renewal reminders
        </Text>
        <Text style={styles.details}>
          <AntDesign name="check" size={20 * rem} style={styles.checkIcon} />
             Easy license renewal submission through governing body
        </Text>
        <Button
          text="Select Concierge Plan"
          onPress={() => handleChangePlan("Concierge")}
        />
      </View>
    </ScrollView>
  )
}
