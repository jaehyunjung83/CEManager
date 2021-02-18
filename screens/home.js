import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import HomeTabs from './homeTabs.js';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Octicons';
import { colors } from '../components/colors.js';

const Stack = createStackNavigator();

export default function home({ navigation }) {

  const hamburgerPressed = () => {
    navigation.openDrawer();
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{
          // headerShown: false,
          title: 'CEsimply',
          headerStyle: {
            backgroundColor: 'white',
            height: 34 * hrem,
            shadowColor: 'transparent',
            shadowRadius: 0,
            shadowOffset: {
              height: 0,
            }
          },
          headerTitleStyle: {
            color: colors.blue800,
            fontSize: 23 * rem,
            fontWeight: '400',
            textAlign: 'left',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={hamburgerPressed}>
              <Icon name={'three-bars'}
                style={styles.hamburgerButton}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);
const rem = (screenWidth / 380);
const hrem = (screenHeight / 380);

const styles = StyleSheet.create({
  hamburgerButton: {
    color: colors.blue800,
    paddingLeft: 14 * rem,
    fontSize: 28 * rem,
  },
})