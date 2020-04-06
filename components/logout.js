import firebase from 'firebase';

export default function logout({ navigation }) {
    firebase.auth().signOut();
    navigation.navigate("Login");
    return(null);
}