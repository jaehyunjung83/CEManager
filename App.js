import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import firebase from 'firebase';
import { firebaseConfig } from './config';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Login from './screens/login.js';
import SignUp from './screens/signUp.js';
import Home from './screens/home.js';
import SplashScreen from './screens/splashScreen.js';


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


const Stack = createStackNavigator();


export default class App extends React.Component {
  
  constructor(props) {
    super(props);

    state = {
      logginIn: false,
    }

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        state.loggedIn = true;
      }
      else {
        state.loggedIn = false;
      }
    });
  }
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              // headerShown: false,
              headerStyle: {
                backgroundColor: '#0055a5',
              },
              headerTintColor: 'rgba(255,255,255,0)',
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
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};

// export default App;