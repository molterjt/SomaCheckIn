import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet,
    View, Text, TextInput,
    Image, TouchableOpacity,
    Animated, Button,
} from 'react-native';
import MenuButton from '../components/MenuButton';
import SomaShield from '../assets/images/SomaJJ_Logo.png';
import Belt from '../components/Belt';
import AddPerson from '../components/AddPerson';
import ListItem from '../components/ListItem';
import Colors from '../constants/Colors';
import {Query, graphql} from 'react-apollo'
import gql from 'graphql-tag';
import {withNavigation} from "react-navigation";

const UserList = gql`
    query{
        users{
            id
            firstName
            lastName
            email
            beltColor
            position
            joinDate
            stripeCount
        
        }
    }
`;

const AcademyRoster = gql`
  query academyRoster($academyTitle: String!){
    academyRoster(academyTitle: $academyTitle){
        id
        firstName
        lastName
        email
        beltColor
        position
        joinDate
        stripeCount
    }
  }  
`;

const SearchUser = gql`
  query searchUserByName($searchString: String!){
    searchUserByName(searchString: $searchString){
        id
        firstName
        lastName
        email
        beltColor
        position
        joinDate
        stripeCount
    }
  }  
`;



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
                style={styles.rosterRow}
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

};


class RosterList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            academyTitle: null,
            showClearButton: false,
            selectedOptions: [
                {"Location": "Dayton", "selected": false},
                {"Location": "Oxford", "selected": false},
                {"Location": "West Chester", "selected": false},
            ],

        }
    }
    clearSelections(){
        let newSelections = [...this.state.selectedOptions];
        newSelections.map(obj => obj.selected = false);
        this.setState({selectedOptions: newSelections});
    }
    updateChoice(type) {
        let newSelections = [...this.state.selectedOptions];
        newSelections.filter(obj =>
            obj.Location === type
                ? obj.selected = true
                : obj.selected = false
        );
        this.setState({selectedOptions: newSelections});
    }

    _handleAcademySearchButtonPress(searchString){
        this.updateChoice(searchString);
        this.setState({
            academyTitle: searchString,
            showClearButton: true,
        });

    }
    render(){
        return(
            <ScrollView
                contentContainer={{justifyContent:'flex-start', alignItems:'center'}}
                style={{ width:'100%', marginTop:5, paddingBottom: 20}}>
                <View style={{
                    flexDirection:'row',
                    justifyContent: 'space-around',
                    borderWidth:2,
                    borderStyle: 'double',
                    padding:5,
                    backgroundColor: 'rgba(0,0,0,0.8)'
                }}>
                    <TouchableOpacity
                        style={
                            [styles.academySearchButton,
                                {backgroundColor: (this.state.selectedOptions[0].selected ? 'rgba(250,250,250,0.8)' : "#8c030b")},
                            ]
                        }
                        onPress={() => {
                            this._handleAcademySearchButtonPress('Dayton');
                        }}

                    >
                        <Text style={ {color: (this.state.selectedOptions[0].selected ? "#8c030b" : "white")}}>Dayton</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            [styles.academySearchButton,
                                {backgroundColor: (this.state.selectedOptions[1].selected ? 'rgba(250,250,250,0.8)' : "#8c030b")},
                            ]
                        }
                        onPress={() => {
                            this._handleAcademySearchButtonPress('Oxford');
                        }}

                    >
                        <Text style={ {color: (this.state.selectedOptions[1].selected ? "#8c030b" : "white")}}>Oxford</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={
                            [styles.academySearchButton,
                                {backgroundColor: (this.state.selectedOptions[2].selected ? 'rgba(250,250,250,0.8)': "#8c030b")}
                            ]
                        }
                        onPress={() => {
                            this._handleAcademySearchButtonPress('West Chester');
                        }}

                    >
                        <Text style={ {color: (this.state.selectedOptions[2].selected ? "#8c030b" : "white")}}>West Chester</Text>

                    </TouchableOpacity>
                </View>
                {
                    this.state.academyTitle === null
                    ? null
                : (
                    <Query query={AcademyRoster} variables={{academyTitle: this.state.academyTitle}} fetchPolicy={'network-only'}>
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
                                <View style={{marginTop: 5}}>
                                    {data.academyRoster.map((obj, index) => (
                                        <ListItem
                                            key={index}
                                            onSwipeFromLeft={() => console.log('swiped from left!')}
                                            onRightPress={() => console.log('pressed right!')}
                                            swipeWhat={
                                                <RosterRow
                                                    key={index}
                                                    memberId={obj.id}
                                                    beltColor={obj.beltColor}
                                                    stripeCount={obj.stripeCount}
                                                    joinDate={obj.joinDate}
                                                    firstName={obj.firstName}
                                                    lastName={obj.lastName}
                                                    navigation={this.props.navigation}
                                                />
                                            }
                                        />

                                    ))}
                                </View>
                            )
                        }}
                    </Query>
                    )
                }
                {
                    this.state.showClearButton
                    ? ( <Button
                            title={'Clear'}
                            onPress={() => {
                                this.setState({academyTitle: null, showClearButton: false});
                                this.clearSelections();
                            }}
                        />
                    )
                    : null
                }

            </ScrollView>
        );
    }
}

class SearchUsers extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            searchString: '',
        }
    };
    render(){
        return(
            <ScrollView
                contentContainer={{justifyContent:'flex-start', alignItems:'center'}}
                style={{width:'100%', alignContent:'center', marginTop:5}}>
                <View style={{
                    flexDirection:'row',
                    justifyContent: 'center',
                    borderWidth:2,
                    borderStyle: 'double',
                    padding:5,
                    backgroundColor: 'rgba(0,0,0,0.8)'
                }}>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={(searchString) => {
                            this.setState({searchString});
                        }}
                        value={this.state.searchString}
                        type={'text'}
                        accessibilityLabel={'Search Member field for Roster Search'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        placeholderTextColor={'#4f4f4f'}
                        keyboardAppearance={'dark'}
                        placeholder={'Search By First Name'}
                    />
                </View>
                {
                    this.state.searchString === ''
                        ? null
                        : (
                            <Query query={SearchUser} variables={{searchString: this.state.searchString}} fetchPolicy={'network-only'}>
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
                                        <View style={{marginTop: 5}}>
                                            {data.searchUserByName.map((obj, index) => (
                                                <ListItem
                                                    key={index}
                                                    onSwipeFromLeft={() => console.log('swiped from left!')}
                                                    onRightPress={() => console.log('pressed right!')}
                                                    swipeWhat={
                                                        <RosterRow
                                                            key={index}
                                                            memberId={obj.id}
                                                            beltColor={obj.beltColor}
                                                            stripeCount={obj.stripeCount}
                                                            joinDate={obj.joinDate}
                                                            firstName={obj.firstName}
                                                            lastName={obj.lastName}
                                                            navigation={this.props.navigation}
                                                        />
                                                    }
                                                />

                                            ))}
                                        </View>
                                    )
                                }}
                            </Query>
                        )
                }
            </ScrollView>
        );
    }
}


class RosterScreen extends React.Component{

    static navigationOptions = {header: null,};

    constructor(props){
        super(props);
    }

    render(){
        return(
            <View style={{flex:1}}>
                <MenuButton navigation={this.props.navigation}/>
                <AddPerson />
                <ScrollView
                    contentContainer={{justifyContent:'flex-start', alignItems:'center'}}
                    style={{width:'100%', alignContent:'center', marginBottom:20}}
                >
                    <SearchUsers navigation={this.props.navigation}/>
                    <RosterList navigation={this.props.navigation}/>
                </ScrollView>
            </View>
        );
    }
}

export default withNavigation(RosterScreen);

const styles = StyleSheet.create({
    container:{
        // flex:1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 30
    },
    rosterRow:{
        flexDirection: 'row',
        margin: 1,
        width: '100%',
        borderBottomWidth:1,
        borderBottomColor: '#777777',
        borderTopWidth:1,
        borderTopColor: '#777777',
        padding: 5,
    },
    academySearchButton: {
        //backgroundColor: '#8c030b',
        borderWidth:1,
        padding: 10,
        shadowOffset: {width: 1, height: 2,},
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 2,
        borderRadius: 10,
    },
    academySearchText: {
        color: '#fff'
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
        shadowOffset: {width: -1, height: 1,},
        shadowColor: '#000',
        shadowOpacity: 1.0,
        shadowRadius: 2,
    },
    profileImageContainer:{
        flex:1,
        width: '15%',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: 5
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
    profileImage:{
        height: 60,
        width: 60,
        borderRadius: 30,
    },
    profileBelt:{
        width: '80%',
        height: 20,
        backgroundColor: Colors.brownBelt,
    },
    profileName:{
        fontSize: 16,
        fontWeight: 'bold',

    },
    profileJoinDate:{
        fontSize: 14,
        color: '#777777'
    },
})