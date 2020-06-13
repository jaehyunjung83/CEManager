import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import FastImage from 'react-native-fast-image'
import Header from '../components/header.js';
import { ScrollView } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';



export default function licenseCard(props) {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [requirements, setRequirements] = useState(props.route.params.data.requirements);
    const [licenseData, setLicenseData] = useState(props.route.params.data);

    // Initializing stuff
    React.useEffect(() => {
        // Allows us to refresh page from other screens.
        if (typeof props.route?.params?.refreshPage !== 'undefined') {
            if (props.route?.params?.refreshPage) {
                props.navigation.setParams({
                    refreshPage: false
                })
                let uid = auth().currentUser.uid;
                let db = firestore();
                db.collection('users').doc(uid).collection('licenses').doc('licenseData').get()
                    .then((response) => {
                        let data = response.data();
                        // Checking if data is empty
                        if (Object.keys(data).length === 0 && data.constructor === Object) {
                            setIsLoading(false);
                        }
                        else {
                            for (const licenseId in data) {
                                if (licenseId === props.route.params.data.id) {
                                    setLicenseData(data[licenseId]);
                                    setRequirements(data[licenseId].requirements);
                                }
                            }
                        }
                    })
                    .catch((error) => {
                        console.log("Error getting document: ", error);
                        setIsLoading(false);
                    });
            }
        }

        // Setting back button to refresh homepage
        props.navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => props.navigation.navigate("Homepage", { refreshPage: true })}
                    style={{
                        width: 60 * rem,
                        paddingLeft: 6 * rem,
                    }}>
                    <AntDesign name="left" size={28 * rem} color={colors.blue800} />
                </TouchableOpacity>
            ),
        })

        // Calculating requirements
        // TODO: Finish calculating.
        if (typeof licenseData['attachedCEs'] !== 'undefined') {
            console.log("Some CEs are attached. Calculating...")
        }
        else {

        }
    }, [])

    // Accounting for if the license type is "Other"
    let licenseTitle = '';
    if (licenseData['licenseType'] === 'Other') {
        const stateAcronym = getStateAcronym(licenseData['licenseState'])
        licenseTitle = `${licenseData['otherLicenseType']} License (${stateAcronym})`;
    }
    else {
        const licenseType = getShortenedTitle(licenseData['licenseType']);
        const stateAcronym = getStateAcronym(licenseData['licenseState'])
        licenseTitle = licenseType + ` License (${stateAcronym})`;
    }

    // Some logic to determine how to fill up progress bar.
    let progressFill = 0;
    if (licenseData.totalCEHours) {
        if (licenseData.completedCEHours) {
            progressFill = parseInt(licenseData.completedCEHours) / parseInt(licenseData.totalCEHours);
            if (progressFill > 0.88) { progressFill = 0.88 }
            else if (progressFill < 0.1) { progressFill = 0.1 }
        }
    }

    // Function for calculating the status and what to display.
    let getStatus = () => {
        const now = new Date().getTime();
        const expiration = new Date(licenseData.licenseExpiration).getTime();
        const diffInDays = (expiration - now) / (1000 * 3600 * 24);
        if (diffInDays > 90) {
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
        // TODO:
    }

    let submitToState = () => {
        // TODO:
    }

    let cardPressed = () => {
        props.navigation.navigate("LicenseDetails", { license: licenseData })
    }

    let openScanner = () => {
        props.navigation.navigate('Scanner', {
            fromThisScreen: "LicenseDetails",
            initialFilterId: 1, // Color photo
            licenseId: licenseData.id,
        });
    }

    let openImage = () => {
        setIsModalVisible(true);
    }

    let openEllipsis = () => {
        // TODO:
    }

    // Used to make element sizes more consistent across screen sizes.
    const screenWidth = Math.round(Dimensions.get('window').width);
    const rem = (screenWidth / 380);

    const progressBarWidth = (screenWidth - (160 * rem)) / 12;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'white',
        },
        licenseContainer: {
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
        thumbnailContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            width: 75 * rem,
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
            width: screenWidth - (74 * rem),
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
        cardButtonsContainer: {
            flexDirection: 'row',
            width: '100%',
            borderRadius: 10 * rem,
            justifyContent: 'space-evenly',
            top: -(25 * rem),
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
        submitButton: {
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
        submitButtonText: {
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
        headerContainer: {
            width: '100%',
            height: 40 * rem,
            marginBottom: 18 * rem,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
        },
        requirementsContainer: {
            marginLeft: 24 * rem,
            marginBottom: 24 * rem,
        },
        noRequirementsText: {
            fontSize: 16 * rem,
            color: colors.grey500,
        },
        requirementContainer: {
            flexDirection: 'row',
            width: screenWidth - (36 * rem),
            lineHeight: 18 * rem,
            marginBottom: 18 * rem,
        },
        requirementName: {
            fontSize: 18 * rem,
            color: colors.grey800,
            marginRight: 6 * rem,
        },
        requirementHoursDone: {
            fontSize: 18 * rem,
            color: colors.blue800,
        },
        requirementHoursTotal: {
            fontSize: 18 * rem,
            fontWeight: '200',
            color: colors.grey400,
        },
        completeIcon: {
            color: colors.green600,
            marginLeft: 18 * rem,
        },
        cardContainer: {
            height: 97 * rem,
            width: screenWidth - (48 * rem),
            borderRadius: 10 * rem,
            backgroundColor: 'white',
            alignSelf: 'center',
            marginBottom: 18 * rem,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,

            elevation: 6,
        },
        ceThumbnailContainer: {
            alignSelf: 'flex-end',
            marginTop: 11 * rem,
            marginRight: 11 * rem,
            width: 75 * rem,
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
        topLeftHoursContainer: {
            position: 'absolute',
            borderTopWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 60 * rem,
            borderLeftWidth: 60 * rem,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: 'white',
            borderLeftColor: 'transparent',
            borderTopLeftRadius: 10 * rem,
            backgroundColor: colors.green500,
        },
        topLeftHours: {
            position: 'absolute',
            color: 'white',
            fontSize: 20 * rem,
            marginLeft: 6 * rem,
            marginTop: 6 * rem,
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
                                            uri: licenseData.licensePhoto,
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
                                            uri: licenseData.licensePhoto,
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
            <View style={styles.licenseContainer}>
                <>
                    <View style={styles.topContainer}>
                        <View style={styles.infoContainer}>
                            <View style={styles.titleContainer}>
                                <AntDesign name="idcard" size={20 * rem} style={styles.icon} />
                                <Text style={styles.titleText}>{licenseTitle}</Text>
                            </View>
                            {licenseData.licenseNum ? (
                                <View style={styles.idNumContainer}>
                                    <Text style={styles.idNum}>{`#${licenseData.licenseNum}`}</Text>
                                </View>
                            ) : (null)}
                            <View style={styles.expirationContainer}>
                                <AntDesign name="calendar" size={20 * rem} style={styles.icon} />
                                <Text style={styles.expirationText}>{`Exp: ${licenseData.licenseExpiration}`}</Text>
                            </View>
                            {getStatus()}
                        </View>
                        {licenseData.licenseThumbnail ? (
                            <TouchableOpacity
                                style={styles.thumbnailContainer}
                                onPress={() => {
                                    openImage();
                                }}
                            >
                                <FastImage
                                    style={styles.thumbnailImgContainer}
                                    source={{
                                        uri: licenseData.licenseThumbnail,
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
                    {licenseData.totalCEHours ? (
                        <View style={styles.ceContainer}>
                            <AntDesign name="copy1" size={20 * rem} style={styles.ceIcon} />
                            <View style={styles.progressBar}>
                                <View style={styles.progressBarFill}></View>
                                {licenseData.completedCEHours ? (
                                    <Text style={styles.ceText}>{`${licenseData.completedCEHours}/${licenseData.totalCEHours} CE`}</Text>
                                ) : (
                                        <Text style={styles.ceText}>{`0/${licenseData.totalCEHours} CE`}</Text>
                                    )}
                            </View>
                        </View>
                    ) : (null)}
                </>
            </View>
            <View style={styles.cardButtonsContainer}>
                <TouchableOpacity style={styles.submitButton}
                    onPress={submitToState}>
                    <Text style={styles.submitButtonText}>Submit to State</Text>
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
                <TouchableOpacity style={styles.addCEButton}
                    onPress={openEllipsis}>
                    <AntDesign
                        name='ellipsis1'
                        size={20 * rem}
                        color={colors.blue800}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.headerContainer}>
                <Header text="Requirements" />
            </View>
            <View style={styles.requirementsContainer}>
                {requirements.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={requirements}
                        keyExtractor={item => item.key}
                        renderItem={({ item }) => (
                            <View style={styles.requirementContainer}>
                                <>
                                    <Text style={styles.requirementName}>{item.name}</Text>
                                </>
                                {item.hours ? (
                                    <>
                                        <Text style={styles.requirementHoursDone}>{item.hours}</Text>
                                        <Text style={styles.requirementHoursTotal}>/{item.hours}hrs</Text>
                                    </>
                                ) : (null)}
                                <AntDesign name="checkcircleo" size={20 * rem} style={styles.completeIcon} />
                            </View>
                        )}>
                    </FlatList>
                ) : (
                        <Text style={styles.noRequirementsText}>Edit license details to add requirements.</Text>
                    )}
            </View>

            <View style={styles.headerContainer}>
                <Header text="Paired CEs" />
            </View>

            <View style={styles.pairedCeContainer}>
                <View style={styles.cardContainer}>
                    <View style={styles.topLeftHoursContainer}></View>
                    <Text style={styles.topLeftHours}>20</Text>
                    <View style={styles.ceInfoContainer}>
                        <Text style={styles.ceNameText}>Bioterrorism</Text>
                        <Text style={styles.ceDateText}>12/20/2020</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.ceThumbnailContainer}
                        onPress={() => {
                            openImage();
                        }}
                    >
                        <FastImage
                            style={styles.ceThumbnailImg}
                            source={{
                                uri: licenseData.licenseThumbnail,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.cardContainer}>

                </View>
            </View>
        </ScrollView>
    );
}

let getShortenedTitle = (longTitle) => {
    switch (longTitle) {
        case "Licensed Vocational Nurse (LVN)":
            return "LVN";
        case "Registered Nurse (RN)":
            return "RN";
        default:
            return "";
    }
}

let getStateAcronym = (stateFullName) => {
    return this.stateList[stateFullName];
}

stateList = {
    'Arizona': 'AZ',
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}