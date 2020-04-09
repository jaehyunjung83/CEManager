import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import AddDocument from '../images/addDocument.svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../components/colors.js';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function documents({ navigation }) {

  let openScannerHandler = () => {
    navigation.navigate("Scanner");
  }

  return (
    <View style={styles.container}>
      <AddDocument width={screenWidth - (50 * rem)} height={200 * rem} />
      <Text style={styles.emptyText}>You don't have any documents scanned yet.</Text>

      <View style={styles.addContainer}>
        <TouchableOpacity
          onPress={openScannerHandler}>
          <MaterialCommunityIcons
            name='plus'
            size={40 * rem}
            color={'white'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  addContainer: {
    position: 'absolute',
    right: 32*rem,
    bottom: 32*rem,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60 * rem,
    aspectRatio: 1,
    borderRadius: (60 * rem) / 2,
    backgroundColor: colors.mainBlue,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
});