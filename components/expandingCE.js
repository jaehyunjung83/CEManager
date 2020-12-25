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
    const [isOpen, setIsOpen] = useState(false);
    const ceData = useSelector(state => state.ces);

    const navigation = useNavigation();
    const route = useRoute();

    let cardPressed = () => {
        // TODO: Expand CE details
    }

    let openImage = () => {
        setIsModalVisible(true);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const rem = (screenWidth / 380);
    const ceHeight = isOpen ? 196 * rem : 50 * rem;

    const styles = StyleSheet.create({
        cardContainer: {
            flexGrow: 1,
        },
        ceThumbnailContainer: {
            alignSelf: 'center',
            // marginTop: (11 + 32) * rem,
            marginLeft: 6 * rem,
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
        ceInfoContainer: {
            maxHeight: ceHeight,
            width: 260 * rem,
            paddingTop: 12 * rem,
        },
        ceNameText: {
            fontSize: 18 * rem,
            color: colors.grey800,
            lineHeight: 26 * rem,
            paddingRight: 20 * rem,
            width: '100%',
        },
        chevronUp: {
            position: 'absolute',
            top: 4 * rem,
            right: 0,
            width: 20 * rem,
            paddingLeft: 4 * rem,
            color: colors.green600,
        },
        chevronDown: {
            position: 'absolute',
            top: 4 * rem,
            right: 0,
            width: 20 * rem,
            paddingLeft: 4 * rem,
            color: colors.grey800,
        },
        ceDateText: {
            fontSize: 16 * rem,
            color: colors.grey400,
            fontWeight: '300',
            lineHeight: 26 * rem,
        },
        ceDetailsContainer: {
            width: '60%',
        },
        additionalInfoContainer: {
            flexDirection: 'row',
        },

        // Photo styling
        modalTransparency: {
            // position: 'absolute',
            backgroundColor: 'rgba(0,0,0, 0.40)',
            height: '100%',
            width: '100%',
        },
        imgContainer: {
            marginTop: Dimensions.get('window').height / 2,
            transform: [{ translateY: -screenWidth / 2, }],
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
                onPress={() => { setIsOpen(prevState => !prevState) }}
                underlayColor={colors.underlayColor}
            >
                <>
                    <View style={styles.ceInfoContainer}>
                        <View>
                            <Text numberOfLines={3} style={styles.ceNameText}>{props?.data?.name}</Text>
                            {isOpen ? (
                                <AntDesign name="up" size={20 * rem} style={styles.chevronUp} />
                            ) : (
                                    <AntDesign name="down" size={20 * rem} style={styles.chevronDown} />
                                )}
                        </View>

                        {isOpen &&
                            <View style={styles.additionalInfoContainer}>
                                <View style={styles.ceDetailsContainer}>
                                    <Text style={styles.ceDateText}>{props?.data?.completionDate}</Text>
                                    <Text style={styles.ceDateText}>{props?.data?.hours} <Text style={styles.infoLabel}>Hours</Text></Text>
                                    <Text numberOfLines={2} style={styles.ceDateText}>{props?.data?.providerNum}</Text>
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
                                    ) : (null)}
                            </View>
                        }

                    </View>
                </>
            </TouchableOpacity>
        </>
    );
}