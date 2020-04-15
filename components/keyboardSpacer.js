import React from 'react';
import { View } from 'react-native';

// View that can be placed at the bottom of a screen. Takes height as a prop and adjusts itself to that height. Allows you to use scrollTo to put something above keyboard.
export default function keyboardSpacer(props) {
    
    return (
        <View style={{
            height: props.height,
            width: '100%',
            color: rgba(0, 0, 0, 0),
        }} />
    );
}