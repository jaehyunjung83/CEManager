import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function scannedView(props) {

    return (
        <View style={styles.container}>
            <Image style={styles.image}
                source={{ uri: props.route.params.image }} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: 'black',
        height: '100%',
        width: '100%',
    },
    image: {
        resizeMode: 'contain',
        height: '100%',
        width: '100%',
    }
});