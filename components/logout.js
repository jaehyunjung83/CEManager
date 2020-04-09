import firebase from 'firebase';

export default function logout({ navigation, route }) {
    firebase.auth().signOut();
    route.params.setParentState({ isLoggedIn: false });
    return (null);
}