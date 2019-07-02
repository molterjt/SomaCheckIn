import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet,
    View, Text,
    Image, TouchableOpacity,
    Animated, ActivityIndicator, Button,
} from 'react-native';

import {Query, graphql} from 'react-apollo'
import gql from 'graphql-tag';
import Profile from '../components/Profile';
import {Ionicons,MaterialIcons} from '@expo/vector-icons'
import {withNavigation} from "react-navigation";
import MenuButton from "../components/MenuButton";


const FIND_USER = gql`
    query findUser($userId:ID!){
     user(userId:$userId){
      id
      firstName
      lastName
      email
      beltColor
      position
      dob
      phone
      joinDate
      stripeCount
      academies{title}
      checkIns{
        id
        classSession{
          id
          date
          title
          academy{id, title}
        }
      }
    }
    me{
      id, 
      position
   }
}
    
`;

const DEL_USER = gql`
    mutation deleteUser($userId: ID!){
        deleteUser(userId: $userId){
            id
        }
    }
    
`;

class PersonScreen extends React.Component{
    static navigationOptions = {header: null};
    constructor(props){
        super(props);
        this.state={
            userId: this.props.navigation.state.params.itemId,
            loading: true,
        };
    }
    componentDidMount(){
        console.log('==========> ', this.userId);
        if(this.state.userId){
            this.setState({loading: false})
        }
    }

    deleteAccount = async (userId) => {
        const result = await this.props.mutate({
            variables: {
                userId: userId,
            }
        }).catch(error => {
            console.log('Delete User Error: ', error.message);
        });
        if(result){
            this.props.navigation.goBack(null);

        }
    }

    render(){
        const {userId, loading} = this.state;
        if(loading){
            return <ActivityIndicator/>
        }
        return(
            <Query query={FIND_USER} variables={{userId: userId }} fetchPolicy={'network-only'}>
                {({loading, error, data}) => {
                    if(loading){
                        return(
                            <View>
                                <Text>Loading</Text>
                            </View>
                        )
                    }
                    if(error){
                        console.log(error.message);
                        return(<View><Text>`Error! ${error.message}`</Text></View>)
                    }
                    const {user} = data;
                    return(
                    <View style={styles.container}>
                        <MenuButton navigation={this.props.navigation}/>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.goBack(null)}
                            style={{ flexDirection: 'row', position: 'absolute', top: 50,  alignItems:'center', justifyContent:'flex-end'}}>
                            <Ionicons
                                name={'ios-arrow-round-back'}
                                color={'#26a2dd'}
                                size={40}

                            />
                            <Text style={{color: '#26a2dd', marginLeft: 5}}>Go Back</Text>
                        </TouchableOpacity>
                        <Profile
                            id={user.id}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            email={user.email}
                            phone={user.phone}
                            dob={user.dob}
                            position={user.position}
                            joinDate={user.joinDate}
                            beltColor={user.beltColor}
                            stripeCount={user.stripeCount}
                            academies={user.academies}

                            lastCheckIn={user.checkIns.length > 0 ? (user.checkIns[0].classSession.date + " - " + user.checkIns[0].classSession.academy.title) : `No CheckIns Yet`}

                            showEditButton={(data.me.position === 'ADMIN')}
                            showDeleteButton={(data.me.position === 'ADMIN')}
                            deleteUserAccount={() => this.deleteAccount(user.id)}
                        />

                    </View>
                    )
                }}
            </Query>
        );
    }
}
export default graphql(DEL_USER)(withNavigation(PersonScreen));

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        padding: 10,
    },
});