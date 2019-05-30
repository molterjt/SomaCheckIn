import React from 'react';
import {View, Text, StyleSheet} from 'react-native';



export default class CheckInHistoryScreen extends React.Component{
    constructor(){
        super();
    }
    render(){
        return(
            <View style={styles.container}>
                <Text>
                    Check In History
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center'
    }
})