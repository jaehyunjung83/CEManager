import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Completed from '../images/completed.svg';
import { colors } from '../components/colors.js';
import LicenseCard from '../components/licenseCard.js';


export default function documents() {
  const licenses = useSelector(state => state.licenses);

  const [isEmpty, setIsEmpty] = useState(true);

  React.useEffect(() => {
    for (const id in licenses) {
      if (licenses[id].complete) {
        setIsEmpty(false);
        return;
      }
    }
    setIsEmpty(true);
  }, [JSON.stringify(licenses)])

  if (isEmpty) {
    return (
      <View style={styles.emptyContainer}>
        <Completed width={screenWidth - (50 * rem)} height={200 * rem} />
        <Text style={styles.emptyText}>View all your completed licenses and certifications here.</Text>
      </View>
    );
  }
  else {
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ paddingBottom: 48 * rem }}
          data={Object.keys(licenses).sort((a, b) => { return new Date(licenses[a].licenseExpiration) - new Date(licenses[b].licenseExpiration) })}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            licenses[item].complete && <LicenseCard
              data={item}
            />
          )}
        />
      </View >
    )
  }
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

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
  },
});