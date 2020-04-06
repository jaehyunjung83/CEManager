import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Completed from '../images/completed.svg';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function documents() {

  return (
    <View style={styles.container}>
      <Completed width={screenWidth - (50 * rem)} height={200 * rem} />
      <Text style={styles.emptyText}>View all your expired licenses and certifications here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 247, 249, 1)',
  },
  emptyText: {
    color: 'grey',
    fontSize: 16 * rem,
    textAlign: 'center',
    margin: 30 * rem,
  },
});