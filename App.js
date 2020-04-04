import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import firebase from 'firebase';
import { firebaseConfig } from './config';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/login.js';
import SignUp from './screens/signUp.js';
import Home from './screens/home.js';
import NavigationButtons from './components/navigationButtons.js';
import Scanner from './screens/scanner.js';
import ScannedView from './screens/scannedView.js';
import SplashScreen from './screens/splashScreen.js'; // TODO: Add loading splash screen on startup
import Icon from 'react-native-vector-icons/Octicons';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


const Stack = createStackNavigator();

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const rem = Math.round(screenWidth/380);

export default class App extends React.Component {

  hamburgerPressed = () => {
    // TODO: Open hamburger menu.
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              title: 'CEManager',
              headerStyle: {
                backgroundColor: '#0055a5',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: (screenHeight/20)*rem,
                },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,

                elevation: 8,
              },
              headerTintColor: 'rgba(255,255,255,0)',
              headerTitleStyle: {
                flex: 1,
                top: 0,
                color: 'white',
                fontSize: 25*rem,
                fontWeight: '300',
                textAlign: 'left',
              },
              headerLeft: () => (
                <Icon name={'three-bars'}
                  onPress={this.hamburgerPressed}
                  style={styles.hamburgerButton}
                />
              ),
              headerRight: () => (
                <NavigationButtons></NavigationButtons>
              )
            }} />
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

const styles = StyleSheet.create({
  hamburgerButton: {
    flex: 1,
    color: 'white',
    left: 14*rem,
    fontSize: 28*rem,
  },
})