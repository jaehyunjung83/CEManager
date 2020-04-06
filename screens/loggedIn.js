import React from 'react';
import { Dimensions } from 'react-native';
import firebase from 'firebase';
import Home from './home.js';
import Settings from './settings.js';
import Logout from '../components/logout.js'
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function loggedIn({ navigation }) {


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
        }
        else {
            navigation.navigate("Login");
        }
    });

    return (
        <Drawer.Navigator
            drawerStyle={{height: Math.round(Dimensions.get('window').height),}}
        >
            <Drawer.Screen name="Homepage" component={Home} />
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen name="Logout" component={Logout} />
        </Drawer.Navigator>
    )
}