import React from 'react';
import PropTypes from 'prop-types';
import {
    Modal, View, ScrollView, Text, TouchableWithoutFeedback, TouchableOpacity, Button, StyleSheet
} from 'react-native';

import {Query, Mutation, graphql} from 'react-apollo';
import gql from 'graphql-tag';
import {Ionicons, EvilIcons} from '@expo/vector-icons';




class DeleteACheckIn extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showDeleteCheckInModal: false
        }
    }
    _toggleDeleteCheckInModal = async () => {
        this.setState({showDeleteCheckInModal: !this.state.showDeleteCheckInModal})
    };
    render(){
        return(
            <View style={{alignItems: 'center', justifyContent:'center'}}>
                <TouchableOpacity
                    onPress={() => this._toggleDeleteCheckInModal()}
                >
                    <Text>Delete</Text>
                </TouchableOpacity>

                <Modal
                    transparent={true}
                    animationType={"none"}
                    visible={this.state.showDeleteCheckInModal}
                    onRequestClose={() => this._toggleDeleteCheckInModal() }
                >
                    <TouchableOpacity
                        onPress={() => this._toggleDeleteCheckInModal()}
                    >
                        <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                            <TouchableWithoutFeedback>
                                <View style={{backgroundColor: 'rgba(250,250,250,1)', height: '60%', width: '70%', borderWidth:1}}>
                                    <View style={{
                                        backgroundColor:'#fff',flexDirection:"column",
                                        justifyContent: 'center', margin: 3,
                                        width: 'auto', padding: 5
                                    }}
                                    >
                                        <Button
                                            title={'Close'}
                                            onPress={() => this._toggleDeleteCheckInModal()}
                                        />


                                    </View>

                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                </Modal>

            </View>
        );
    }
}

export default DeleteACheckIn;

const styles = StyleSheet.create({

    modalContainer: {
        marginTop: 5,
        height: '95%',
        flexDirection: 'column',
        justifyContent:'center',
        alignItems:'center',
        padding: 2,
        marginBottom:30

    },
    ModalInsideView:{
        alignItems: 'center',
        backgroundColor : "#fff",
        height: '91%' ,
        width: '90%',
        borderRadius:10,
        borderWidth: 3,
        borderColor: '#156DFA',
        opacity: 0.95,
        marginBottom: 30,
    },
});