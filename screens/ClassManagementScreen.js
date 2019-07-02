import React from 'react';
import {View, Text,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import {Query, graphql, compose} from 'react-apollo'
import gql from 'graphql-tag';
import MenuButton from "../components/MenuButton";

const GET_CLASS_SESSIONS = gql`
    query($academyTitle: String, $first: Int, $skip: Int){
        classSessionsByAcademy(academyTitle: $academyTitle, first: $first, skip: $skip){
        
        }
    
    }
`;


class ClassManagementScreen extends React.Component{
    static navigationOptions = {header: null,};

    constructor(props){
        super(props);
    }
    render(){
        return(
            <View style={styles.container}>
                <MenuButton navigation={this.props.navigation}/>
                <Text>Class Sessions</Text>
            </View>
        );
    }
}

export default ClassManagementScreen;

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center'
    }
})