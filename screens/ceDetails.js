import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image'
import ApplyTowardLicense from '../components/applyTowardLicense.js';
import { updateLicenses, updateCEs } from '../actions';

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SectionList, FlatList, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import Header from '../components/header.js';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';


export default function ceDetails(props) {
    const navigation = useNavigation();
    const route = useRoute();
    const allCEData = useSelector(state => state.ces);
    const licenses = useSelector(state => state.licenses);
    const dispatch = useDispatch();
    let ceData = allCEData[props.route?.params?.data?.id];
    let licenseID = props.route?.params?.id;

    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
    const [overflowOptions, setOverflowOptions] = useState(["Delete CE"])

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [linkedLicenses, setLinkedLicenses] = useState([]);
    const [applyingTowardsLicense, setApplyingTowardsLicense] = useState(false);

    // Initializing stuff
    React.useEffect(() => {
        setLinkedLicenses([]);
    }, [licenses, allCEData])

    React.useEffect(() => {
        if (!linkedLicenses.length) {
            let linkedLicensesCopy = JSON.parse(JSON.stringify(linkedLicenses));
            let foundLink = false;

            for (const license of Object.keys(licenses)) {
                let requirements = {
                    title: `${licenses[license].licenseState} ${licenses[license].licenseType}`,
                    data: [],
                }

                if (licenses[license].requirements.length) {
                    // Checking if linked to specific requirement
                    for (const requirement of licenses[license].requirements) {
                        for (const linkedCE of Object.keys(requirement["linkedCEs"])) {
                            if (ceData && linkedCE == ceData.id) {
                                let linkedRequirement = {
                                    name: requirement.name,
                                    hours: requirement["linkedCEs"][linkedCE],
                                }
                                requirements.data.push(linkedRequirement);
                            }
                        }
                    }
                }

                if (requirements.data.length > 0) {
                    foundLink = true;
                    linkedLicensesCopy.push(requirements);
                }
            }
            if (foundLink) {
                setLinkedLicenses(linkedLicensesCopy);
            }
            else {
                setLinkedLicenses([{}])
            }
        }
    }, [JSON.stringify(linkedLicenses)])

    let addCE = () => {
        navigation.navigate("EditCE", { ceData: ceData, licenseID: licenseID });
    }

    let applyTowardsLicense = () => {
        setApplyingTowardsLicense(!applyingTowardsLicense);
    }

    useEffect(() => {
        if (applyingTowardsLicense) {
            setApplyingTowardsLicense(false);
        }
    }, [applyingTowardsLicense])

    let handleOverflowOptionPressed = (option) => {
        switch (option) {
            case "Delete CE":
                confirmDeletion();
                break;
            default:
                console.log("option unknown");
        }
    }

    let confirmDeletion = () => {
        Alert.alert(
            "Delete CE",
            "Are you sure? This will delete the CE PERMANENTLY.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { text: "DELETE", onPress: () => handleDeleteCE(), style: "destructive" }
            ],
            { cancelable: true })
    }

    let handleDeleteCE = () => {
        let uid = auth().currentUser.uid;
        let db = firestore();
        const FieldValue = firestore.FieldValue;
        let dataToBeDeleted = { [`${ceData.id}`]: FieldValue.delete() };

        let licensesCopy = JSON.parse(JSON.stringify(licenses));
        for (const id in licensesCopy) {
            for(const requirementID in licensesCopy[id]) {
                if (licensesCopy[id][requirementID].linkedCEs && ceData?.id in licensesCopy[id][requirementID].linkedCEs) {
                    delete licensesCopy[id][requirement].linkedCEs[ceData?.id];
                }
            }
        }
        db.collection('users').doc(uid).collection('CEs').doc('CEData').update(dataToBeDeleted)
            .then(() => {
                db.collection('users').doc(uid).collection('licenses').doc('licenseData').set(licensesCopy)
                    .then(() => {
                        setIsOverflowOpen(false);
                        let ceCopy = JSON.parse(JSON.stringify(allCEData));
                        delete ceCopy[ceData.id];
                        navigation.pop();
                        dispatch(updateCEs(ceCopy));
                    })
            })
            .catch((error) => {
                console.error("Error deleting license: ", error);
            });

    }

    let openScanner = () => {
        navigation.navigate('Scanner', {
            fromThisScreen: route.name,
            initialFilterId: 2, // Black and white photo
            ceID: ceData.id,
        });
    }

    let openImage = (photoUri) => {
        setSelectedImage(photoUri);
        setIsLoading(true);
        setIsModalVisible(true);
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const screenHeight = Math.round(Dimensions.get('window').height);
    const rem = (screenWidth / 380);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'white',
        },

        cardButtonsContainer: {
            flexDirection: 'row',
            width: '100%',
            borderRadius: 10 * rem,
            justifyContent: 'space-evenly',
            top: -(25 * rem),
        },
        whiteButton: {
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
        whiteButtonText: {
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
            alignItems: 'center',
            justifyContent: 'center',
        },
        linkButtonText: {
            color: 'white',
            fontSize: 16 * rem,
            fontWeight: '500',
        },
        modalTransparency: {
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0, 0.40)',
            height: '100%',
            width: '100%',
        },
        ImgContainer: {
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

        ceContainer: {
            backgroundColor: colors.grey200,
            width: screenWidth,
            padding: 18 * rem,
            paddingBottom: 36 * rem,
        },
        topContainer: {
            flexShrink: 1,
            flexDirection: 'row',
            borderRadius: 10 * rem,
        },
        topLeftHoursContainer: {
            position: 'absolute',
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 86 * rem,
            borderLeftWidth: 86 * rem,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: colors.grey200,
            borderLeftColor: 'transparent',
            backgroundColor: colors.green500,
        },
        topLeftHours: {
            position: 'absolute',
            color: 'white',
            fontSize: 20 * rem,
            marginTop: 6 * rem,
            width: 44 * rem,
            textAlign: 'center',
        },
        topLeftHrsText: {
            position: 'absolute',
            color: 'white',
            fontSize: 16 * rem,
            marginTop: 28 * rem,
            width: 42 * rem,
            textAlign: 'center',
        },
        thumbnailContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            width: 75 * rem,
            marginTop: 8 * rem,
            aspectRatio: 1,
            borderRadius: 10 * rem,
            backgroundColor: 'white',
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
            marginLeft: 4 * rem,
            marginTop: 8 * rem,
            marginBottom: 12 * rem,
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
            maxWidth: screenWidth - (168 * rem),
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
        takenDateContainer: {
            paddingTop: 8 * rem,
            flexDirection: 'row',
            alignItems: 'center',
        },
        takenDateText: {
            position: 'relative',
            fontSize: 16 * rem,
            color: colors.grey900,
            fontWeight: '300',
        },

        headerContainer: {
            width: '100%',
            height: 40 * rem,
            marginBottom: 18 * rem,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        },

        linkedLicensesContainer: {
            paddingLeft: (18 + 6) * rem,
            paddingRight: 18 * rem,
        },
        linkedLicense: {
        },
        licenseName: {
            fontWeight: "500",
            marginBottom: 8 * rem,
        },
        requirement: {
            fontStyle: "italic",
            color: colors.grey500,
            marginLeft: 12 * rem,
        },
        hours: {
            fontStyle: "normal",
            color: colors.green600,
        },

        // Overflow menu and option styling
        overflowContainer: {
            backgroundColor: "white",
            position: "absolute",
            display: "flex",
            width: "100%",
            maxHeight: 0.4 * screenHeight,
            bottom: 0,
            borderRadius: 20 * rem,
        },
        optionContainer: {
            flexDirection: 'row',
            minHeight: 50 * rem,
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            borderWidth: 2 * rem,
            borderColor: "transparent",
            borderBottomColor: colors.grey300,
        },
        optionText: {
            fontSize: 16 * rem,
        },
        deleteOptionText: {
            color: "red",
            fontSize: 16 * rem,
        },
    });

    return (
        <ScrollView style={styles.container}>
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
                                            uri: selectedImage,
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
                                        style={styles.ImgContainer}
                                        source={{
                                            uri: selectedImage,
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

            <View style={styles.ceContainer}>

                <View style={styles.topLeftHoursContainer}></View>
                <Text numberOfLines={1} style={styles.topLeftHours}>{ceData?.hours}</Text>
                <Text numberOfLines={1} style={styles.topLeftHrsText}>Hrs</Text>

                <View style={styles.topContainer}>
                    <View style={styles.infoContainer}>
                        <View style={styles.titleContainer}>
                            <View style={{ width: 38 * rem }}></View>
                            {/* <AntDesign name="idcard" size={20 * rem} style={styles.icon} /> */}
                            <Text style={styles.titleText}>{ceData?.name}</Text>
                        </View>
                        {ceData?.providerName ? (
                            <View style={styles.idNumContainer}>
                                <Text style={styles.idNum}>{`Provider Name:${ceData?.providerName}`}</Text>
                            </View>
                        ) : (null)}
                        {ceData?.providerNum ? (
                            <View style={styles.idNumContainer}>
                                <Text style={styles.idNum}>{`Provider #:${ceData?.providerNum}`}</Text>
                            </View>
                        ) : (null)}
                        <View style={styles.takenDateContainer}>
                            <AntDesign name="calendar" size={20 * rem} style={styles.icon} />
                            <Text style={styles.takenDateText}>{`Taken: ${ceData?.completionDate}`}</Text>
                        </View>
                    </View>
                    {ceData?.ceThumbnail ? (
                        <TouchableOpacity
                            style={styles.thumbnailContainer}
                            onPress={() => {
                                openImage(ceData?.cePhoto);
                            }}
                        >
                            <FastImage
                                style={styles.thumbnailImgContainer}
                                source={{
                                    uri: ceData?.ceThumbnail,
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
            </View>

            <View style={styles.cardButtonsContainer}>
                <TouchableOpacity style={styles.linkButton}
                    onPress={applyTowardsLicense}>
                    <Text style={styles.linkButtonText}>Apply Towards Licenses</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whiteButton}
                    onPress={addCE}>
                    {/* <AntDesign
                        name='edit'
                        size={20 * rem}
                        color={colors.blue800}
                    /> */}
                    <Text style={styles.whiteButtonText}> Edit CE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.whiteButton}
                    onPress={() => { setIsOverflowOpen(true) }}>
                    <AntDesign
                        name='ellipsis1'
                        size={20 * rem}
                        color={colors.blue800}
                    />
                </TouchableOpacity>

                <ApplyTowardLicense open={applyingTowardsLicense} id={props.route?.params?.data?.id} />
            </View>

            <View style={styles.headerContainer}>
                <Header text='Applied Toward' />
            </View>

            {linkedLicenses.length && Object.keys(linkedLicenses[0]).length ? (<View style={styles.linkedLicensesContainer}>
                <SectionList
                    scrollEnabled={false}
                    sections={linkedLicenses}
                    keyExtractor={(item, index) => item + index}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.licenseName}>{title}</Text>
                    )}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.requirement}>
                                <Text style={styles.hours}>{item.hours} Hours</Text> {item.name}{"\n"}
                            </Text>
                        </View>
                    )} />
            </View>) : (
                    <View style={styles.linkedLicensesContainer}>
                        <Text style={styles.licenseName}>Not linked to any licenses or certifications.</Text>
                    </View>
                )}

            <Modal visible={isOverflowOpen}
                animationType='slide'
                transparent={true}
            >
                <TouchableWithoutFeedback onPress={() => setIsOverflowOpen(false)}>
                    <View style={styles.modalTransparency} />
                </TouchableWithoutFeedback>
                <View style={styles.overflowContainer}>
                    <FlatList
                        style={{ marginTop: 0, marginBottom: 32 * rem, }}
                        data={overflowOptions}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => { handleOverflowOptionPressed(item) }}
                                style={styles.optionContainer}>
                                {item == "Delete CE" ? (
                                    <Text style={styles.deleteOptionText}>{item}</Text>
                                ) : (
                                        <Text style={styles.optionText}>{item}</Text>
                                    )}
                            </TouchableOpacity>
                        )}>
                    </FlatList>
                </View>
            </Modal>
        </ScrollView >
    );
}