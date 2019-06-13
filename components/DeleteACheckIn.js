import React from 'react';
import PropTypes from 'prop-types';
import {
    Modal, View, ScrollView, Text, TouchableWithoutFeedback, TouchableOpacity, Button, StyleSheet
} from 'react-native';

import {Query, Mutation, graphql} from 'react-apollo';
import gql from 'graphql-tag';
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import {checkInsByUserAndClassSession} from '../screens/RosterScreen';


const DEL_CHECKIN = gql`
    mutation deleteCheckIn($checkInId: ID!){
      deleteCheckIn(checkInId: $checkInId){
        id
      
      }
    }
`;
const CHECKINS_BY_USER = gql`
    query checkInsFiveMostRecentByUser($userId: ID!){
        checkInsFiveMostRecentByUser(userId: $userId){
            checked
            id
            user{
              firstName
              id
            }
            classSession{
              id
              title
              date
              academy{title}
              classPeriod{
                id
                day
                time
                title
                academy{title}
              }
            }
        }
    }
`;



const DeleteTrashCan = ({itemId, buttonPressAction}) => (
    <TouchableOpacity onPress={buttonPressAction }>
        <MaterialIcons
            name={'delete-forever'}
            color={'red'}
            size={28}
        />
    </TouchableOpacity>
);
DeleteTrashCan.propTypes = {
    itemId: PropTypes.string,
    buttonPressAction: PropTypes.func
};


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
    _handleDeleteCheckInAction = async (itemId, userId) => {
        const result = await this.props.mutate({
            variables:{ checkInId: itemId },
            refetchQueries: [
                {
                    query: CHECKINS_BY_USER,
                    variables: {
                        userId: this.props.userId
                    }
                },
                {
                    query: checkInsByUserAndClassSession,
                    variables: {
                        userId: userId,
                        classSessionTitle: this.props.classSessionTitle

                    }
                },

            ],
        }).catch((error => {
            console.log('Failure of DeleteCheckIn: ', error);
        }));
        if(result){
            console.log('DEL Success of ', result);
        }
    }
    render(){
        return(
            <View style={{alignItems: 'center', justifyContent:'center', padding: 2}}>
                <TouchableOpacity
                    style={{padding:10}}
                    onPress={() => this._toggleDeleteCheckInModal()}
                >
                    <Text style={{color: this.props.textColor ? this.props.textColor: 'black'}}>Remove</Text>
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
                                <View style={{backgroundColor: 'rgba(250,250,250,1)', height: '70%', width: '90%', borderWidth:1}}>
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
                                        <Query
                                            query={CHECKINS_BY_USER}
                                            variables={{userId: this.props.userId}}
                                            fetchPolicy={'network-only'}
                                        >
                                            {({loading, error, data}) => {
                                                if (loading) {
                                                    return (<View><Text>Loading</Text></View>)
                                                }
                                                if (error) {
                                                    console.log(error.message);
                                                    return (<View><Text>`Error! ${error.message}`</Text></View>)
                                                }
                                                return(
                                                    <View>
                                                        {data.checkInsFiveMostRecentByUser.length > 0
                                                            ? (

                                                                <View style={{marginTop: 15}}>
                                                                    <Text style={{
                                                                        textAlign: 'center',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {data.checkInsFiveMostRecentByUser[0].user.firstName}'s
                                                                        Last 5 CheckIns
                                                                    </Text>
                                                                    {data.checkInsFiveMostRecentByUser.map((checkIn, index) => (
                                                                        <View
                                                                            key={index}
                                                                            style={{
                                                                                flexDirection: 'row',
                                                                                justifyContent: 'flex-start',
                                                                                margin: 10,
                                                                                borderTopWidth: 1,
                                                                                borderBottomWidth: 1,
                                                                                alignItems: 'center',

                                                                            }}
                                                                        >
                                                                            <DeleteTrashCan
                                                                                itemId={checkIn.id}
                                                                                buttonPressAction={
                                                                                    () => this._handleDeleteCheckInAction(checkIn.id, this.props.userId)
                                                                                }
                                                                            />
                                                                            <View
                                                                                style={{
                                                                                    flex: 1,
                                                                                    flexDirection: 'column',
                                                                                    justifyContent: 'space-around',
                                                                                    alignItems: 'center',

                                                                                }}>

                                                                                <Text style={{
                                                                                    color: '#0c48c2',
                                                                                    padding: 5,
                                                                                    fontStyle: 'italic',
                                                                                    textAlign: 'center',
                                                                                    marginBottom: 5
                                                                                }}>
                                                                                    {checkIn.classSession.classPeriod.title}
                                                                                </Text>
                                                                                <View style={{
                                                                                    borderWidth: 1,
                                                                                    borderColor: '#b4b4b4',
                                                                                    width: '80%'
                                                                                }}/>
                                                                                <View style={{
                                                                                    flexDirection: 'row',
                                                                                    flewWrap: 'wrap',
                                                                                    justifyContent: 'space-between',
                                                                                    marginTop: 5,
                                                                                    padding: 5

                                                                                }}>
                                                                                    <Text
                                                                                        style={{marginLeft: 4}}>{checkIn.classSession.date},</Text>
                                                                                    <Text
                                                                                        style={{marginLeft: 10}}>{checkIn.classSession.classPeriod.academy.title},</Text>
                                                                                    <Text
                                                                                        style={{marginLeft: 10}}>{checkIn.classSession.classPeriod.time} </Text>
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    ))}
                                                                </View>
                                                            )

                                                            : (
                                                                <View style={{marginTop: 15, alignItems: 'center'}}>
                                                                    <Text>No CheckIn Data for this user.</Text>
                                                                </View>

                                                            )
                                                        }
                                                        </View>
                                                );

                                            }}
                                        </Query>


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
DeleteACheckIn.propTypes = {
    userId: PropTypes.string,
    textColor: PropTypes.string,
    classSessionTitle: PropTypes.string,
}
export default graphql(DEL_CHECKIN)(DeleteACheckIn);

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