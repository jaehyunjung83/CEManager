import React, {useState} from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as firebase from 'firebase';


export default function scannedView(props) {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    let reScan = () => {
        props.navigation.navigate("Scanner");
    }

    let uploadToFirebase = async () => {
        setIsModalVisible(true);
        const key = uuidv4();
        const userID = firebase.auth().currentUser.uid;
        let fileName = `${key}.jpeg`;
        let imageURI = props.route.params.image;
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(xhr.response);
            };
            xhr.responseType = 'blob';
            xhr.open('GET', imageURI, true);
            xhr.send(null);
        });

        const uploadRef = firebase.storage().ref().child(`userImages/${userID}/${fileName}`).put(blob);

        if (firebase.auth().currentUser) {
            uploadRef.on(
                firebase.storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                    setIsLoading(true);
                    if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
                        // console.log("Successfully uploaded image");
                    }
                },
                error => {
                    setIsLoading(false);
                    console.log("Error occured.");
                    switch (error.code) {
                        case 'storage/unauthorized':
                            console.log(error.code)
                            break;

                        case 'storage/canceled':
                            console.log(error.code)
                            break;

                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            // console.log("Error code: " + error.code)
                            // console.log("Error: " + error.toString());
                            break;
                    }
                },
                () => {
                    uploadRef.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
                        setIsLoading(false);
                        setIsProcessing(true);
                        // console.log('File available at', downloadURL);

                        // const response = await fetch(url, {
                        //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        //     mode: 'cors', // no-cors, *cors, same-origin
                        //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        //     credentials: 'same-origin', // include, *same-origin, omit
                        //     headers: {
                        //       'Content-Type': 'application/json'
                        //       // 'Content-Type': 'application/x-www-form-urlencoded',
                        //     },
                        //     redirect: 'follow', // manual, *follow, error
                        //     referrerPolicy: 'no-referrer', // no-referrer, *client
                        //     body: JSON.stringify(data) // body data type must match "Content-Type" header
                        //   });

                        const response = await fetch('https://us-central1-cetracker-2de23.cloudfunctions.net/createThumbnail', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                imageURL: downloadURL,
                                fileName: fileName,
                                userID: userID,
                            })
                        })
                        let data = await response.text();
                        let Obj = JSON.parse(data);
                        setIsProcessing(false);
                        props.navigation.navigate(props.route.params.fromThisScreen, {
                            thumbnailURL: Obj.thumbnailURL,
                            photoURL: downloadURL,
                        });
                    })
                        .catch((error) => {
                            setIsLoading(false);
                            setIsProcessing(false);
                            // Failed to get downloadURL despite upload succeeding?
                            console.log("Couldn't get downloadURL. Error: " + error.message)
                        });

                }
            )
        }
        else {
            setIsLoading(false);
            setIsProcessing(false);
            console.log("?? Shouldn't be possible.")
        }
    }

    return (
        <View style={styles.container}>
            <Image style={styles.image}
                source={{ uri: props.route.params.image }} />
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => {
                        reScan();
                    }}
                    style={styles.whiteButtonContainer}
                >
                    <AntDesign name="camerao" size={20 * rem} color={colors.blue800} style={styles.icon} />
                    <Text style={styles.reScanText}>Re-Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        uploadToFirebase();
                    }}
                    style={styles.blueButtonContainer}
                >
                    <AntDesign name="check" size={20 * rem} color={'white'} style={styles.icon} />
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>
            {isModalVisible ? (
                <Modal
                    visible={isModalVisible}
                    animationType='fade'
                    transparent={true}
                >
                    <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                        <View style={styles.modalTransparency} />
                    </TouchableWithoutFeedback>
                    <View style={styles.modalPopupContainer}>
                        
                        {isLoading ? (<Text style={styles.statusText}>Uploading. . .</Text>) : (null)}
                        {isProcessing ? (<Text style={styles.statusText}>Processing. . .</Text>) : (null)}
                    </View>
                </Modal>
            ) : (null)}
        </View>
    );
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    image: {
        flex: 9,
        resizeMode: 'contain',
        width: '100%',
    },
    bottomContainer: {
        flex: 1.2,
        width: '100%',
        aspectRatio: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    whiteButtonContainer: {
        flexDirection: 'row',
        height: 50 * rem,
        backgroundColor: 'white',
        borderWidth: 2 * rem,
        borderRadius: 10 * rem,
        borderColor: colors.blue800,
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        padding: 12 * rem,
        paddingLeft: 16 * rem,
        paddingRight: 16 * rem,
        marginLeft: 18 * rem,
    },
    blueButtonContainer: {
        flexDirection: 'row',
        height: 50 * rem,
        backgroundColor: colors.blue800,
        borderRadius: 10 * rem,
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        padding: 12 * rem,
        paddingLeft: 16 * rem,
        paddingRight: 16 * rem,
        marginRight: (18 + 16) * rem,
    },
    icon: {
        height: 20 * rem,
        width: 20 * rem,
        marginRight: 6 * rem,
        alignSelf: 'center',
    },
    reScanText: {
        fontSize: 20 * rem,
        textAlign: 'center',
        color: colors.blue800,
    },
    doneText: {
        fontSize: 18 * rem,
        textAlign: 'center',
        alignSelf: 'center',
        color: 'white',
    },
    modalTransparency: {
        backgroundColor: 'rgba(0,0,0, 0.30)',
        height: '100%',
        width: '100%',
    },
    modalPopupContainer: {
        position: 'absolute',
        minHeight: '20%',
        minWidth: '70%',
        flexGrow: 1,
        marginTop: Dimensions.get('window').height / 2,
        transform: [{ translateY: '-50%', }],
        backgroundColor: 'white',
        alignSelf: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 18 * rem,
        borderRadius: 10 * rem,
    },
    statusText: {
        fontSize: 24 * rem,
        color: colors.blue800,
        textAlign: 'center',
        alignSelf: 'center',
    }
});