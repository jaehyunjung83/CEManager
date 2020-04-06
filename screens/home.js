import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import HomeTabs from './homeTabs.js';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Octicons';



// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const Stack = createStackNavigator();

export default function home({ navigation }) {

  hamburgerPressed = () => {
    navigation.openDrawer();
  }
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{
          // headerShown: false,
          title: 'CEManager',
          headerStyle: {
            backgroundColor: '#0055a5',
            height: 76 * rem,
            shadowColor: 'transparent',
            shadowRadius: 0,
            shadowOffset: {
              height: 0,
            }
          },
          headerTintColor: 'rgba(255,255,255,0)',
          headerTitleStyle: {
            flex: 1,
            top: 0,
            color: 'white',
            fontSize: 25 * rem,
            fontWeight: '400',
            textAlign: 'left',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={this.hamburgerPressed}>
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

const styles = StyleSheet.create({
  hamburgerButton: {
    flex: 1,
    color: 'white',
    left: 14 * rem,
    fontSize: 28 * rem,
  },
})