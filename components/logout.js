import auth from '@react-native-firebase/auth';

export default function logout({ navigation, route }) {
    auth().signOut();
    // route.params.setParentState({ isLoggedIn: false });
    return (null);
}