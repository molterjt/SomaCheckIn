import React from 'react';
import {StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';


export default FullRosterButton = ({navigation}) =>
    <Ionicons
        style={styles.menuIcon}
        name={"md-clipboard"}
        color={"#0c48c2"}
        size={32}
        onPress={navigation}
    />

const styles = StyleSheet.create({
    menuIcon: {
        zIndex: 9,
        position: 'absolute',
        top: 45,
        right: 20
    },
});