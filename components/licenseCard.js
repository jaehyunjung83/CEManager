import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
                    <View style={styles.infoContainer}>
                        <View style={styles.titleContainer}>
                            <AntDesign name="idcard" size={20 * rem} style={styles.icon} />
                            <Text style={styles.titleText}>RN License (TX)</Text>
                        </View>
                        <View style={styles.idNumContainer}>
                            <Text style={styles.idNum}>#589304502</Text>
                        </View>
                        <View style={styles.expirationContainer}>
                            <AntDesign name="calendar" size={20 * rem} style={styles.icon} />
                            <Text style={styles.expirationText}>Exp: March 30, 2020</Text>
                        </View>
                        <View style={styles.status}>
                            <Text style={styles.statusText}>Up to date</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.thumbnailContainer}>
                        <AntDesign name="camerao" size={32 * rem} style={styles.thumbnailIcon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.ceContainer}>
                    <AntDesign name="copy1" size={20 * rem} style={styles.ceIcon} />
                    <View style={styles.progressBar}>
                        <View style={styles.progressBarFill}></View>
                        <Text style={styles.ceText}>25/30 CE</Text>
                    </View>
                </View>
                <View style={styles.insetDivider}>
                    <View style={styles.leftInset} />
                    <View style={styles.rightInset} />
                </View>
                <View style={styles.cardButtonsContainer}>
                    {/* <TouchableOpacity style={styles.submitButton}
                            onPress={submitToState}>
                            <Text style={styles.submitButtonText}>Submit to State</Text>
                        </TouchableOpacity> */}
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
            </>
        </TouchableHighlight>
    );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const progressBarWidth = (screenWidth - (160 * rem)) / 12;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: colors.grey200,
    },
    cardContainer: {
        flexShrink: 1,
        backgroundColor: 'white',
        borderRadius: 10 * rem,
        width: screenWidth - (32 * rem),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 18 * rem,
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
    thumbnailIcon: {
        height: 32 * rem,
        width: 32 * rem,
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
        fontSize: 24 * rem,
        color: colors.grey900,
        fontWeight: '500',
        height: '100%',
    },
    idNumContainer: {
        left: 38 * rem,
    },
    idNum: {
        fontSize: 14 * rem,
        fontWeight: '200',
        letterSpacing: 0.6 * rem,
        color: 'rgba(108,111,114,1)',
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
    status: {
        flexShrink: 1,
        left: 38 * rem,
        borderRadius: (24 * rem) / 2,
        backgroundColor: colors.green200,
        justifyContent: 'center',
        alignSelf: 'flex-start',
    },
    statusText: {
        paddingLeft: 12 * rem,
        paddingRight: 12 * rem,
        marginTop: 4 * rem,
        marginBottom: 4 * rem,
        fontSize: 16 * rem,
        color: colors.green900,
        fontWeight: '500',
    },
    ceContainer: {
        paddingTop: 12 * rem,
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
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        justifyContent: 'center',
        height: '100%',
        lineHeight: 18 * rem,
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
        left: -2 * rem, // Workaround to get this in the exact same position as the empty progress bar.
        width: (screenWidth - (100 * rem)) * (25 / 30),
        borderColor: 'rgba(1,1,1,0)',
        borderTopLeftRadius: progressBarWidth,
        borderBottomLeftRadius: progressBarWidth,
        borderWidth: 2 * rem,
        height: 22 * rem,
        backgroundColor: colors.blue800,
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
        justifyContent: 'center',
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
        fontSize: 20 * rem,
        fontWeight: '500',
    },
    submitButton: {
        flexDirection: 'row',
        width: 176 * rem,
        aspectRatio: 1,
        maxHeight: 50 * rem,
        backgroundColor: colors.blue800,
        borderRadius: 10 * rem,
        marginLeft: 12 * rem,
        marginRight: 12 * rem,
        top: 12 * rem,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 19 * rem,
        fontWeight: '500',
    },
});