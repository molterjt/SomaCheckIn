import React from 'react';
import {StyleSheet, View, Text, AsyncStorage, Button, Image, Linking, Platform, TouchableOpacity} from 'react-native';
import MenuButton from '../components/MenuButton';
import {Query, graphql} from 'react-apollo'
import gql from 'graphql-tag';
import Profile from '../components/Profile';
import {Ionicons,MaterialIcons} from '@expo/vector-icons'


const ME = gql`
    query{
        me{
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
            academies{id, title}
            checkIns{
              id
              classSession{
                id
                date
                title
                techniques{
                    title
                    tags{id, name}
                }
                classPeriod{
                  day
                  time
                  title
                  id
                }
             }
           }
        }
    }
    
`

const UPDATE_USER = gql`
    mutation updateUser(
          $userId: ID!
          $firstName:String,
          $lastName: String,
          $phone: String
          $dob:String
          $joinDate:String
          $beltColor: BeltColor
          $stripeCount:Int
          $position: PositionType
          $academies: [ID]
    ){
        updateUser(
            userId: $userId
            phone: $phone
            dob: $dob
            joinDate: $joinDate
            beltColor: $beltColor
            stripeCount: $stripeCount
            position: $position
            academies: $academies
        ){
            id
            firstName
            lastName
            phone
            dob
            joinDate
            beltColor
            stripeCount
            academies{title, id}
            position
        }
}
`

class ProfileScreen extends React.Component {
    static navigationOptions = {header: null};
    constructor(props){
        super(props);
        this.state={

        };
    };
    _SignOut = async () => {
         await AsyncStorage.removeItem('USER_TOKEN');
         this.props.navigation.navigate('Auth');
    };
  render() {
    return (
        <View style={styles.container}>
            <MenuButton navigation={this.props.navigation}/>
            <Query query={ME} fetchPolicy={'network-only'}>
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
                    return(
                           <Profile
                               id={data.me.id}
                               firstName={data.me.firstName}
                               lastName={data.me.lastName}
                               email={data.me.email}
                               phone={data.me.phone}
                               dob={data.me.dob}
                               position={data.me.position}
                               joinDate={data.me.joinDate}
                               beltColor={data.me.beltColor}
                               stripeCount={data.me.stripeCount}
                               academies={data.me.academies}
                               lastCheckIn={'Today'}
                               showEditButton={true}
                           />
                    )
                }}
            </Query>
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <Button
                    title={'SignOut'}
                    onPress={() => this._SignOut()}
                />
            </View>
        </View>
    );
  }
}

export default ProfileScreen;


const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 10,
    },

});