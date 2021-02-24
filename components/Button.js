import React, { PureComponent } from 'react'
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types'
import {colors} from '../components/colors';

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);

export default class Button extends PureComponent {
  static propTypes = {
    text: PropTypes.string.isRequired,
    disabledText: PropTypes.string,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    style: PropTypes.any,
    onPress: PropTypes.func.isRequired,
  }

  static defaultProps = {
    disabledText: '',
    loading: false,
    disabled: false,
    style: undefined,
  }

  handlePress = (event) => {
    const { loading, disabled, onPress } = this.props

    if (loading || disabled) {
      return
    }

    if (onPress) {
      onPress(event)
    }
  }

  render() {
    const { text, disabledText, loading, disabled, style, ...rest } = this.props

    return (
      <TouchableOpacity
        {...rest}
        style={[styles.button, style]}
        onPress={this.handlePress}
      >
        <View>
          {loading && <ActivityIndicator animating size="small" />}
          {!loading && !disabled && <Text style={styles.buttonText}>{text}</Text>}
          {!loading && disabled && <Text>{disabledText || text}</Text>}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
    padding: 18 * rem,
    paddingTop: 12 * rem,
    paddingBottom: 12 * rem,
    flexDirection: 'row',
    borderRadius: 36 * rem,
    borderWidth: 2 * rem,
    borderColor: colors.blue800,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue800,
    minWidth: 160 * rem,
    marginTop: 18 * rem,
    // marginBottom: 6 * rem,

    shadowColor: "green",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,

    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 17 * rem,
  }
})
