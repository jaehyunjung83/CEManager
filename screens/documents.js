import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign';

import { useSelector, useDispatch } from 'react-redux';
import { updateCEs } from '../actions';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import AddDocument from '../images/addDocument.svg';
import { colors } from '../components/colors.js';

import CEcard from '../components/ceCard.js';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function documents({ navigation }) {
  let ceData = useSelector(state => state.ces);
  const [isEmpty, setIsEmpty] = useState(true);


  React.useEffect(() => {
    if (Object.keys(ceData).length) {
      setIsEmpty(false);
    }
  }, [JSON.parse(JSON.stringify(ceData))])

  let openScannerHandler = () => {
    navigation.navigate("AddCE");
  }

  return (

    <>
      {
        isEmpty ? (
          <View style={styles.emptyContainer}>
            <AddDocument width={screenWidth - (50 * rem)} height={200 * rem} />
            <Text style={styles.emptyText}>You don't have any documents scanned yet.</Text>
          </View>
        ) : (
            <View style={styles.container}>
              <FlatList
                contentContainerStyle={{ paddingBottom: 48 * rem }}
                data={Object.keys(ceData).sort((a, b) => { return new Date(ceData[b]?.completionDate) - new Date(ceData[a]?.completionDate) })}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <CEcard data={ceData[item]} />
                )}
              />
            </View>
          )
      }
      < View style={styles.addNewButtonContainer} >
        <TouchableOpacity
          onPress={openScannerHandler}>
          <AntDesign
            name='plus'
            size={32 * rem}
            color={'white'}
          />
        </TouchableOpacity>
      </View >
    </ >
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.grey200,
  },
  emptyText: {
    color: 'grey',
    fontSize: 16 * rem,
    textAlign: 'center',
    margin: 30 * rem,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.grey200,
    // paddingBottom: 48 * rem,
  },
  addNewButtonContainer: {
    position: 'absolute',
    right: 32 * rem,
    bottom: 32 * rem,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60 * rem,
    aspectRatio: 1,
    borderRadius: (60 * rem) / 2,
    backgroundColor: colors.blue800,
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