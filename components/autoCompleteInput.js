import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TextInput, FlatList, Text, Modal } from 'react-native';
import { colors } from './colors.js';
import { TouchableHighlight } from 'react-native-gesture-handler';

// Requires 4 props: data, placeholder, maxSuggestions, height
// data (array of strings): Array of strings used as data for populating suggestions.
// placeholder (string): Renders input string as placeholder of TextInput.
// maxSuggestions (number): Maximum number of suggestions rendered. Recommended 4-10.
// height (number): Should be the height given to parent container of this component. Used as height of each suggestion list item. Also affects autocomplete suggestion container.
// scrollToCallBack (function): Workaround to scroll this field up to avoid keyboard. KeyboardAvoidingView was causing problems.
// setParentState (function): If you need to keep track of input state in parent state.
export default function autoCompleteInput(props) {

    const [textInputVal, setTextInputVal] = useState(props.inputVal);
    const [suggestions, setSuggestions] = useState([]);


    onTextChanged = (input) => {
        setTextInputVal(input);
        props.setParentState(input);
        input = input.toLowerCase();
        if (input.length) {
            let suggestionsArr = [];
            for (index in props.data) {
                if (props.data[index].toLowerCase().includes(input)) {
                    suggestionsArr.push(props.data[index]);
                }
                if (suggestionsArr.length === props.maxSuggestions) {
                    break;
                }
            }
            setSuggestions(suggestionsArr.map((val, index) =>
                <TouchableHighlight
                    key={index}
                    style={styles.listItemContainer}
                    onPress={() => suggestionSelected(val)}
                    underlayColor={colors.underlayColor}
                >
                    <Text style={styles.itemText}>{val}</Text>
                </TouchableHighlight>));
        }
        else {
            setSuggestions([]);
        }
    }

    suggestionSelected = (item) => {
        setTextInputVal(item);
        setSuggestions([]);
        props.setParentState(item);
    }

    // Styles are inside of function component in order to access props.
    const styles = StyleSheet.create({
        input: {
            width: '100%',
            height: '100%',
            fontSize: 16 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            paddingLeft: 18 * rem,
            paddingRight: 18 * rem,
            color: colors.grey900,
        },
        listContainer: {
            position: 'absolute',
            marginTop: props.height + (28 * rem),
            width: '100%',
            maxHeight: props.height * props.maxSuggestions,
            borderRadius: 10 * rem,
            borderWidth: 2 * rem,
            borderColor: colors.grey300,
            backgroundColor: 'white',
        },
        listItemContainer: {
            backgroundColor: 'white',
            width: '100%',
            marginTop: -2 * rem,
            height: props.height,
            padding: 12 * rem,
            paddingBottom: 0,
            borderRadius: 10 * rem,
            borderWidth: 2 * rem,
            borderColor: 'rgba(0,0,0,0)',
        },
        itemText: {
            fontSize: 16 * rem,
            color: colors.grey900,
        },
        autoCompleteOptions: {
            fontSize: 16 * rem,
            color: colors.grey900,
            backgroundColor: 'pink',
        },
    });

    return (
        <>
            <TextInput
                style={styles.input}
                placeholder={props.placeholder}
                placeholderTextColor={colors.grey400}
                value={textInputVal}
                onChangeText={onTextChanged}
                onFocus={() => props.scrollToCallBack()}
                onBlur={() => setSuggestions([])}
            />
            {suggestions.length ? (
                <View style={styles.listContainer}>
                    <>{suggestions}</>
                </View>
            ) : (null)}
        </>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);
