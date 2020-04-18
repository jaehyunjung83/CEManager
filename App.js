import 'react-native-gesture-handler';
import React from 'react';
import { Dimensions } from 'react-native';
import firebase from 'firebase';
import { firebaseConfig } from './config';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from './components/colors.js';
import Login from './screens/login.js';
import SignUp from './screens/signUp.js';
import LoggedIn from './screens/loggedIn.js';
import Scanner from './screens/scanner.js';
import ScannedView from './screens/scannedView.js';
import addNew from './screens/addNew.js';
import SplashScreen from './screens/splashScreen.js'; // TODO: Add loading splash screen on startup
import { enableScreens } from 'react-native-screens';
enableScreens();

import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested inside plain ScrollViews',
]);

// TODO: Add Forgot Password button

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

checkLoggedIn = (app) => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      app.setState({ isLoggedIn: true })
      app.setState({ isLoading: false })
    }
    else {
      app.setState({ isLoggedIn: false })
      app.setState({ isLoading: false })
    }
  })
}

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
    if (this.state.isLoading) {
      return <SplashScreen />;
    }


    return (
      <NavigationContainer>
        <Stack.Navigator>
          {this.state.isLoggedIn ? (
            <>
              <Stack.Screen
                name="LoggedIn"
                component={LoggedIn}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
                initialParams={{
                  setParentState: newState => this.setState(newState)
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
                component={addNew}
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
};

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