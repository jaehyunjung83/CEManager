import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TextInput, FlatList, Text } from 'react-native';
import { colors } from './colors.js';
import { TouchableHighlight } from 'react-native-gesture-handler';

// Requires 4 props: data, placeholder, maxSuggestions, height
// data (array of strings): Array of strings used as data for populating suggestions.
// placeholder (string): Renders input string as placeholder of TextInput.
// maxSuggestions (number): Maximum number of suggestions rendered. Recommended 4-10.
// height (number): Should be the height given to parent container of this component. Used as height of each suggestion list item. Also affects autocomplete suggestion container.
export default function autoCompleteInput(props) {

    const [textInputVal, setTextInputVal] = useState("");
    const [suggestions, setSuggestions] = useState([]);


    onTextChanged = (input) => {
        setTextInputVal(input);
        input = input.toLowerCase();
        if (input.length) {
            let suggestionsArr = [];
            for(index in props.data) {
                if(props.data[index].toLowerCase().includes(input)) {
                    suggestionsArr.push(props.data[index]);
                }
                if(suggestionsArr.length === props.maxSuggestions) {
                    break;
                }
            }
            setSuggestions(suggestionsArr.sort());
        }
        else {
            setSuggestions([]);
        }
    }

    suggestionSelected = (item) => {
        setTextInputVal(item);
        setSuggestions([]);
    }

    // Styles are inside of function component in order to access props.
    const styles = StyleSheet.create({
        input: {
            width: '100%',
            height: '100%',
            fontSize: 16 * rem,
            borderRadius: 10 * rem,
            backgroundColor: colors.grey200,
            padding: 18 * rem,
            color: colors.grey900,
        },
        flatListContainer: {
            position: 'absolute',
            marginTop: props.height,
            width: '100%',
            maxHeight: props.height * props.maxSuggestions,
            backgroundColor: 'white',
            borderRadius: 10 * rem,
        },
        listItemContainer: {
            backgroundColor: 'white',
            width: '100%',
            height: props.height,
            padding: 12 * rem,
            paddingBottom: 0,
        },
        itemText: {
            fontSize: 16 * rem,
            color: colors.grey900,
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
            />
            {suggestions.length ? (
                <View style={styles.flatListContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <TouchableHighlight
                                style={styles.listItemContainer}
                                onPress={() => suggestionSelected(item)}
                                underlayColor={colors.underlayColor}
                            >
                                <Text style={styles.itemText}>{item}</Text>
                            </TouchableHighlight>
                        )}
                    />
                </View>
            ) : (null)}

        </>
    )
}

// Used to make element sizes more consistent across screen sizes.
const screenWidth = Math.round(Dimensions.get('window').width);
const rem = (screenWidth / 380);
