import React, { useState, useEffect } from 'react';
import { Dimensions, TouchableOpacity, Text, TextInput } from 'react-native';
import 'react-native-gesture-handler';
// import firebase from 'firebase';
// import { firebaseConfig } from './config';
import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from './components/colors.js';
import Login from './screens/login.js';
import SignUp from './screens/signUp.js';
import LoggedIn from './screens/loggedIn.js';
import Scanner from './screens/scanner.js';
import ScannedView from './screens/scannedView.js';
import AddNew from './screens/addNew.js';
import EditLicense from "./screens/editLicense.js";
import EditCertification from "./screens/editCertification.js";
import SplashScreen from './screens/splashScreen.js';
import LicenseDetails from './screens/licenseDetails.js';
import CertificationDetails from './screens/certificationDetails.js';
import CEDetails from './screens/ceDetails.js';
import AddCE from './screens/addCE.js';
import EditCE from './screens/editCE.js';
import Renewal from './screens/renewal.js';
import CustomCardScreen from './screens/stripeScreens/CustomCardScreen.js';
import ChangePlan from './screens/ChangePlan.js';
import { YellowBox } from 'react-native';


YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

// TODO: Add Forgot Password button


const Stack = createStackNavigator();


import stripe from 'tipsi-stripe'
stripe.setOptions({
  publishableKey: 'pk_test_cGkQlPvs51UzF6W4lfRdq7gu00faHg5vSC',
  androidPayMode: 'test', // Android only
})

// Disable font scaling
TextInput.defaultProps = Text.defaultProps || {}; //Disable dynamic type in IOS
TextInput.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

export default function App() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState('');

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);


  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="LoggedIn"
              component={LoggedIn}
              options={{
                gestureEnabled: false,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Scanner"
              component={Scanner}
              options={{
                headerShown: false,
                gestureEnabled: false,
                animationEnabled: false,
              }} />
            <Stack.Screen
              name="ScannedView"
              component={ScannedView}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="AddNew"
              component={AddNew}
              options={{
                title: "Add New",
                headerBackTitle: "Home",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
              <Stack.Screen
              name="EditLicense"
              component={EditLicense}
              options={{
                title: "Edit License",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="AddCE"
              component={AddCE}
              options={{
                title: "Add CE",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
              <Stack.Screen
              name="EditCE"
              component={EditCE}
              options={{
                title: "Edit CE",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="EditLicense"
              component={EditLicense}
              options={{
                title: "Edit License",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="EditCertification"
              component={EditCertification}
              options={{
                title: "Edit Certification",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="AddCE"
              component={AddCE}
              options={{
                title: "Add CE",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="EditCE"
              component={EditCE}
              options={{
                title: "Edit CE",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="LicenseDetails"
              component={LicenseDetails}
              options={{
                title: "License Details",
                headerBackTitle: "Home",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="CertificationDetails"
              component={CertificationDetails}
              options={{
                title: "Certification Details",
                headerBackTitle: "Home",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="CEDetails"
              component={CEDetails}
              options={{
                title: "CE Details",
                headerBackTitle: "Home",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="Renewal"
              component={Renewal}
              options={{
                title: "Renewal",
                headerBackTitle: "Home",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="CustomCardScreen"
              component={CustomCardScreen}
              options={{
                title: "Card Input",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
            <Stack.Screen
              name="ChangePlan"
              component={ChangePlan}
              options={{
                title: "Change Plan",
                headerBackTitle: "Back",
                headerBackTitleStyle: {
                  color: colors.blue800,
                },
                headerTintColor: colors.blue800,
                headerTitleStyle: {
                  color: colors.blue800,
                  fontSize: 23 * rem,
                  fontWeight: '400',
                  textAlign: 'left',
                },
                headerStyle: {
                  backgroundColor: 'white',
                },
                gestureEnabled: false,
              }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerShown: false,
              }}
              initialParams={{
                setParentState: (newState) => this.setState(newState)
              }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{
                headerShown: false,
              }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

// SHELVED UNTIL BUG IS FIXED. https://github.com/react-navigation/react-navigation/issues/6820
// TODO: Check if this is working in release mode.

    // return (
    //   <NavigationContainer>
    //     <Stack.Navigator>
    //     {this.state.isLoggedIn ? (
    //       <>
    //         <Stack.Screen
    //           name="LoggedIn"
    //           component={LoggedIn}
    //           options={{
    //             title: 'CEManager',
    //             headerStyle: {
    //               backgroundColor: colors.mainBlue,
    //               height: 76 * rem,
    //               shadowColor: 'transparent',
    //               shadowRadius: 0,
    //               shadowOffset: {
    //                 height: 0,
    //               }
    //             },
    //             headerTintColor: 'rgba(255,255,255,0)',
    //             headerTitleStyle: {
    //               flex: 1,
    //               top: 0,
    //               color: 'white',
    //               fontSize: 25 * rem,
    //               fontWeight: '400',
    //               textAlign: 'left',
    //             },
    //             headerLeft: () => (
    //               <TouchableOpacity onPress={this.hamburgerPressed}>
    //                 <Icon name={'three-bars'}
    //                   style={styles.hamburgerButton}
    //                 />
    //               </TouchableOpacity>
    //             ),
    //           }}
    //         />
    //       </>
    //     ) : (
    //         <>
    //           <Stack.Screen
    //             name="Login"
    //             component={Login}
    //             options={{
    //               headerShown: false,
    //               headerStyle: {
    //                 backgroundColor: colors.mainBlue,
    //               },
    //               headerTintColor: 'rgba(255,255,255,0)',
    //             }}
    //           />
    //           <Stack.Screen
    //             name="SignUp"
    //             component={SignUp}
    //             options={{
    //               headerShown: false,
    //             }} />
    //         </>
    //       )}
    //       </Stack.Navigator>
    //   </NavigationContainer >
    // );