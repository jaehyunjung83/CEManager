import React from 'react';
import Home from './home.js';
import Settings from './settings.js';
import Logout from '../components/logout.js'
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export default function loggedIn({ route }) {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={Home} />
            <Drawer.Screen name="Settings" component={Settings} />
            <Drawer.Screen 
            name="Logout" 
            component={Logout} 
            initialParams={{
                setParentState: route.params.setParentState
              }}
            />
        </Drawer.Navigator>
    )
}