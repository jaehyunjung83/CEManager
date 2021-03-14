import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, Image } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import LinkExistingCE from "./linkExistingCE.js";

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { useSelector, useDispatch } from 'react-redux';
import { updateCertifications } from '../actions';

export default function certificationCard(props) {
    const certifications = useSelector(state => state.certifications);
    const accountData = useSelector(state => state.accountData);
    const certificationID = props.data;
    const certificationData = certifications[certificationID];

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [completedCEHours, setCompletedCEHours] = useState(0);
    const [totalCEHoursNeeded, setTotalCEHoursNeeded] = useState(0);

    const [linkingExistingCEs, setLinkingExistingCEs] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        let tempCompletedHours = 0;
        let found = false;
        for (const requirement of certificationData.requirements) {
            if (requirement.name !== "Total CEs Needed") continue;

            found = true;
            setTotalCEHoursNeeded(requirement.hours);
            if (requirement.linkedCEs && Object.keys(requirement.linkedCEs).length) {
                for (const linkedCE in requirement.linkedCEs) {
                    tempCompletedHours += requirement["linkedCEs"][linkedCE];
                }
            }
        }
        if(!found) {
            setTotalCEHoursNeeded(0);
        }
        setCompletedCEHours(tempCompletedHours);
    }, [JSON.stringify(certifications)]);

    // Some logic to determine how to fill up progress bar.
    let progressFill = 0;
    for (const requirement of certificationData.requirements) {
        if (requirement.name !== "Total CEs Needed") continue;
        if (completedCEHours) {
            progressFill = parseInt(completedCEHours) / parseInt(requirement.hours);
            if (progressFill > 0.88 && progressFill < 1) { progressFill = 0.88 }
            else if (progressFill < 0.1) { progressFill = 0.1 }
            // else if (progressFill > 1) { progressFill = 0.92 }
        }
    }

    // Function for calculating the status and what to display.
    let getStatus = () => {
        const now = new Date().getTime();
        const expiration = new Date(certificationData.expiration).getTime();
        const diffInDays = (expiration - now) / (1000 * 3600 * 24);
        if(certificationData?.complete) {
            return (
                <View style={styles.statusBlue}>
                    <Text style={styles.statusTextBlue}>Complete</Text>
                </View>
            )
        }
        else if (diffInDays > 90) {
            return (
                <View style={styles.statusGreen}>
                    <Text style={styles.statusTextGreen}>Up to date</Text>
                </View>
            );
        }
        else if (diffInDays <= 90 && diffInDays > 0) {
            return (
                <View style={styles.statusYellow}>
                    <Text style={styles.statusTextYellow}>Expiring soon</Text>
                </View>
            );
        }
        else {
            return (
                <View style={styles.statusRed}>
                    <Text style={styles.statusTextRed}>Overdue</Text>
                </View>
            );
        }
    }

    let addCE = () => {
        navigation.navigate("AddCE", { certificationID: certificationData.id });
    }

    let linkExistingCE = () => {
        setLinkingExistingCEs(!linkingExistingCEs);
    }
    useEffect(() => {
        if (linkingExistingCEs) {
            setLinkingExistingCEs(false);
        }
    }, [linkingExistingCEs])

    let cardPressed = () => {
        navigation.navigate("CertificationDetails", { id: certificationData.id });
    }

    let openScanner = () => {
        navigation.navigate('Scanner', {
            fromThisScreen: route.name,
            initialFilterId: 1, // Color photo
            certificationId: certificationData.id,
        });
    }

    let openImage = () => {
        setIsModalVisible(true);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const rem = (screenWidth / 380);

    const progressBarWidth = (screenWidth - (160 * rem)) / 12;

    const styles = StyleSheet.create({
        cardContainer: {
            flexShrink: 1,
            backgroundColor: 'white',
            borderRadius: 10 * rem,
            width: screenWidth - (32 * rem),
            marginLeft: 16 * rem,
            marginRight: 16 * rem,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,

            elevation: 6,
            padding: 18 * rem,
            marginTop: 28 * rem,
            marginBottom: 8 * rem,
        },
        topContainer: {
            flexShrink: 1,
            flexDirection: 'row',
            borderRadius: 10 * rem,
        },
        thumbnailContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
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
        thumbnailImgContainer: {
            position: 'absolute',
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
        infoContainer: {
            flexShrink: 1,
        },
        titleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        icon: {
            marginRight: 18 * rem,
            height: 20 * rem,
            width: 20 * rem,
            color: colors.blue800,
        },
        titleText: {
            position: 'relative',
            fontSize: 22 * rem,
            color: colors.grey900,
            fontWeight: '500',
            height: '100%',
            maxWidth: screenWidth - (186 * rem)
        },
        idNumContainer: {
            left: 38 * rem,
        },
        idNum: {
            fontSize: 14 * rem,
            fontWeight: '200',
            letterSpacing: 0.6 * rem,
            color: colors.grey500,
        },
        expirationContainer: {
            paddingTop: 8 * rem,
            flexDirection: 'row',
            alignItems: 'center',
        },
        expirationText: {
            position: 'relative',
            fontSize: 16 * rem,
            color: colors.grey900,
            fontWeight: '300',
        },
        statusBlue: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.blue800,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextBlue: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: 'white',
            fontWeight: '500',
        },
        statusGreen: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.green200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextGreen: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.green900,
            fontWeight: '500',
        },
        statusYellow: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.yellow200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextYellow: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.yellow800,
            fontWeight: '500',
        },
        statusRed: {
            flexShrink: 1,
            left: 38 * rem,
            borderRadius: (24 * rem) / 2,
            backgroundColor: colors.red200,
            justifyContent: 'center',
            alignSelf: 'flex-start',
            marginBottom: 12 * rem,
        },
        statusTextRed: {
            paddingLeft: 12 * rem,
            paddingRight: 12 * rem,
            marginTop: 4 * rem,
            marginBottom: 4 * rem,
            fontSize: 16 * rem,
            color: colors.red800,
            fontWeight: '500',
        },
        ceContainer: {
            paddingBottom: 12 * rem,
            flexShrink: 1,
            flexDirection: 'row',
        },
        ceIcon: {
            height: 20 * rem,
            width: 20 * rem,
            color: colors.blue800,
        },
        ceText: {
            fontSize: 16 * rem,
            color: colors.blue800,
            fontWeight: '500',
            textAlign: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
        },
        progressBar: {
            marginLeft: 18 * rem,
            width: screenWidth - (112 * rem),
            borderColor: colors.blue800,
            borderRadius: progressBarWidth,
            borderWidth: 2 * rem,
            height: 22 * rem,
            justifyContent: 'center',
        },
        progressBarFill: {
            position: 'absolute',
            width: (screenWidth - (96 * rem)) * (progressFill),
            borderTopLeftRadius: progressBarWidth,
            borderBottomLeftRadius: progressBarWidth,
            height: 18 * rem,
            backgroundColor: 'rgba(208,233,251,1)',
        },
        progressBarFillComplete: {
            position: 'absolute',
            width: (screenWidth - ((112 + 4) * rem)), // from progressBar
            borderRadius: progressBarWidth,
            height: 18 * rem,
            backgroundColor: colors.green200,
        },
        insetDivider: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: 2 * rem,
            width: '100%',
            backgroundColor: colors.grey200,
        },
        leftInset: {
            height: 2 * rem,
            width: 18 * rem,
            backgroundColor: 'white',
        },
        rightInset: {
            height: 2 * rem,
            width: 18 * rem,
            backgroundColor: 'white',
        },
        cardButtonsContainer: {
            flexGrow: 1,
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            borderRadius: 10 * rem,
            justifyContent: 'space-between',
            paddingTop: 12 * rem,
        },
        addCEButton: {
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            flexDirection: 'row',
            borderRadius: 10 * rem,
            borderWidth: 2 * rem,
            borderColor: colors.blue800,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
        },
        addCEText: {
            color: colors.blue800,
            fontSize: 16 * rem,
            fontWeight: '500',
        },
        linkButton: {
            flexDirection: 'row',
            padding: 18 * rem,
            paddingTop: 12 * rem,
            paddingBottom: 12 * rem,
            height: 50 * rem,
            backgroundColor: colors.blue800,
            borderRadius: 10 * rem,
            marginRight: 12 * rem,
            alignItems: 'center',
            justifyContent: 'center',
        },
        linkButtonText: {
            color: 'white',
            fontSize: 16 * rem,
            fontWeight: '500',
        },
        modalTransparency: {
            backgroundColor: 'rgba(0,0,0, 0.40)',
            height: '100%',
            width: '100%',
        },
        imgContainer: {
            position: 'absolute',
            marginTop: (Dimensions.get('window').height / 2) - (screenWidth / 2),
            width: screenWidth,
            aspectRatio: 1,
            backgroundColor: 'black',
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
                                    <FastImage
                                        style={styles.imgContainer}
                                        source={{
                                            uri: certificationData.photo,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                        onLoadEnd={() => {
                                            setIsLoading(false);
                                        }}
                                    />
                                    <Text style={styles.loadingText}>Loading. . .</Text>
                                </>
                            ) : (
                                    <FastImage
                                        style={styles.imgContainer}
                                        source={{
                                            uri: certificationData.photo,
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
                underlayColor={colors.underlayColor}
            >
                <>
                    <View style={styles.topContainer}>
                        <View style={styles.infoContainer}>
                            <View style={styles.titleContainer}>
                                <AntDesign name="idcard" size={20 * rem} style={styles.icon} />
                                <Text style={styles.titleText}>{certifications[certificationID].name}</Text>
                            </View>
                            {certificationData.certificationNum ? (
                                <View style={styles.idNumContainer}>
                                    <Text style={styles.idNum}>{`#${certificationData.certificationNum}`}</Text>
                                </View>
                            ) : (null)}
                            <View style={styles.expirationContainer}>
                                <AntDesign name="calendar" size={20 * rem} style={styles.icon} />
                                <Text style={styles.expirationText}>{`Exp: ${certificationData.expiration}`}</Text>
                            </View>
                            {getStatus()}
                        </View>
                        {certificationData.thumbnail ? (
                            <TouchableOpacity
                                style={styles.thumbnailContainer}
                                onPress={() => {
                                    openImage();
                                }}
                            >
                                <FastImage
                                    style={styles.thumbnailImgContainer}
                                    source={{
                                        uri: certificationData.thumbnail,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.contain}
                                />
                            </TouchableOpacity>
                        ) : (
                                <TouchableOpacity
                                    style={styles.thumbnailContainer}
                                    onPress={openScanner}
                                >
                                    <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                                </TouchableOpacity>
                            )}
                    </View>
                    {totalCEHoursNeeded ? (
                        <View style={styles.ceContainer}>
                            <AntDesign name="copy1" size={20 * rem} style={styles.ceIcon} />
                            <View style={styles.progressBar}>
                                {completedCEHours >= totalCEHoursNeeded ? (
                                    <View style={styles.progressBarFillComplete}></View>
                                ) : (<View style={styles.progressBarFill}></View>
                                    )}
                                {completedCEHours ? (
                                    <Text style={styles.ceText}>{`${completedCEHours}/${totalCEHoursNeeded} CE`}</Text>
                                ) : (
                                        <Text style={styles.ceText}>{`0/${totalCEHoursNeeded} CE`}</Text>
                                    )}
                            </View>
                        </View>
                    ) : (null)}

                    <View style={styles.insetDivider}>
                        <View style={styles.leftInset} />
                        <View style={styles.rightInset} />
                    </View>
                    <View style={styles.cardButtonsContainer}>
                        <TouchableOpacity style={styles.linkButton}
                            onPress={linkExistingCE}>
                            <Text style={styles.linkButtonText}>Apply Existing CE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addCEButton}
                            onPress={addCE}>
                            <AntDesign
                                name='addfile'
                                size={20 * rem}
                                color={colors.blue800}
                            />
                            <Text style={styles.addCEText}> Add CE</Text>
                        </TouchableOpacity>
                    </View>
                    <LinkExistingCE open={linkingExistingCEs} certificationID={certificationData.id} />
                </>

            </TouchableOpacity>
        </>
    );
}
