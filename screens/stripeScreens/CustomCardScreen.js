import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import stripe from 'tipsi-stripe'
import Button from '../../components/Button'
import testID from '../../utils/testID'
import { PaymentCardTextField } from 'tipsi-stripe'

import { updateAccountData } from '../../actions';
import { useSelector, useDispatch } from 'react-redux';

import { colors } from '../../components/colors.js';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function CustomCardScreen() {
  const accountData = useSelector(state => state.accountData);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const [params, setParams] = useState({
    number: '-',
    expMonth: '-',
    expYear: '-',
    cvc: '-',
    name: '',
    currency: 'usd',
    addressLine1: '',
    addressLine2: '',
    addressCity: '',
    addressState: '',
    addressCountry: '',
    addressZip: '',
  });


  let handleCustomPayPress = async () => {
    try {
      
      setLoading(true);
      setToken(false);
      setError(null);
      const token = await stripe.createTokenWithCard(params);
      const uid = auth().currentUser.uid;
      let db = firestore();

      const data = {
        token: `${token.tokenId}`,
        uid: `${uid}`,
        stripeCustomerID: `${accountData.stripeCustomerID}`,
        email: `${accountData.email}`,
      }

      var response = await fetch('https://us-central1-cetracker-2de23.cloudfunctions.net/saveCardToStripe', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.status !== 200) throw new Error("Something went wrong. Please try again.");

      setLoading(false);
      setToken(token);
      setError(undefined);

      const doc = await db.collection("users").doc(`${uid}`).get();
      if (doc.exists) {
        const accountData = doc.data();
        dispatch(updateAccountData(accountData));
        navigation.pop();
      }
      
    } catch (error) {
      if (error.message.includes("Failed params type")) {
        error.message = "Please finish filling out all fields.";
      }

      setLoading(false);
      setError(error);
    }
  }

  let handleFieldParamsChange = (valid, params, zip) => {
    for (const field in params) {
      if (!params[field]) {
        params[field] = '-';
      }
    }
    setParams(params);
  }

  let isPaymentCardTextFieldFocused = () => paymentCardInput.isFocused()

  let focusPaymentCardTextField = () => paymentCardInput.focus()

  let blurPaymentCardTextField = () => paymentCardInput.blur()

  let resetPaymentCardTextField = () => paymentCardInput.setParams({})


  // Used to make element sizes more consistent across screen sizes.
  const screenWidth = Math.round(Dimensions.get('window').width);
  const rem = (screenWidth / 380);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.grey100,
    },
    header: {
      fontSize: 18 * rem,
      textAlign: 'center',
      margin: 10,
    },
    params: {
      backgroundColor: '#fff',
      borderRadius: 10 * rem,
      padding: 10 * rem,
      alignItems: 'flex-start',
      margin: 5 * rem,
    },
    param: {
      fontSize: 14 * rem,
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5 * rem,
    },
    token: {
      height: 20 * rem,
    },
    errorMsg: {
      color: 'red',
    },

    field: {
      width: 300 * rem,
      color: colors.green600,
      borderColor: '#000',
      borderWidth: 1 * rem,
      borderRadius: 5 * rem,
    },
  })

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Input your card information</Text>
      <PaymentCardTextField
        ref={(ref) => {
          paymentCardInput = ref;
        }}
        style={styles.field}
        cursorColor={colors.green600}
        textErrorColor={'red'}
        numberPlaceholder={'4242424242424242'}
        expirationPlaceholder={'04/24'}
        cvcPlaceholder={'123'}
        disabled={false}
        onParamsChange={handleFieldParamsChange}
      />

      <View style={styles.params}>
        <Text style={styles.param}>Number: {params.number}</Text>
        <Text style={styles.param}>Month: {params.expMonth}</Text>
        <Text style={styles.param}>Year: {params.expYear}</Text>
        <Text style={styles.param}>CVC: {params.cvc}</Text>
      </View>
      {/* <View style={styles.params}>
          <Text style={styles.param}>Name: {params.name}</Text>
          <Text style={styles.param}>Currency: {params.currency}</Text>
          <Text style={styles.param}>Address Line 1: {params.addressLine1}</Text>
          <Text style={styles.param}>Address Line 2: {params.addressLine2}</Text>
          <Text style={styles.param}>Address City: {params.addressCity}</Text>
          <Text style={styles.param}>Address State: {params.addressState}</Text>
          <Text style={styles.param}>Address Country: {params.addressCountry}</Text>
          <Text style={styles.param}>Address Zip: {params.addressZip}</Text>
        </View> */}
      <Button
        text="Save Card"
        loading={loading}
        onPress={handleCustomPayPress}
        {...testID('customCardButton')}
      />
      {error &&
        <View style={styles.token} {...testID('customCardTokenError')}>
          <Text style={styles.errorMsg}>Error: {error.message}</Text>
        </View>
      }
    </View>
  )
}
