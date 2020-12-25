import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCEs } from '../actions';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import FastImage from 'react-native-fast-image'
import CEcard from '../components/ceCard.js';
import LinkExistingCE from "../components/linkExistingCE.js";

import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { colors } from '../components/colors.js';
import Header from '../components/header.js';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';


export default function licenseDetails(props) {
    const navigation = useNavigation();
    const route = useRoute();

    const licenses = useSelector(state => state.licenses);
    const ceData = useSelector(state => state.ces);
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [licenseData, setLicenseData] = useState(props.route.params.data);
    const [requirements, setRequirements] = useState([]);
    const [linkedCEs, setLinkedCEs] = useState({});
    const [selectedImage, setSelectedImage] = useState("");

    const [linkingExistingCEs, setLinkingExistingCEs] = useState(false);

    const [completedCEHours, setCompleteCEHours] = useState(0);

    // Initializing stuff
    React.useEffect(() => {
        // Setting requirements that user assigned to license.
        // Adding in license total CE hours requirement
        if (licenseData["totalCEHours"] || licenseData["requirements"]?.length) {
            let requirementsCopy = JSON.parse(JSON.stringify(licenseData["requirements"]));
            if (licenseData["totalCEHours"]) {
                let completedHours = 0;
                for (linkedCE in licenseData["linkedCEs"]) {
                    completedHours += licenseData["linkedCEs"][linkedCE];
                }
                requirementsCopy.push({
                    key: "5416f212-dd53-4d40-a563-dbc4fede097c",
                    hours: licenseData["totalCEHours"],
                    name: "Total CEs Needed",
                    linkedCEs: licenseData["linkedCEs"],
                    completedHours: completedHours,
                })
            }

            if (typeof licenseData["requirements"] !== "undefined" && licenseData["requirements"].length) {
                // Adding in custom requirements
                for (const requirementIndex in requirementsCopy) {
                    let completedHours = 0;
                    for (linkedCE in requirementsCopy[requirementIndex]["linkedCEs"]) {
                        completedHours += requirementsCopy[requirementIndex]["linkedCEs"][linkedCE];
                    }
                    requirementsCopy[requirementIndex].completedHours = completedHours;
                }
            }
            setRequirements(requirementsCopy);
        }


        let tempCompletedHours = 0;
        for (linkedCE in licenseData["linkedCEs"]) {
            tempCompletedHours += licenseData["linkedCEs"][linkedCE];
        }
        setCompleteCEHours(tempCompletedHours);

        if (typeof licenseData['linkedCEs'] !== 'undefined') {
            setLinkedCEs(licenseData['linkedCEs']);
        }


        // if (typeof licenseData["requirements"] !== "undefined") {
        //     for (const requirement of licenseData["requirements"]) {
        //         if (typeof requirement !== "undefined") {
        //             for (linkedCE in requirement["linkedCEs"]) {
        //                 // let linkedCEsCopy = JSON.parse(JSON.stringify(linkedCEs));
        //                 // linkedCEsCopy[linkedCE] = "?";
        //                 // console.log(`LinkedCEs: ${JSON.stringify(linkedCEsCopy)}`)
        //                 setLinkedCEs(prevState => ({
        //                     ...prevState,
        //                     // [linkedCE]: "?"
        //                     [linkedCE]: requirement["linkedCEs"][linkedCE],
        //                 }));
        //             }
        //         }
        //     }
        // }
    }, [JSON.stringify(licenses)])

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
        if (completedCEHours) {
            progressFill = parseInt(completedCEHours) / parseInt(licenseData.totalCEHours);
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
        navigation.navigate("AddCE", { id: props.route.params.data.id });
    }

    let linkExistingCE = () => {
        setLinkingExistingCEs(!linkingExistingCEs);
    }
    useEffect(() => {
        if (linkingExistingCEs) {
            setLinkingExistingCEs(false);
        }
    }, [linkingExistingCEs])

    let openScanner = () => {
        props.navigation.navigate('Scanner', {
            fromThisScreen: route.name,
            initialFilterId: 1, // Color photo
            licenseId: licenseData.id,
        });
    }

    let openImage = (photoUri) => {
        setSelectedImage(photoUri);
        setIsLoading(true);
        setIsModalVisible(true);
    }

    let openEllipsis = () => {

    }

    let toggleShowRequirements = (requirementID) => {
        let requirementsCopy = JSON.parse(JSON.stringify(requirements));
        for (requirement of requirementsCopy) {
            if (requirement.key == requirementID) {
                if (requirement.expanded) {
                    requirement.expanded = !requirement.expanded;
                }
                else {
                    requirement.expanded = true;
                }
                break;
            }
        }
        setRequirements(requirementsCopy)
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
        progressBarFillComplete: {
            position: 'absolute',
            width: (screenWidth - ((74 + 4) * rem)), // from progressBar
            borderRadius: progressBarWidth,
            height: 18 * rem,
            backgroundColor: colors.green200,
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
            marginRight: 24 * rem,
        },
        noRequirementsText: {
            fontSize: 16 * rem,
            color: colors.grey500,
        },
        requirementContainer: {
            flexDirection: 'row',
            width: screenWidth - (36 * rem),
            lineHeight: 18 * rem,
            // marginBottom: 6 * rem,
        },
        requirementClickableArea: {
            flexDirection: 'row',
            width: screenWidth - (62 * rem),
            lineHeight: 18 * rem,
            marginBottom: 18 * rem,
        },
        requirementName: {
            fontSize: 18 * rem,
            color: colors.grey800,
            marginLeft: 18 * rem,
            flex: 1,
        },
        chevron: {
            width: 20 * rem,
            marginRight: 20 * rem,
            color: colors.grey800,
        },
        requirementHoursDone: {
            fontSize: 18 * rem,
            color: colors.blue800,
            marginLeft: 18 * rem,
        },
        requirementHoursTotal: {
            fontSize: 18 * rem,
            fontWeight: '200',
            color: colors.grey400,
        },
        incompleteIcon: {
            color: colors.grey400,
            opacity: 0.6,
        },
        completeIcon: {
            color: colors.green600,
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
                                    openImage(licenseData.licensePhoto);
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

                                {completedCEHours >= licenseData.totalCEHours ? (
                                    <View style={styles.progressBarFillComplete}></View>
                                ) : (<View style={styles.progressBarFill}></View>
                                    )}

                                {completedCEHours ? (
                                    <Text style={styles.ceText}>{`${completedCEHours}/${licenseData.totalCEHours} CE`}</Text>
                                ) : (
                                        <Text style={styles.ceText}>{`0/${licenseData.totalCEHours} CE`}</Text>
                                    )}
                            </View>
                        </View>
                    ) : (null)}
                </>
            </View>
            <View style={styles.cardButtonsContainer}>
                <TouchableOpacity style={styles.linkButton}
                    onPress={linkExistingCE}>
                    <Text style={styles.linkButtonText}>Link Existing CE</Text>
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
                            <>
                                <TouchableOpacity
                                    onPress={() => {
                                        toggleShowRequirements(item.key);
                                    }}
                                    style={styles.requirementClickableArea}>
                                    <View style={styles.requirementContainer}>
                                        {item.hours <= item.completedHours ? (
                                            // TODO: Add requirement completed check (for non-hours related requiremnets)
                                            <>
                                                <AntDesign name="checkcircleo" size={24 * rem} style={styles.completeIcon} />
                                            </>
                                        ) : (<AntDesign name="checkcircleo" size={24 * rem} style={styles.incompleteIcon} />
                                            )}

                                        {item.hours ? (
                                            <>
                                                <Text style={styles.requirementHoursDone}>{item.completedHours}</Text>
                                                <Text style={styles.requirementHoursTotal}>/{item.hours}hrs</Text>
                                            </>
                                        ) : (null)}
                                        <Text style={styles.requirementName}>{item.name}</Text>
                                        {item.expanded ? (<AntDesign name="up" size={20 * rem} style={styles.chevron} />
                                        ) : (<AntDesign name="down" size={20 * rem} style={styles.chevron} />)}
                                    </View>
                                </TouchableOpacity>
                                {item.expanded ? (
                                    // Requirement is expanded: show linked CE cards
                                    <>
                                        <FlatList
                                            scrollEnabled={false}
                                            style={{ marginTop: 0, marginBottom: 32 * rem, }}
                                            data={Object.keys(item["linkedCEs"]).sort((a, b) => { return new Date(ceData[b].completionDate) - new Date(ceData[a].completionDate) })}
                                            keyExtractor={ce => ce}
                                            renderItem={(ce) => (
                                                <>
                                                    {(typeof item["linkedCEs"] !== "undefined" && ce["item"] in item?.["linkedCEs"]) ||
                                                        (item.key == "5416f212-dd53-4d40-a563-dbc4fede097c" && ce["item"] in licenseData["linkedCEs"])
                                                        ? (
                                                            <CEcard data={ceData?.[ce["item"]]} licenseHours={licenseData["linkedCEs"][ce["item"]]} />
                                                            // <View style={styles.pairedCeContainer}>
                                                            //     <View style={styles.cardContainer}>
                                                            //         <View style={styles.topLeftHoursContainer}></View>
                                                            //         <Text numberOfLines={1} style={styles.topLeftHours}>{item["linkedCEs"][ce["item"]]}</Text>
                                                            //         <View style={styles.ceInfoContainer}>
                                                            //             <Text numberOfLines={2} style={styles.ceNameText}>{ceData?.[ce["item"]]?.name}</Text>
                                                            //             <Text style={styles.ceDateText}>{ceData?.[ce["item"]]?.completionDate}</Text>
                                                            //         </View>
                                                            //         {ceData?.[ce["item"]]?.ceThumbnail ? (
                                                            //             <TouchableOpacity
                                                            //                 style={styles.ceThumbnailContainer}
                                                            //                 onPress={() => {
                                                            //                     openImage(ceData?.[ce["item"]]?.cePhoto);
                                                            //                 }}
                                                            //             >
                                                            //                 <FastImage
                                                            //                     style={styles.ceThumbnailImg}
                                                            //                     source={{
                                                            //                         uri: ceData?.[ce["item"]]?.ceThumbnail,
                                                            //                         priority: FastImage.priority.normal,
                                                            //                     }}
                                                            //                     resizeMode={FastImage.resizeMode.contain}
                                                            //                 />
                                                            //             </TouchableOpacity>
                                                            //         ) : (

                                                            //                 <TouchableOpacity
                                                            //                     style={styles.ceThumbnailContainer}
                                                            //                     onPress={() => {
                                                            //                         props.navigation.navigate('Scanner', {
                                                            //                             fromThisScreen: 'LicenseDetails',
                                                            //                             initialFilterId: 2, // Black & White
                                                            //                             ceID: ceData?.[ce]?.id,
                                                            //                         });
                                                            //                     }}
                                                            //                 >
                                                            //                     <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                                                            //                 </TouchableOpacity>
                                                            //             )}
                                                            //     </View>
                                                            // </View>
                                                        ) : (null)}
                                                </>
                                            )
                                            }>
                                        </FlatList>
                                    </>
                                ) : (null)}
                            </>
                        )}>
                    </FlatList>
                ) : (
                        <Text style={styles.noRequirementsText}>Edit license details to add requirements.</Text>
                    )
                }
            </View >

            <LinkExistingCE open={linkingExistingCEs} licenseID={props.route.params.data.id} />
        </ScrollView >
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