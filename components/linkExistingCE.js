import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';


export default function linkExistingCE(props) {
    const licenses = useSelector(state => state.licenses);
    const ceData = useSelector(state => state.ces);
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);

    const [completedCEHours, setCompletedCEHours] = useState(0);


    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        setIsModalVisible(true);
    }, [props.open]);

    let handleDone = () => {
        setIsModalVisible(false);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({
        modalTransparency: {
            backgroundColor: 'rgba(0,0,0, 0.30)',
            height: '100%',
            width: '100%',
        },
        modalPopupContainer: {
            position: 'absolute',
            top: screenHeight / 8,
            backgroundColor: 'white',
            alignSelf: 'center',
            padding: 18 * rem,
            borderRadius: 10 * rem,
            maxHeight: screenHeight * (6 / 8),
        },
        emptyText: {
            fontSize: 16 * rem,
            marginBottom: 24 * rem,
            textAlign: 'center',
        },
        modalTitle: {
            fontSize: 20 * rem,
            color: colors.grey900,
            marginBottom: 24 * rem,
        },

        linkCEButton: {
            marginTop: 12 * rem,
            flexDirection: 'row',
            height: 50 * rem,
            backgroundColor: 'white',
            borderWidth: 2 * rem,
            borderRadius: 10 * rem,
            borderColor: colors.blue800,
            justifyContent: 'center',
            alignSelf: 'center',
            padding: 12 * rem,
            paddingLeft: 24 * rem,
            paddingRight: 24 * rem,
        },
        linkCEButtonText: {
            fontSize: 16 * rem,
            textAlign: 'center',
            color: colors.blue800,
        },

        requirementFlexRowContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            marginBottom: 16 * rem,
            marginTop: -12 * rem,
            alignContent: 'center',
            alignItems: 'center',
        },
        linkHoursContainer: {
            height: 50 * rem,
            width: '20%',
            marginRight: 12 * rem,
            marginLeft: 24 * rem,
        },
    });

    return (
        <Modal
            visible={isModalVisible}
            animationType='fade'
            transparent={true}
        >
            <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                <View style={styles.modalTransparency} />
            </TouchableWithoutFeedback>
            <ScrollView style={styles.modalPopupContainer}>
                <Text style={styles.modalTitle}>Requirements</Text>
                {Object.keys(ceData).length ? (<FlatList
                    data={Object.keys(ceData)}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <View style={styles.requirementFlexRowContainer}>
                            <View style={styles.linkHoursContainer}>
                                <TextInput
                                    placeholder={"Hrs"}
                                    placeholderTextColor={colors.grey400}
                                    style={styles.input}
                                    onChangeText={(hours) => setRequirementHours(hours, item, index)}
                                    keyboardType={'numeric'}
                                    maxLength={4}
                                />
                            </View>
                            <Text style={styles.linkedReqText}>{licenses[item].requirements[index].name}</Text>
                        </View>
                        // <Text>{ceData[item].name}</Text>
                    )}
                >
                </FlatList>) : (<Text style={styles.emptyText}>No CEs to link!</Text>)}


                <TouchableOpacity
                    onPress={() => {
                        handleDone();
                    }}
                    style={styles.linkCEButton}
                >
                    <Text style={styles.linkCEButtonText}>{('Done')}</Text>
                </TouchableOpacity>
                <Text>{"\n"}</Text>
            </ScrollView>
        </Modal>
    );
}
