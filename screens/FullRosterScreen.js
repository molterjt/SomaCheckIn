import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet, TextInput, TouchableWithoutFeedback,Picker,
    View, Text, Button,Dimensions,
    Image, TouchableOpacity, ActivityIndicator,
    Animated, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import {Ionicons, MaterialIcons, AntDesign} from '@expo/vector-icons';
import Belt from '../components/Belt';
import {compose, graphql, Mutation, Query} from 'react-apollo';
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import ListItem from "../components/ListItem";

import _forEach from 'lodash/forEach'
import _sortBy from 'lodash/sortBy';
import _orderBy from 'lodash/orderBy';

const USERLIST = gql`
  query UserList{
    users{
        id
        firstName
        lastName
        beltColor
        email
        phone
        dob
        joinDate
        beltColor
        stripeCount
      
    }
  }  
`;

const WIDTH=Dimensions.get('window').width;
const HEIGHT=Dimensions.get('window').height;

class RosterRow extends React.Component{
    constructor(props){
        super(props);
    }
    matchColor(myBeltColor) {
        const myColor = myBeltColor.toString();
        if (myColor === 'BROWN') return Colors.BROWN;
        if (myColor === 'BLACK') return Colors.BLACK;
        if (myColor === 'PURPLE') return Colors.PURPLE;
        if (myColor === 'BLUE') return Colors.BLUE;
        if (myColor === 'WHITE') return Colors.WHITE;
    };
    render(){
        return(
            <TouchableOpacity
                onPress={ () => this.props.navigation.navigate('Person', {itemId: this.props.memberId})}
                style={[styles.rosterRow, {backgroundColor: (this.props.checkedIn ? "red" : null)}]}
            >
                <View style={styles.profileBeltContainer}>
                    <Belt
                        stripes={this.props.stripeCount}
                        style={{backgroundColor: (this.matchColor(this.props.beltColor))}}
                        BlackBelt={this.props.beltColor === 'BLACK'}
                    />
                </View>
                <View style={styles.profileNameContainer}>
                    <Text style={styles.profileName}>
                        {this.props.firstName} {this.props.lastName}
                    </Text>
                </View>
                <View style={styles.profileJoinDateContainer}>
                    <Text style={styles.profileJoinDate}>
                        {this.props.joinDate}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}
RosterRow.propTypes = {
    memberId: PropTypes.string,
    profilePicture: PropTypes.number,
    beltColor: PropTypes.string,
    stripeCount: PropTypes.number,
    joinDate: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    BlackBelt: PropTypes.bool,
    viewPerson: PropTypes.func,
    checkedIn: PropTypes.bool,
    classSessionTitle: PropTypes.string,

};

const BeltListValues = [
    {"color": "BLACK", "value": 0},
    {"color": "BROWN", "value": 1},
    {"color": "PURPLE", "value": 2},
    {"color": "BLUE", "value": 3},
    {"color": "WHITE", "value": 4},

];

class FullRoster extends React.Component{
    static navigationOptions = {header: null,};
    constructor(props){
        super(props);
        this.state = {
            rosterData: undefined
        }
        this.myData = [];
    }
    componentDidMount(){
        console.log('componentDidMount()  ',this.props.data);



    }

    render(){

        if(this.props.data.loading){
            return <ActivityIndicator/>
        }
        if(this.props.data.error){
            return <Text>{this.props.data.error.message}</Text>
        }
        this.props.data.users.map(x => this.myData.push(x));
        console.log('this.myData: ', _sortBy(this.myData), 'beltColor'   );

        let myUserData = _forEach(this.props.data.users, function (user, index) {
            BeltListValues.map(belt => {
                if(belt.color === user.beltColor){
                    user.beltValue = belt.value
                }
            })
        })
        //let sorted = _sortBy(myUserData, ['beltValue', 'stripeCount'], ['desc', 'desc']);
        let setOrder = _orderBy(myUserData, ['beltValue','stripeCount'], ['asc', 'desc']);
        return(
            <ScrollView
                style={{paddingBottom: 50, paddingTop:50, backgroundColor: 'rgba(0,0,0,0.8)', padding:20 }}

                showsVerticalScrollIndicator={false}
                alwaysBounceVertical={true}
            >
                <Ionicons
                    name={'ios-arrow-round-back'}
                    color={'#1cb684'}
                    size={40}
                    onPress={() => this.props.navigation.goBack(null)}
                />
                {setOrder.map((x,i) => (
                    <RosterRow
                        key={x.id}
                        memberId={x.id}
                        beltColor={x.beltColor}
                        stripeCount={x.stripeCount}
                        joinDate={x.joinDate}
                        firstName={x.firstName}
                        lastName={x.lastName}
                        navigation={this.props.navigation}
                        checkedIn={false}
                    />
                ))}
            </ScrollView>

        );
    }
}

export default graphql(USERLIST)(FullRoster);

const styles = StyleSheet.create({
    container: {
        //flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    rosterRow:{
        flexDirection: 'row',
        margin: 1,
        width: '100%',
        borderBottomWidth:1,
        borderBottomColor: '#fff',
        borderTopWidth:1,
        borderTopColor: '#fff',
        padding: 5,
    },
    menuIcon: {
        zIndex: 9,
        position: 'absolute',
        top: 45,
        right: 20
    },
    textInput: {
        alignSelf: 'stretch',
        height: 40,
        width: 'auto',
        minWidth: 250,
        margin: 15,
        padding: 10,
        borderWidth:0.5,
        borderColor:'#8c030b',
        // borderBottomColor: '#000000',
        // borderBottomWidth: 1,
        backgroundColor: "#fff"
    },
    inputLabel:{
        color: 'white',
    },
    formButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'rgba(155, 10, 2, 0.9)',
        backgroundColor: '#8c030b',
        padding: 8,
        marginTop: 20,
        marginBottom: 20,
        width: '33%',
        height: 'auto',
        borderWidth:1,
        borderRadius: 15,
        borderColor: '#ffffff',
    },
    buttonText:{
        color: "#ffffff",
        alignSelf: 'center',
        alignContent:'center',
        justifyContent:'center',
    },
    profileBeltContainer:{
        flex:1,
        width: '13%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    profileNameContainer:{
        flex:1,
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileJoinDateContainer:{
        flex:1,
        width: '20%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 5,
    },
    profileBelt:{
        width: '80%',
        height: 20,
        backgroundColor: Colors.brownBelt,
    },
    profileName:{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',

    },
    profileJoinDate:{
        fontSize: 14,
        color: '#777777'
    },
});