import React, { useState  } from 'react';
import Home from './home.js';
import Settings from './settings.js';
import Account from './account.js';
import Logout from '../components/logout.js'
import { createDrawerNavigator } from '@react-navigation/drawer';
import { colors } from '../components/colors.js';
import { Dimensions } from 'react-native';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const Drawer = createDrawerNavigator();

export default function loggedIn(props) {

    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={Home}/>
            <Drawer.Screen name="Account" 
            options={{
                title: "Account",
                headerShown: true,

              }}
              component={Account} />
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen
                name="Logout"
                component={Logout}
            />
        </Drawer.Navigator>
    )
}