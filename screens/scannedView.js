import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLicenses, updateCertifications, updateCEs } from '../actions';
import { Text, View, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../components/colors.js';
import AntDesign from 'react-native-vector-icons/AntDesign';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export default function scannedView(props) {
    const licenseID = props.route?.params?.licenseId;
    const certificationID = props.route?.params?.certificationID;
    const ceID = props.route?.params?.ceID;

    const licenses = useSelector(state => state.licenses);
    const dispatch = useDispatch();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorUploading, setErrorUploading] = useState(false);

    let reScan = () => {
        props.navigation.navigate("Scanner");
    }

    let uploadToFirebaseAndCreateThumbnail = async () => {
        setIsModalVisible(true);
        setIsLoading(true);
        const key = uuidv4();
        const userID = auth().currentUser.uid;
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

        const uploadRef = storage().ref().child(`userImages/${userID}/${fileName}`);
        const uploading = storage().ref().child(`userImages/${userID}/${fileName}`).put(blob);

        if (auth().currentUser) {
            uploading.on(
                storage.TaskEvent.STATE_CHANGED,
                snapshot => {
                    setIsLoading(true);
                    if (snapshot.state === storage.TaskState.SUCCESS) {
                        console.log("Successfully uploaded image");
                    }
                },
                error => {
                    setIsLoading(false);
                    setIsProcessing(false);
                    setErrorUploading(true);
                    console.log("Error occured.");
                    switch (error.code) {
                        case 'storage/unauthorized':
                            console.log(error.code)
                            const uid = auth().currentUser.uid;
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
                    uploading.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
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
                        console.log(data);
                        let Obj = JSON.parse(data);

                        if (licenseID || certificationID || ceID) {
                            let collection = "";
                            let doc = "";
                            let photoFieldName = "";
                            let thumbnailFieldName = "";
                            let dispatchType = null;
                            let objID = licenseID || certificationID || ceID;

                            if (licenseID) {
                                console.log("Updating existing license");

                                collection = "licenses";
                                doc = "licenseData";
                                photoFieldName = "licensePhoto";
                                thumbnailFieldName = "licenseThumbnail";
                                dispatchType = updateLicenses;
                            }
                            else if (certificationID) {
                                console.log("Updating existing certification");

                                collection = "certifications";
                                doc = "certificationData";
                                photoFieldName = "photo";
                                thumbnailFieldName = "thumbnail";
                                dispatchType = updateCertifications;
                            }
                            else if (ceID) {
                                console.log("Updating existing CE");

                                collection = "CEs";
                                doc = "CEData";
                                photoFieldName = "cePhoto";
                                thumbnailFieldName = "ceThumbnail";
                                dispatchType = updateCEs;
                            }
                            let uid = auth().currentUser.uid;
                            let db = firestore();

                            db.collection('users').doc(uid).collection(collection).doc(doc).get()
                                .then((response) => {

                                    let data = response.data();
                                    if (data) {
                                        // Checking for and deleting old photos from storage.
                                        if (data[objID][photoFieldName]) {
                                            // User is replacing old photo. Delete old one.
                                            const firstPhotoRef = storage().refFromURL(data[objID][photoFieldName]).toString();
                                            const oldPhotoPath = firstPhotoRef.replace('gs://cetracker-2de23', '');
                                            const oldPhotoRef = storage().ref().child(`${oldPhotoPath}`);
                                            oldPhotoRef.delete()
                                                .then(() => {
                                                    console.log("Deleted photo successfully.");
                                                })
                                                .catch(error => {
                                                    console.log("Failed to delete old photo. Error: " + error.toString());
                                                })
                                        }
                                        if (data[objID][thumbnailFieldName]) {
                                            // User is replacing old thumbnail. Delete old one.
                                            // Firebase couldn't parse the URL for some reason.
                                            // const oldThumbnailRef = storage().refFromURL(licenseThumbnail);
                                            const oldThumbnailPath = data[objID][thumbnailFieldName].replace('https://storage.googleapis.com/cetracker-2de23.appspot.com/', '');
                                            const oldThumbnailRef = storage().ref().child(`${oldThumbnailPath}`);

                                            oldThumbnailRef.delete()
                                                .then(() => {
                                                    console.log("Deleted thumbnail successfully.");
                                                })
                                                .catch(error => {
                                                    console.log("Failed to delete old thumbnail. Error: " + error.toString());
                                                })
                                        }

                                        // Updating database with links to new photo and thumbnail URLs.
                                        data[objID][photoFieldName] = downloadURL;
                                        data[objID][thumbnailFieldName] = Obj.thumbnailURL;
                                        db.collection('users').doc(uid).collection(collection).doc(doc).set(data, { merge: true })
                                            .then(() => {
                                                dispatch(dispatchType(data));
                                                props.navigation.navigate(props.route.params.fromThisScreen);
                                            })
                                            .catch((error) => {
                                                console.log("Updating obj failed. " + error);
                                                setIsModalVisible(true);
                                                setIsProcessing(false);
                                                setIsLoading(false);
                                                setErrorUploading(true);
                                            })
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error getting document: ", error);
                                    setIsModalVisible(true);
                                    setIsProcessing(false);
                                    setIsLoading(false);
                                    setErrorUploading(true);
                                });
                        }
                        // else if (typeof props.route?.params?.ceID !== 'undefined') {
                        //     // ceID was passed, updating scan of CE.
                        //     let uid = auth().currentUser.uid;
                        //     let db = firestore();

                        //     db.collection('users').doc(uid).collection('CEs').doc('CEData').get()
                        //         .then((response) => {

                        //             let data = response.data();
                        //             if (data) {
                        //                 // Checking for and deleting old photos from storage.
                        //                 if (data[props.route?.params?.ceID].cePhoto) {
                        //                     // User is replacing old photo. Delete old one.
                        //                     const cePhoto = data[props.route?.params?.ceID].cePhoto;
                        //                     const firstPhotoRef = storage().refFromURL(cePhoto).toString();
                        //                     const oldPhotoPath = firstPhotoRef.replace('gs://cetracker-2de23', '');
                        //                     const oldPhotoRef = storage().ref().child(`${oldPhotoPath}`);
                        //                     oldPhotoRef.delete()
                        //                         .then(() => {
                        //                             console.log("Deleted photo successfully.");
                        //                         })
                        //                         .catch(error => {
                        //                             console.log("Failed to delete old photo. Error: " + error.toString());
                        //                         })
                        //                 }
                        //                 if (data[props.route?.params?.licenseId]?.ceThumbnail) {
                        //                     // User is replacing old thumbnail. Delete old one.
                        //                     // Firebase couldn't parse the URL for some reason.
                        //                     const oldThumbnailPath = ceThumbnail.replace('https://storage.googleapis.com/cetracker-2de23.appspot.com/', '');
                        //                     const oldThumbnailRef = storage().ref().child(`${oldThumbnailPath}`);

                        //                     oldThumbnailRef.delete()
                        //                         .then(() => {
                        //                             console.log("Deleted thumbnail successfully.");
                        //                         })
                        //                         .catch(error => {
                        //                             console.log("Failed to delete old thumbnail. Error: " + error.toString());
                        //                         })
                        //                 }

                        //                 // Updating database with links to new photo and thumbnail URLs.
                        //                 data[props.route?.params?.ceID].filePath = Obj.filePath;
                        //                 data[props.route?.params?.ceID].cePhoto = downloadURL;
                        //                 data[props.route?.params?.ceID].ceThumbnail = Obj.thumbnailURL;
                        //                 db.collection('users').doc(uid).collection('CEs').doc('CEData').set(data, { merge: true })
                        //                     .then(() => {
                        //                         dispatch(updateCEs(data));
                        //                         props.navigation.navigate(props.route.params.fromThisScreen);
                        //                     })
                        //                     .catch((error) => {
                        //                         console.log("Updating license failed. " + error);
                        //                         setIsModalVisible(true);
                        //                         setIsProcessing(false);
                        //                         setIsLoading(false);
                        //                         setErrorUploading(true);
                        //                     })
                        //             }
                        //         })
                        //         .catch((error) => {
                        //             console.error("Error getting document: ", error);
                        //             setIsModalVisible(true);
                        //             setIsProcessing(false);
                        //             setIsLoading(false);
                        //             setErrorUploading(true);
                        //         });
                        // }
                        else {
                            // Uploading new license/CE/whatever, returning to previous screen.
                            setIsProcessing(false);
                            setIsModalVisible(false);
                            props.navigation.navigate(props.route.params.fromThisScreen, {
                                thumbnailURL: Obj.thumbnailURL,
                                photoURL: downloadURL,
                                bucket: Obj.bucket,
                                filePath: Obj.filePath,
                            });
                        }
                    })
                        .catch((error) => {
                            setIsLoading(false);
                            setIsProcessing(false);
                            setIsModalVisible(true);
                            setErrorUploading(true);
                            uploadRef.delete();
                            // Failed to get downloadURL despite upload succeeding?
                            console.log("Couldn't get downloadURL. Error: " + error.message);
                        });

                }
            )
        }
        else {
            setIsLoading(false);
            setIsProcessing(false);
            setIsModalVisible(true);
            setErrorUploading(true);
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
                        props.navigation.navigate(props.route.params.fromThisScreen);
                    }}
                    style={styles.whiteButtonContainer}
                >
                    {/* <AntDesign name="check" size={18 * rem} color={'white'} style={styles.icon} /> */}
                    <Text style={styles.reScanText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        reScan();
                    }}
                    style={styles.whiteButtonContainer}
                >
                    <AntDesign name="camerao" size={18 * rem} color={colors.blue800} style={styles.icon} />
                    <Text style={styles.reScanText}>Re-Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        uploadToFirebaseAndCreateThumbnail();
                    }}
                    style={styles.blueButtonContainer}
                >
                    <AntDesign name="check" size={18 * rem} color={'white'} style={styles.icon} />
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>
            {isModalVisible ? (
                <Modal
                    visible={isModalVisible}
                    animationType='fade'
                    transparent={true}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        margin: 0,
                    }}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalTransparency} />
                        </TouchableWithoutFeedback>
                        <View style={styles.modalPopupContainer}>

                            {isLoading ? (<Text style={styles.statusText}>Uploading. . .</Text>) : (null)}
                            {isProcessing ? (<Text style={styles.statusText}>Processing. . .</Text>) : (null)}
                            {errorUploading ? (
                                <>
                                    <Text style={styles.statusText}>Something went wrong. {"\n"}Please try again later</Text>
                                    <TouchableOpacity
                                        style={styles.okErrorButton}
                                        onPress={() => {
                                            setIsModalVisible(false);
                                            props.navigation.navigate(props.route.params.fromThisScreen);
                                        }}><Text style={styles.statusText}>OK</Text></TouchableOpacity>
                                </>
                            ) : (null)}
                        </View>
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
        backgroundColor: colors.grey200,
    },
    image: {
        flex: 9,
        resizeMode: 'contain',
        width: '100%',
        margin: 18 * rem,
        backgroundColor: colors.grey200,
        alignSelf: 'center',
    },
    bottomContainer: {
        width: '100%',
        aspectRatio: 5,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12 * rem,
        paddingRight: 12 * rem,
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
    },
    icon: {
        height: 18 * rem,
        width: 18 * rem,
        marginRight: 6 * rem,
        alignSelf: 'center',
    },
    reScanText: {
        fontSize: 16 * rem,
        textAlign: 'center',
        color: colors.blue800,
    },
    doneText: {
        fontSize: 16 * rem,
        textAlign: 'center',
        alignSelf: 'center',
        color: 'white',
    },
    modalTransparency: {
        backgroundColor: 'rgba(0,0,0, 0.50)',
        height: '100%',
        width: '100%',
        position: 'absolute',
    },
    modalPopupContainer: {
        minWidth: '70%',
        flexShrink: 1,
        backgroundColor: 'white',
        padding: 18 * rem,
        borderRadius: 10 * rem,
    },
    statusText: {
        fontSize: 24 * rem,
        color: colors.blue800,
        textAlign: 'center',
        alignSelf: 'center',
    },
    okErrorButton: {
        marginTop: 18 * rem,
        borderWidth: 2 * rem,
        borderRadius: 10 * rem,
        borderColor: colors.blue800,
        padding: 12 * rem,
    },
});