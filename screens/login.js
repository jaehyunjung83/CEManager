import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import blueGradient from '../images/blueGradient.jpg';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'firebase';
import { colors } from '../components/colors.js';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default function login({ navigation, route }) {

      firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        route.params.setParentState({ isLoggedIn: true });
        route.params.setParentState({ isLoading: false });
      }
      else {
        route.params.setParentState({ isLoggedIn: false });
        route.params.setParentState({ isLoading: false });
      }
    });

  const [showPass, setShow] = useState(true);
  const [press, setPress] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonText, setButtonText] = useState("Log In");
  const [error, setError] = useState("");

  const showPassHandler = () => {
    if (press == false) {
      setShow(true);
      setPress(true);
    } else {
      setShow(false);
      setPress(false);
    }
  }

  const loginHandler = () => {
    setButtonText("...");
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        setButtonText("Log In");
        route.params.setParentState({isLoggedIn: true});
      })
      .catch(function (error) {
        setError(error.message);
        setButtonText("Log In");
      });
  }

  const signUpHandler = () => {
    navigation.navigate('SignUp');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header1}>CE<Text style={styles.header2}>Manager</Text></Text>

      <View>
        <Icon name={'ios-person'} size={28} color={'rgba(255, 255, 255, 1)'} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={'Email'}
          placeholderTextColor={'rgba(255, 255, 255, 0.7)'}
          underlineColorAndroid='transparent'
          onChangeText={text => setEmail(text)}
          value={email}
        />
      </View>

      <View>
        <Icon name={'ios-lock'} size={28} color={'rgba(255, 255, 255, 1)'} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={'Password'}
          secureTextEntry={showPass}
          placeholderTextColor={'rgba(255, 255, 255, 0.7)'}
          underlineColorAndroid='transparent'
          onChangeText={text => setPassword(text)}
          value={password}
        />

        <TouchableOpacity style={styles.btnTogglePass}
          onPress={showPassHandler}>
          <Icon name={press == false ? 'ios-eye' : 'ios-eye-off'} size={26} color={'rgba(255, 255, 255, 1)'} />
        </TouchableOpacity>
      </View>

      <Text style={styles.errorText}>{error}</Text>

      <TouchableOpacity style={styles.btnLogin}
        onPress={loginHandler}>
        <Text style={styles.loginText}>{buttonText}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnGetStarted}
        onPress={signUpHandler}>
        <Text style={styles.btnGetStartedText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.bgDesignTop}>
        <Image source={blueGradient} style={styles.bgGradient} />
      </View>

      <View style={styles.bgDesignBottom}>
        <Image source={blueGradient} style={styles.bgGradientBottom} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50 * rem,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.mainBlue,
  },
  bgDesignTop: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: screenWidth + (screenWidth * 1.7),
    aspectRatio: 1,
    borderRadius: screenWidth + (screenWidth * 1.7),
    position: 'absolute',
    left: -(screenWidth * 1.5),
    top: -(screenWidth * 2.3),
    overflow: 'hidden',
  },
  bgDesignBottom: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: (screenWidth * 0.5),
    aspectRatio: 0.9,
    borderRadius: (screenWidth * 0.5),
    position: 'absolute',
    right: -(screenWidth * 0.25),
    bottom: -(screenWidth * 0.35),
    overflow: 'hidden',
  },
  bgGradient: {
    width: '100%',
    height: '100%',
    top: 300 * rem,
  },
  bgGradientBottom: {
    width: '100%',
    height: '100%',
    top: '-30%',
    transform: [{ rotate: '180deg' }]
  },
  header1: {
    fontFamily: 'Helvetica Neue',
    fontWeight: '800',
    color: 'rgba(37,212,251,1)',
    fontSize: 30 * rem,
    marginBottom: 50 * rem,
  },
  header2: {
    fontFamily: 'Helvetica Neue',
    fontWeight: '800',
    color: 'white',
  },
  input: {
    width: screenWidth - (55 * rem),
    aspectRatio: 7,
    borderRadius: 25 * rem,
    fontSize: 16 * rem,
    paddingLeft: 45 * rem,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 25 * rem,
    marginTop: 10 * rem,
  },
  inputIcon: {
    position: 'absolute',
    top: 18 * rem,
    left: 40 * rem,
  },
  btnTogglePass: {
    position: 'absolute',
    top: 18 * rem,
    right: 40 * rem,
  },
  errorText: {
    marginTop: 6 * rem,
    color: 'maroon',
    fontSize: 16 * rem,
    width: screenWidth - 55,
    paddingLeft: 26 * rem,
  },
  btnLogin: {
    width: screenWidth - 55,
    aspectRatio: 7,
    borderRadius: 25 * rem,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginTop: 20 * rem,
  },
  loginText: {
    color: colors.mainBlue,
    fontSize: 20 * rem,
    textAlign: 'center'
  },
  btnGetStarted: {
    width: screenWidth - 55,
    aspectRatio: 7,
    borderRadius: 25 * rem,
    backgroundColor: 'rgba(0,0,0, 0)',
    justifyContent: 'center',
    marginTop: 20 * rem,
  },
  btnGetStartedText: {
    color: 'white',
    fontSize: 20 * rem,
    textAlign: 'center'
  }
});