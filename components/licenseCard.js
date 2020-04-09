import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors } from '../components/colors.js';

export default function licenseCard({ navigation }) {

    let addCE = () => {
        // TODO:
    }

    let submitToState = () => {
        // TODO:
    }

    let cardPressed = () => {
        // TODO:
    }

    return (
        <TouchableHighlight
            style={styles.cardContainer}
            onPress={cardPressed}
            underlayColor={colors.underlayColor}
        >
            <>
                <View style={styles.topContainer}>
                    <TouchableOpacity style={styles.thumbnailContainer}>
                        <AntDesign name="camerao" size={40} style={styles.thumbnailIcon} />
                    </TouchableOpacity>
                    <View style={styles.infoContainer}>
                        <View style={styles.titleContainer}>
                            <AntDesign name="idcard" size={20} style={styles.icon} />
                            <Text style={styles.titleText}>RN License (TX)</Text>
                        </View>
                        <View style={styles.idNumContainer}>
                            <Text style={styles.idNum}>#589304502</Text>
                        </View>
                        <View style={styles.expirationContainer}>
                            <AntDesign name="calendar" size={20} style={styles.icon} />
                            <Text style={styles.expirationText}>Exp: March 30, 2020</Text>
                        </View>
                        <View style={styles.status}>
                            <Text style={styles.statusText}>Expired</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.middleContainer}>
                    <View style={styles.ceContainer}>
                        <Entypo name="documents" size={24} style={styles.ceIcon} />
                        <View style={styles.progressBar}>
                            <View style={styles.progressBarFill}></View>
                            <Text style={styles.ceText}>25/30 CE</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.cardButtonsContainer}>
                        <TouchableOpacity style={styles.addCEButton}
                            onPress={addCE}>
                            <Text style={styles.bottomButtonText}>Add CE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitButton}
                            onPress={submitToState}>
                            <Text style={styles.bottomButtonText}>Submit to State</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        </TouchableHighlight>
    );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const progressBarWidth = (screenWidth - (160 * rem)) / 12;

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundGrey,
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
        backgroundColor: colors.backgroundGrey,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 30 * rem,
        width: screenWidth - (32 * rem),
        aspectRatio: 1.5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    topContainer: {
        flex: 5,
        flexDirection: 'row',
    },
    thumbnailContainer: {
        left: 12 * rem,
        top: 12 * rem,
        width: 75 * rem,
        aspectRatio: 1,
        borderRadius: 20 * rem,
        borderColor: colors.mainBlue,
        borderWidth: 2 * rem,
        backgroundColor: colors.backgroundGrey,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnailIcon: {
        height: 40,
        width: 40,
        color: colors.mainBlue,
    },
    infoContainer: {
        flex: 1,
        width: screenWidth - (160 * rem),
        aspectRatio: 2,
        left: (24) * rem,
        top: 12 * rem,
    },
    titleContainer: {
        flexDirection: 'row',
        top: 0,
        left: 0,
        width: screenWidth - (160 * rem),
        aspectRatio: 8,
        alignItems: 'center',
    },
    icon: {
        paddingRight: 6 * rem,
        marginRight: 6 * rem,
        height: 20,
        width: 22,
        color: colors.mainBlue,
    },
    titleText: {
        position: 'relative',
        fontSize: 20 * rem,
        color: colors.darkGrey,
        fontWeight: '500',
        height: '100%',
    },
    idNumContainer: {
        left: 32 * rem,
        width: screenWidth - (190 * rem),
        aspectRatio: 9,
    },
    idNum: {
        fontSize: 16 * rem,
        fontWeight: '200',
        color: 'rgba(108,111,114,1)',
    },
    expirationContainer: {
        flexDirection: 'row',
        top: 0,
        left: 0,
        width: screenWidth - (160 * rem),
        aspectRatio: 8,
        alignItems: 'center',
    },
    expirationText: {
        position: 'relative',
        fontSize: 16 * rem,
        color: colors.darkGrey,
        fontWeight: '300',
    },
    status: {
        left: 32 * rem,
        paddingLeft: 20 * rem,
        paddingRight: 20 * rem,
        height: 24 * rem,
        borderRadius: (24 * rem) / 2,
        backgroundColor: 'rgba(255,224,225,1)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 16 * rem,
        color: 'rgba(123,53,54,1)',
        fontWeight: '500',
    },
    middleContainer: {
        flex: 1,
    },
    ceContainer: {
        height: '100%',
        flexDirection: 'row',
        left: 12 * rem,
        width: screenWidth - (160 * rem),
        aspectRatio: 8,
        alignItems: 'center',
        paddingBottom: 16 * rem,
    },
    ceIcon: {
        height: 26,
        marginRight: 6 * rem,
        color: colors.green,
    },
    ceText: {
        position: 'relative',
        fontSize: 16 * rem,
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        justifyContent: 'center',
        height: '100%',
        lineHeight: 18 * rem,
    },
    progressBar: {
        width: screenWidth - (100 * rem),
        borderColor: colors.green,
        borderRadius: progressBarWidth,
        borderWidth: 2 * rem,
        height: 22 * rem,
        justifyContent: 'center',
    },
    progressBarFill: {
        position: 'absolute',
        left: -2 * rem, // Workaround to get this in the exact same position as the empty progress bar.
        width: (screenWidth - (100 * rem)) * (25 / 30),
        borderColor: 'rgba(1,1,1,0)',
        borderTopLeftRadius: progressBarWidth,
        borderBottomLeftRadius: progressBarWidth,
        borderWidth: 2 * rem,
        height: 22 * rem,
        backgroundColor: colors.green,
    },
    bottomContainer: {
        flex: 3,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
    },
    cardButtonsContainer: {
        top: 0,
        position: 'absolute',
        flex: 1,
        flexDirection: 'row',
        height: 70 * rem,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCEButton: {
        width: 116 * rem,
        aspectRatio: 1,
        maxHeight: 50 * rem,
        backgroundColor: colors.mainBlue,
        borderRadius: 10 * rem,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    submitButton: {
        width: 176 * rem,
        aspectRatio: 1,
        maxHeight: 50 * rem,
        backgroundColor: colors.mainBlue,
        borderRadius: 10 * rem,
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    bottomButtonText: {
        color: 'white',
        fontSize: 18 * rem,
        fontWeight: '500',
        textShadowColor: 'rgba(20, 20, 50, 0.3)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2 * rem,
    },
});