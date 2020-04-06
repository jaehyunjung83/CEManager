import 'react-native-gesture-handler';
import React from 'react';
import { Dimensions } from 'react-native';
import firebase from 'firebase';
import { firebaseConfig } from './config';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/login.js';
import SignUp from './screens/signUp.js';
import LoggedIn from './screens/loggedIn.js';
import Scanner from './screens/scanner.js';
import ScannedView from './screens/scannedView.js';
import SplashScreen from './screens/splashScreen.js'; // TODO: Add loading splash screen on startup


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

let checkLoggedIn = (props) => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      props.state.isLoading = false;
      props.state.isLoggedIn = true;
    }
    else {

      props.state.isLoading = false;
      props.state.isLoggedIn = false;
    }
  });
}

const Stack = createStackNavigator();


// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      isLoading: true,
    };

    checkLoggedIn(this);
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: '#0055a5',
              },
              headerTintColor: 'rgba(255,255,255,0)',
            }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              headerShown: false,
            }} />
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
            }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};

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
    //               backgroundColor: '#0055a5',
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
    //                 backgroundColor: '#0055a5',
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