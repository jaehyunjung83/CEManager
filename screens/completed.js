import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Completed from '../images/completed.svg';
import { colors } from '../components/colors.js';
import LicenseCard from '../components/licenseCard.js';
import CertificationCard from '../components/certificationCard.js';


export default function documents() {
  const licenses = useSelector(state => state.licenses);
  const certifications = useSelector(state => state.certifications);
  const allCEData = useSelector(state => state.ces);

  const [isEmpty, setIsEmpty] = useState(true);
  const [licensesDisplayed, setLicensesDisplayed] = useState(-1);
  const [IDList, setIDList] = useState([]);

  React.useEffect(() => {
    if(!Object.keys({ ...licenses, ...certifications }).filter(key => licenses[key]?.complete || certifications[key]?.complete).length) {
      setIsEmpty(true);
  }
  else {
      setIsEmpty(false);
  }
  }, [JSON.stringify(licenses), JSON.stringify(certifications)])

  React.useEffect(() => {
    setIDList(Object.keys({ ...licenses, ...certifications }));
    let licensesToDisplay = Object.keys({ ...licenses, ...certifications }).filter(key => licenses[key]?.complete).length;
    setLicensesDisplayed(licensesToDisplay);
}, [JSON.stringify(licenses), JSON.stringify(certifications), JSON.stringify(allCEData)])

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
                data={IDList.filter(key => licenses[key]?.complete || certifications[key]?.complete).sort((a, b) => {
                    if ((a in licenses && b in licenses)) {
                        return new Date(licenses[a].licenseExpiration) - new Date(licenses[b].licenseExpiration)
                    }
                    else if ((a in certifications && b in certifications)) {
                        return new Date(certifications[a].expiration) - new Date(certifications[b].expiration)
                    }
                    else if (a in licenses) {
                        return -1;
                    }
                    return 1;
                })}
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => (
                    <>
                        {item in licenses && index == 0 && <Text style={styles.header}>Licenses</Text>}

                        {item in certifications && index == licensesDisplayed && <Text style={styles.header}>Certifications</Text>}

                        {item in licenses && licenses[item].complete && <LicenseCard
                            data={item}
                        />}
                        {item in certifications && certifications[item].complete && <CertificationCard
                            data={item}
                        />}
                    </>
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
    width: screenWidth,
},
header: {
    fontSize: 22 * rem,
    color: colors.blue800,
    textAlign: 'left',
    width: '100%',
    fontWeight: '500',
    marginLeft: 16 * rem,
    marginTop: 12 * rem,
},
addNewButtonContainer: {
    position: 'absolute',
    right: 32 * rem,
    bottom: 32 * rem,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60 * rem,
    width: 60 * rem,
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
addNewText: {
    fontSize: 20 * rem,
    color: 'white',
    paddingRight: 24 * rem,
    paddingLeft: 24 * rem,
},

wrapper: {
    margin: 0,
    padding: 0,
}
});