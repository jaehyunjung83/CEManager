import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight, Modal, TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

export default function ceCard(props) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const ceData = useSelector(state => state.ces);

    const navigation = useNavigation();
    const route = useRoute();

    let cardPressed = () => {
        navigation.navigate("CEDetails", { data: ceData[props.data.id] });
    }

    let openScanner = () => {
        navigation.navigate('Scanner', {
            fromThisScreen: route.name,
            initialFilterId: 2, // Black and white photo
            ceID: props.data.id,
        });
    }

    let openImage = () => {
        setIsModalVisible(true);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({
        // Card stylings
        cardContainer: {
            flexShrink: 1,
            height: 97 * rem,
            marginLeft: 16 * rem,
            marginRight: 16 * rem,
            width: screenWidth - (48 * rem),
            borderRadius: 10 * rem,
            backgroundColor: 'white',
            alignSelf: 'center',
            marginTop: 24 * rem,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,
            elevation: 6,
            zIndex: -1,
        },
        ceThumbnailContainer: {
            alignSelf: 'flex-end',
            marginTop: 11 * rem,
            marginRight: 11 * rem,
            width: 75 * rem,
            aspectRatio: 1,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.00,

            elevation: 1,
        },
        ceThumbnailImg: {
            right: 0,
            top: 0,
            width: 75 * rem,
            aspectRatio: 1,
            borderRadius: 10 * rem,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.00,

            elevation: 1,
        },
        thumbnailIcon: {
            height: 32 * rem,
            width: 32 * rem,
            position: 'absolute',
            color: colors.blue300,
        },
        topLeftHoursContainer: {
            position: 'absolute',
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 60 * rem,
            borderLeftWidth: 60 * rem,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: colors.green500,
            borderTopLeftRadius: 10 * rem,
            // backgroundColor: colors.green500,
            zIndex: 2,
            top: 0,
            left: 0,
        },
        topLeftHours: {
            position: 'absolute',
            color: 'white',
            fontSize: 20 * rem,
            marginTop: 6 * rem,
            marginLeft: 1 * rem,
            width: 30 * rem,
            textAlign: 'center',
            zIndex:3,
        },
        ceInfoContainer: {
            position: 'absolute',
            height: '100%',
            width: '52%',
            justifyContent: 'center',
            marginLeft: 60 * rem,
        },
        ceNameText: {
            fontSize: 18 * rem,
            color: colors.grey800,
            lineHeight: 26 * rem,
        },
        ceDateText: {
            fontSize: 16 * rem,
            color: colors.grey400,
            fontWeight: '300',
            lineHeight: 26 * rem,
        },

        // Photo styling
        modalTransparency: {
            // position: 'absolute',
            backgroundColor: 'rgba(0,0,0, 0.40)',
            height: '100%',
            width: '100%',
        },
        imgContainer: {
            marginTop: (Dimensions.get('window').height / 2) - (screenWidth / 2),
            width: screenWidth,
            aspectRatio: 1,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        loadingText: {
            marginTop: Dimensions.get('window').height / 2,
            color: 'white',
            fontSize: 20 * rem,
            alignSelf: 'center',
        },
    });

    return (
        <>
            <Modal
                visible={isModalVisible}
                animationType='fade'
                transparent={true}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalTransparency} >
                        <TouchableWithoutFeedback
                            onPress={() => setIsModalVisible(false)}
                        >
                            {isLoading ? (
                                <>
                                    <Text style={styles.loadingText}>Loading. . .</Text>
                                    <FastImage
                                        style={{ height: 0, width: 0 }}
                                        source={{
                                            uri: props?.data?.cePhoto,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                        onLoadEnd={() => {
                                            setIsLoading(false);
                                        }}
                                    />
                                </>
                            ) : (
                                    <FastImage
                                        style={styles.imgContainer}
                                        source={{
                                            uri: props?.data?.cePhoto,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                        onLoadEnd={() => {
                                            setIsLoading(false);
                                        }}
                                    />
                                )}
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            <TouchableOpacity
                style={styles.cardContainer}
                onPress={cardPressed}
            >
                <>
                    <View style={styles.topLeftHoursContainer}></View>
                    <Text numberOfLines={1} style={styles.topLeftHours}>{props?.licenseHours ? props?.licenseHours : props?.data?.hours}</Text>
                    <View style={styles.ceInfoContainer}>
                        <Text numberOfLines={2} style={styles.ceNameText}>{props?.data?.name}</Text>
                        <Text style={styles.ceDateText}>{props?.data?.completionDate}</Text>
                    </View>
                    {props?.data?.ceThumbnail ? (
                        <TouchableOpacity
                            style={styles.ceThumbnailContainer}
                            onPress={() => {
                                openImage(props?.data?.cePhoto);
                            }}
                        >
                            <FastImage
                                style={styles.ceThumbnailImg}
                                source={{
                                    uri: props?.data?.ceThumbnail,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                            />
                        </TouchableOpacity>
                    ) : (

                            <TouchableOpacity
                                style={styles.ceThumbnailContainer}
                                onPress={() => {
                                    openScanner();
                                }}
                            >
                                <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                            </TouchableOpacity>
                        )}
                </>
            </TouchableOpacity>
        </>
    );
}