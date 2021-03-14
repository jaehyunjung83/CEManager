import React from 'react';
import { Dimensions } from 'react-native';
import Homepage from './homepage.js';
import Documents from './documents.js';
import Completed from './completed.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { colors } from '../components/colors.js';

const Tab = createMaterialTopTabNavigator();

export default function homeTabs() {

    return (
        <Tab.Navigator
            swipeEnabled={false}
            initialLayout={{ width: Dimensions.get('window').width }}
            tabBarOptions={{
                labelStyle: {
                    fontSize: 14 * rem,
                    fontWeight: '500',
                },
                indicatorStyle: {
                    backgroundColor: colors.blue800,
                },
                activeTintColor: colors.blue800,
                style: {
                    backgroundColor: 'white',
                },
            }}
        >
            <Tab.Screen
                name="Homepage"
                component={Homepage}
                options={{
                    tabBarLabel: 'Credentials',
                    // tabBarIcon: () => (
                    //     <SimpleLineIcons
                    //         name='home'
                    //         size={26 * rem}
                    //         color={colors.blue800}
                    //     />
                    // ),
                }}
            />
            <Tab.Screen
                name="Documents"
                component={Documents}
                options={{
                    tabBarLabel: 'Documents',
                    // tabBarIcon: () => (
                    //     <Entypo
                    //         name='documents'
                    //         size={26 * rem}
                    //         color={colors.blue800}
                    //     />
                    // ),
                }}
            />
            <Tab.Screen
                name="Completed"
                component={Completed}
                options={{
                    tabBarLabel: 'Completed',
                    // tabBarIcon: () => (
                    //     <MaterialCommunityIcons
                    //         name='progress-check'
                    //         size={26 * rem}
                    //         color={colors.blue800}
                    //     />
                    // ),
                }}
            />
        </Tab.Navigator>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);