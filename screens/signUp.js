import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import blueGradient from '../images/blueGradient.jpg';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'firebase';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth/380);

export default function signUp( { navigation }) {

  const [showPass, setShow] = useState(true);
  const [press, setPress] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonText, setButtonText] = useState("Create Account");
  const [error, setError] = useState("");

  const showPassHandler = () => {
    if (press == false) {
      setShow(false);
      setPress(true);
    } else {
      setShow(true);
      setPress(false);
    }
  }

  const signUpHandler = () => {
    setButtonText("...");
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      navigation.navigate('Home');
    }).catch(function(error) {
      // Handle Errors here.
      setError(error.message);
      setButtonText("Create Account");
    })
  }

  const logInHandler = () => {
    navigation.pop();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header1}>Sign<Text style={styles.header2}>Up</Text></Text>

      <View>
        <Icon name={'ios-person'} size={28*rem} color={'rgba(255, 255, 255, 1)'} style={styles.inputIcon} />
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
        <Icon name={'ios-lock'} size={28*rem} color={'rgba(255, 255, 255, 1)'} style={styles.inputIcon} />
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

      <TouchableOpacity style={styles.btnSignUp}
        onPress={signUpHandler}>
        <Text style={styles.signUpText}>{buttonText}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.btnBack}
        onPress={logInHandler}>
        <Text style={styles.btnBackText}>Back</Text>
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
    paddingTop: 50*rem,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0055a5',
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
    aspectRatio: 1,
    borderRadius: (screenWidth * 0.5),
    position: 'absolute',
    right: -(screenWidth * 0.25),
    bottom: -(screenWidth * 0.35),
    overflow: 'hidden',
  },
  bgGradient: {
    width: '100%',
    height: '100%',
    top: 300*rem,
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
    fontSize: 30*rem,
    marginBottom: 50*rem,
  },
  header2: {
    fontFamily: 'Helvetica Neue',
    fontWeight: '800',
    color: 'white',
  },
  input: {
    width: screenWidth - (55*rem),
    aspectRatio: 7,
    borderRadius: 25*rem,
    fontSize: 16*rem,
    paddingLeft: 45*rem,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 25*rem,
    marginTop: 10*rem,
  },
  inputIcon: {
    position: 'absolute',
    top: 18*rem,
    left: 40*rem,
  },
  btnTogglePass: {
    position: 'absolute',
    top: 18*rem,
    right: 40*rem,
  },
  btnSignUp: {
    width: screenWidth - (55*rem),
    height: 45*rem,
    borderRadius: 25*rem,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginTop: 20*rem,
  },
  signUpText: {
    color: '#0055a5',
    fontSize: 20*rem,
    textAlign: 'center'
  },
  errorText: {
    marginTop: 6*rem,
    color: 'maroon',
    fontSize: 16*rem,
    width: screenWidth - (55*rem),
    paddingLeft: 26*rem,
  },
  btnBack: {
    width: screenWidth - 55,
    aspectRatio: 7,
    borderRadius: 25*rem,
    backgroundColor: 'rgba(0,0,0, 0)',
    justifyContent: 'center',
    marginTop: 20*rem,
  },
  btnBackText: {
    color: 'white',
    fontSize: 20*rem,
    textAlign: 'center'
  }
});