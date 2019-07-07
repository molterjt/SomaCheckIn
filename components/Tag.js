import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Ionicons, AntDesign} from '@expo/vector-icons';

export default class Tag extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return(
            <TouchableOpacity
                style={{
                    margin: 5,
                    height: 30,
                    width: 'auto',
                    minWidth:80,
                    backgroundColor: '#1cb684',
                    borderColor:'#000',
                    borderWidth: 1,
                    borderRadius: 30,
                    padding:5
                }}
                onPress={this.props.tagPress}
                onLongPress={this.props.onLongPress}
            >
                <Text
                    style={{
                        color: '#fff',
                        fontSize:12,
                        textAlign:'center'
                    }}
                >
                    #{this.props.tagName}
                </Text>
            </TouchableOpacity>

        );
    }
}
Tag.propTypes = {
    tagName: PropTypes.string,
    tagPress: PropTypes.func,
    onLongPress: PropTypes.func,
};

const styles = {
    tagContainer:{},
    tagText:{},
    tagAdd:{},
}
