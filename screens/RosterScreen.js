import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet,
    View, Text, TextInput,
    Image, TouchableOpacity,
    Animated, Button, Modal, TouchableWithoutFeedback, Picker,
} from 'react-native';
import MenuButton from '../components/MenuButton';
import SomaShield from '../assets/images/SomaJJ_Logo.png';
import Belt from '../components/Belt';
import AddPerson from '../components/AddPerson';
import FullRosterButton from '../components/FullRosterButton'
import ListItem from '../components/ListItem';
import DeleteACheckIn from '../components/DeleteACheckIn';
import Colors from '../constants/Colors';
import {Query, graphql, compose} from 'react-apollo'
import gql from 'graphql-tag';
import {withNavigation} from "react-navigation";
import {Ionicons, EvilIcons} from '@expo/vector-icons';


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

export const checkInsByUserAndClassSession = gql`
    query checkInsByUserAndClassSession($userId: ID, $classSessionTitle: String){
        checkInsByUserAndClassSession(userId: $userId, classSessionTitle: $classSessionTitle){
            checked
            user{
              firstName
              id
            }
            classSession{
              id
              title
              date
              academy{id, title}
              classPeriod{
                id
                day
                time
                title
              }
            }
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
        checkIns{
            id
            checked
            classSession{
                id
                title
                date
                classPeriod{
                    id
                    title
                    id
                    day
                    time
                }
            }
        }
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
        checkIns{
            id
            checked
            classSession{
                id
                title
                date
                classPeriod{
                    id
                    title
                    id
                    day
                    time
                }
            }
        }
    }
  }  
`;

const ClassPeriodsToday = gql`
    query classPeriodsToday($academyTitle: String, $daySearch:String){
      classPeriodsToday(academyTitle: $academyTitle, daySearch: $daySearch){
        title
        stamp
        id
        day
        time
        instructor{ 
            id
        }
        academy{
            title
            id
        }
        classSessions{
            id
            title
            date
            checkIns{
                id
                checked
                user{
                    id
                    firstName
                }
            }
        }
      }
    }
`;

const ClassPeriodsTodayWithTime = gql`
    query classPeriodsTodayWithTime($academyTitle: String, $daySearch:String, $timeSearch: String){
      classPeriodsTodayWithTime(academyTitle: $academyTitle, daySearch: $daySearch, timeSearch:$timeSearch){
        title
        stamp
        id
        day
        academy{
            title
            id
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
        time
        classSessions{
            id
            title
            date
            checkIns{
                id
                checked
                user{
                    id
                    firstName
                }
            }
        }
      }
    }
`;

const UpsertClassSession = gql`
    mutation (
       
        $classPeriodId: ID,
        $instructorId:ID,
        $academyId:ID
        $checkInValues: [CheckInCreateWithoutClassSessionInput]
    ){
        updateOrCreateClassSession(
            
            classPeriodId: $classPeriodId
            instructorId: $instructorId
            academyId: $academyId
            checkInValues: $checkInValues 
        ){
            id
            date
            createdAt
            academy{id, title}
            techniques{id, title}
            instructor{id, user{id, firstName}}
            checkIns{id, checked, user{id, firstName}}
        }
    }
    
`;

const CREATE_CHECKIN = gql`
    mutation createCheckIn($userId: ID!, $classSessionTitle: String, $checked: Boolean ){
      createCheckIn(
        checked: $checked
        userId: $userId
        classSessionTitle: $classSessionTitle
    
      ){
        id
        checked
        user{id,firstName}
        classSession{title}
      }
    }
`;

const ADD_USER_TO_ACADEMY = gql`
    mutation updateUser($userId: ID!, $academies: [ID]){
        updateUser(userId: $userId, academies: $academies){
            id
            firstName
            academies{id, title}
        }
    }
`;


class CheckInStatus extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <View>
                <Query
                    query={checkInsByUserAndClassSession}
                    variables={{userId: this.props.userId, classSessionTitle: this.props.classSessionTitle}}
                    fetchPolicy={'network-only'}
                >
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
                        let checkMark;
                        {data.checkInsByUserAndClassSession.map((obj, index) => {
                            if(obj.classSession.title === this.props.classSessionTitle){
                                return checkMark = obj;
                            }
                        })}
                        console.log('checkMark: ', checkMark);
                        return(
                            <View style={{marginTop: 5}}>
                                {checkMark
                                    ? <Ionicons
                                        name={"md-checkmark-circle"}
                                        color={"#1cb684"}
                                        size={32}
                                    />
                                    : <Ionicons
                                        name={"md-checkmark-circle"}
                                        color={"#b4b4b4"}
                                        size={32}
                                    />
                                }

                            </View>
                        )
                    }}
                </Query>
            </View>
        );
    }
}
CheckInStatus.propTypes = {
    userId: PropTypes.string,
    classSessionTitle: PropTypes.string,
    checkColor: PropTypes.string,
};


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
                    <CheckInStatus
                        userId={this.props.memberId}
                        classSessionTitle={this.props.classSessionTitle}
                    />
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


class RosterList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            academyTitle: null,
            timeSearch: null,
            selectedClassPeriod: null,
            todayClassSession: undefined,
            instructorId: undefined,
            academyId: undefined,
            checkInValues: undefined,


            showClearButton: false,
            showUndoButton: false,
            selectedOptions: [
                {"Location": "Dayton", "selected": false},
                {"Location": "Oxford", "selected": false},
                {"Location": "West Chester", "selected": false},
            ],


        };
        // this.touch = React.createRef();
        this.timeButtons = [];
    }
    _submitUpsertClassSession = async (userId) => {
        const memberArray = [];
        const newPerson = Object.assign({"userId": userId, "checked":true});
        console.log('newPerson: ', newPerson);
        memberArray.push(newPerson);
        this.setState({checkInValues: memberArray});
        console.log('title: ', this.state.todayClassSession);
        console.log('classPeriodId: ', this.state.classPeriodId);
        console.log('instructorId: ', this.state.instructorId);
        console.log('academyId: ', this.state.academyId);
        console.log('checkInValues: ', this.state.checkInValues);
        const result = await this.props.mutate({
            variables: {
                //title: this.state.todayClassSession,
                classPeriodId: this.state.selectedClassPeriod.id,
                instructorId: this.state.instructorId,
                academyId: this.state.academyId,
                checkInValues: this.state.checkInValues,
            },
            refetchQueries: [

                {
                    query: checkInsByUserAndClassSession,
                    variables:{
                        userId: userId,
                        classSessionTitle: this.state.todayClassSession
                    }
                },
                {
                    query: ClassPeriodsToday,
                    variables: {
                        academyTitle: this.state.academyTitle,
                        daySearch: this.state.daySearch,
                    }
                },
                {
                    query: ClassPeriodsTodayWithTime,
                    variables: {
                        academyTitle: this.state.todayClassSession,
                        daySearch: this.state.daySearch,
                        timeSearch: this.state.timeSearch
                    }
                },
            ]
        }).catch(error => {
            console.log('Failure of UpsertClassSession: ', error);
        });
        if(result){
            console.log('Success Result: ', result);

        }

    };

    setNativeProps = (x, nativeProps) => {
        x.setNativeProps(nativeProps);
    };

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
            showUndoButton: true,
            timeSearch: null,
            selectedClassPeriod: null,
        });
        this.timeButtons = [];
    }
    _handleAClassPeriodButtonPress(classPeriodObject){
        const today = new Date().toDateString();
        const titleSelector = today.concat("__", classPeriodObject.id);
        this.setState({
            timeSearch: classPeriodObject.time,
            selectedClassPeriod: classPeriodObject,
            todayClassSession: titleSelector,
            classPeriodId: classPeriodObject.id,
            academyId: classPeriodObject.academy.id,
            instructorId: classPeriodObject.instructor.id,
            showClearButton: true,
        });
        console.log('TimeSearch: ', classPeriodObject.time);
        console.log('state.timeSearch: ', this.state.timeSearch);
    }
    render(){
        console.log('timeButtons[].length: ', this.timeButtons.length);
        console.log('state.timeSearch: ', this.state.timeSearch);
        console.log('state.selectedClassPeriod: ', this.state.selectedClassPeriod);
        console.log('state.todayClassSession: ', this.state.todayClassSession);
        return(
            <ScrollView
                contentContainer={{justifyContent:'flex-start', alignItems:'center'}}
                style={{ width:'100%', marginTop:5, paddingBottom: 20,}}>
                {
                    this.state.showUndoButton
                        ? (

                            <EvilIcons
                                name={"undo"}
                                color={"#1cb684"}
                                style={{textAlign:'center', fontWeight:'bold',alignSelf: 'center', marginBottom:3}}
                                size={32}
                                onPress={() => {
                                    this.setState({
                                        academyTitle: null,
                                        timeSearch: null,
                                        selectedClassPeriod: null,
                                        showClearButton: false,
                                        showUndoButton: false,
                                        todayClassSession: undefined,
                                    });
                                    this.clearSelections();
                                    this.timeButtons = [];
                                }}
                            />


                        )
                        : null
                }


                {
                    this.state.academyTitle === null && this.state.timeSearch === null
                    ? (
                        <View style={{
                            flexDirection:'row',
                            justifyContent: 'space-around',
                            borderWidth:1,
                            borderColor:'white',
                            padding:5,
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}>
                            <TouchableOpacity
                                style={
                                    [styles.academySearchButton,
                                        {backgroundColor: (this.state.selectedOptions[0].selected ? '#1cb684' : "#0c48c2")},
                                    ]
                                }
                                onPress={() => {
                                    this._handleAcademySearchButtonPress('Dayton');
                                }}

                            >
                                <Text style={ {color: "white"}}>Dayton</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={
                                    [styles.academySearchButton,
                                        {backgroundColor: (this.state.selectedOptions[1].selected ? '#1cb684' : "#0c48c2")},
                                    ]
                                }
                                onPress={() => {
                                    this._handleAcademySearchButtonPress('Oxford');
                                }}

                            >
                                <Text style={ {color: "white"}}>Oxford</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={
                                    [styles.academySearchButton,
                                        {backgroundColor: (this.state.selectedOptions[2].selected ? '#1cb684': "#0c48c2")}
                                    ]
                                }
                                onPress={() => {
                                    this._handleAcademySearchButtonPress('West Chester');
                                }}

                            >
                                <Text style={ {color:  "white" }}>West Chester</Text>

                            </TouchableOpacity>
                        </View>
                    )
                    : <View style={{
                            flexDirection:'row',
                            justifyContent: 'space-around',
                            padding:0,
                            backgroundColor: 'rgba(0,0,0,0.8)'
                        }}>
                            <Text
                            style={{
                                color: '#fff',
                                padding:5,
                                fontWeight:'bold',
                                textAlign:'center',
                                fontSize:18
                            }}
                            >
                                {this.state.academyTitle}
                            </Text>
                        </View>
                }


                {
                    this.state.academyTitle === null
                        ? null
                        : (
                            <Query
                                query={ClassPeriodsToday}
                                variables={{
                                    academyTitle: this.state.academyTitle,
                                    daySearch: this.state.daySearch,

                                }}
                                fetchPolicy={'network-only'}
                            >
                                {({loading, error, data}) => {
                                    if(loading){
                                        return(<View><Text>Loading</Text></View>)
                                    }
                                    if(error){
                                        console.log(error.message);
                                        return(<View><Text>`Error! ${error.message}`</Text></View>)
                                    }
                                    return(
                                        <View>
                                        {data.classPeriodsToday.length > 0
                                            ? (
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-around',
                                                    borderWidth: 1,
                                                    borderColor: 'black',
                                                    padding: 8,
                                                    // backgroundColor: 'rgba(0,0,0,0.8)'
                                                }}>
                                                    {data.classPeriodsToday.map((obj, index) => (
                                                        <TouchableOpacity
                                                            ref={component => this.timeButtons[index] = component}
                                                            key={index}
                                                            style={
                                                                [styles.academySearchButton,
                                                                    {backgroundColor: "#0c48c2"},
                                                                ]
                                                            }
                                                            onPress={() => {
                                                                this._handleAClassPeriodButtonPress(obj);
                                                                console.log('this.timeButtons[] ', this.timeButtons);
                                                                console.log('length== ', this.timeButtons.length);
                                                                if (this.timeButtons.length > 1) {
                                                                    this.timeButtons.map((button, i) => {
                                                                        if (i === index) {
                                                                            this.setNativeProps(this.timeButtons[index], {backgroundColor: '#1cb684'});
                                                                        }
                                                                        else {
                                                                            this.setNativeProps(this.timeButtons[i], {backgroundColor: '#0c48c2'})
                                                                        }
                                                                    })
                                                                } else {
                                                                    this.setNativeProps(this.timeButtons[0], {backgroundColor: '#1cb684'})
                                                                }
                                                                console.log("Ref ===> ", this.timeButtons[index].props.style[1].backgroundColor)
                                                            }}

                                                        >
                                                            <Text style={{color: "white"}}>{obj.time}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )
                                            : (
                                                <Text style={{textAlign:'center', marginTop: 25}}>
                                                No classes today for {this.state.academyTitle}
                                                </Text>
                                            )
                                        }
                                        </View>
                                    )
                                }}
                            </Query>
                        )
                }


                {
                 this.state.timeSearch !== null
                ? (
                    <Query
                        query={ClassPeriodsTodayWithTime}
                        variables={{
                            academyTitle: this.state.academyTitle,
                            daySearch: this.state.daySearch,
                            timeSearch: this.state.timeSearch
                        }}
                        fetchPolicy={'network-only'}
                    >
                        {({loading, error, data}) => {
                            if(loading){
                                return(<View><Text>Loading</Text></View>)
                            }
                            if(error){
                                console.log(error.message);
                                return(<View><Text>`Error! ${error.message}`</Text></View>)
                            }
                            return(
                                <View style={{marginTop: 5}}>
                                    {data.classPeriodsTodayWithTime.map((obj, index) => (
                                        <View key={index}>
                                            {/** Class Period for CheckIn Status **/}
                                            <Text
                                                style={{
                                                    color: '#0c48c2',
                                                    padding:5,
                                                    fontWeight:'bold',
                                                    textAlign:'center',
                                                    fontStyle:'italic',
                                                }}
                                            >{obj.title} -- {obj.day} at {obj.time}</Text>
                                            {obj.academy.users.map((x, index) => (
                                                    <ListItem
                                                        key={index}
                                                        onSwipeFromLeft={() => {
                                                            this._submitUpsertClassSession(x.id);
                                                        }}
                                                        objectButtonRight={
                                                            <DeleteACheckIn
                                                                userId={x.id}
                                                                textColor={'white'}
                                                                classSessionTitle={this.state.todayClassSession}
                                                            />
                                                        }

                                                        swipeWhat={
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
                                                                classSessionTitle={this.state.todayClassSession}
                                                                //classSessionTitle={"Tue Jun 04 2019__cjw1kxp9c053r0882omxxn8qs"}
                                                            />
                                                        }
                                                    />
                                                )
                                              )
                                            }
                                        </View>
                                        )
                                      )
                                    }

                                </View>
                            )
                        }}
                    </Query>
                    )
                    : null
                }
                {
                    this.state.showClearButton
                    ? ( <Button
                            title={'Clear'}
                            onPress={() => {
                                this.setState({
                                    academyTitle: null,
                                    timeSearch: null,
                                    selectedClassPeriod: null,
                                    showClearButton: false,
                                    showUndoButton: false,
                                    todayClassSession: undefined,
                                });
                                this.clearSelections();
                                this.timeButtons = [];
                            }}
                        />
                    )
                    : null
                }

            </ScrollView>
        );
    }
}
const RosterListGraphQL = graphql(UpsertClassSession)(RosterList);

class SearchUsers extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            searchString: '',
            showCheckInModal: false,

            academyTitle: null,
            timeSearch: null,
            selectedClassPeriod: null,
            todayClassSession: undefined,
            instructorId: undefined,
            academyId: undefined,
            userId: undefined,
            checkInValues: undefined,
            myCheckInResult: undefined,


            showClearButton: false,
            showUndoButton: false,

            selectedOptions: [
                {"Location": "Dayton", "selected": false},
                {"Location": "Oxford", "selected": false},
                {"Location": "West Chester", "selected": false},
            ],
        }
        this.timeButtons = [];
        this.checkInButton = React.createRef();
    };
    _createCheckin = async () => {
        console.log('title: ', this.state.todayClassSession);
        console.log('classPeriodId: ', this.state.classPeriodId);
        console.log('instructorId: ', this.state.instructorId);
        console.log('academyId: ', this.state.academyId);
        console.log('userId: ', this.state.userId);
        const result = await this.props.createCheckIn({
            variables: {
                checked: true,
                userId: this.state.userId,
                classSessionTitle: this.state.todayClassSession,
            },
            refetchQueries: [

                {
                    query: checkInsByUserAndClassSession,
                    variables:{
                        userId: this.state.userId,
                        classSessionTitle: this.state.todayClassSession
                    }
                },
            ]
        }).then(data => {
            console.log('Success Create CheckIn: ', data)
        }).catch(error => {
            console.log('Failure of createCheckin: ', error);
        });
        if(result){
            console.log('Success Result: ', result);
            this.setState({myCheckInResult: result});
        }
    };

    _addToAcademyRoster = async (userId, academyId) => {
        const myAcademies = [];
        myAcademies.push(academyId);
        const result = await this.props.updateUser({
            variables: {
                userId: userId,
                academies: myAcademies
            },
            refetchQueries: [
                {
                    query: ClassPeriodsTodayWithTime,
                    variables:{
                        academyTitle: this.state.academyTitle,
                        daySearch: this.state.daySearch,
                        timeSearch: this.state.timeSearch
                    }
                },
            ]
        }).then(data => {
            console.log("Success of ADD_USER_TO_ACADEMY: ", data);
        }).catch(err => {
            console.log("ADDUSERTOACADEMY: ", err);
        })
    };

    setNativeProps = (x, nativeProps) => {
        x.setNativeProps(nativeProps);
    };

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
            showUndoButton: true,
            timeSearch: null,
            selectedClassPeriod: null,
        });
        this.timeButtons = [];
    }
    _handleAClassPeriodButtonPress(classPeriodObject){
        const today = new Date().toDateString();
        const titleSelector = today.concat("__", classPeriodObject.id);
        this.setState({
            timeSearch: classPeriodObject.time,
            selectedClassPeriod: classPeriodObject,
            todayClassSession: titleSelector,
            classPeriodId: classPeriodObject.id,
            academyId: classPeriodObject.academy.id,
            instructorId: classPeriodObject.instructor.id,
            showClearButton: true,
        });
        console.log('TimeSearch: ', classPeriodObject.time);
        console.log('state.timeSearch: ', this.state.timeSearch);
    }

    _toggleCheckInModal = () => {
        this.setState({showCheckInModal: !this.state.showCheckInModal})
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
                        onChangeText={(searchString) =>  this.setState({searchString}) }
                        value={this.state.searchString}
                        type={'text'}
                        accessibilityLabel={'Search Member field for Roster Search'}
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
                            <Query
                                query={SearchUser}
                                variables={{searchString: this.state.searchString}}
                                fetchPolicy={'network-only'}
                            >
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

                                    console.log('searchUserByName: ', data.searchUserByName)
                                    return(
                                        <View style={{marginTop: 5}}>
                                            {data.searchUserByName.map((obj, index) => (
                                                <ListItem
                                                    key={index}
                                                    onSwipeFromLeft={() => {
                                                        this.setState({userId: obj.id })
                                                        this._toggleCheckInModal();

                                                    }}
                                                    //onRightPress={() => {}}
                                                    objectButtonRight={
                                                        <DeleteACheckIn
                                                            userId={obj.id}
                                                            textColor={'white'}
                                                            classSessionTitle={this.state.todayClassSession}
                                                        />
                                                    }
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
                                                            classSessionTitle={this.state.todayClassSession}
                                                            //classSessionTitle={"Tue Jun 04 2019__cjw1kxp9c053r0882omxxn8qs"}

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
                <Modal
                    transparent={true}
                    animationType={"none"}
                    visible={this.state.showCheckInModal}
                    onRequestClose={() => this._toggleCheckInModal() }
                >
                    <TouchableOpacity
                        onPress={() => this._toggleCheckInModal()}
                    >
                        <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                            <TouchableWithoutFeedback>
                                <View style={{
                                        backgroundColor: 'rgba(250,250,250,1)',
                                        height: '60%',
                                        width: '85%',
                                        borderWidth:1,
                                    }}
                                >
                                    <View style={{
                                        backgroundColor:'#fff',flexDirection:"column",
                                        justifyContent: 'space-around', margin: 3,
                                         width: 'auto', padding: 5,
                                    }}
                                    >
                                        <Button
                                            title={'Close'}
                                            onPress={() => this._toggleCheckInModal()}
                                        />
                                        {
                                            this.state.showUndoButton
                                                ? (

                                                    <EvilIcons
                                                        name={"undo"}
                                                        color={"#1cb684"}
                                                        style={{textAlign:'center', fontWeight:'bold',alignSelf: 'center', marginBottom:3}}
                                                        size={32}
                                                        onPress={() => {
                                                            this.setState({
                                                                academyTitle: null,
                                                                timeSearch: null,
                                                                selectedClassPeriod: null,
                                                                showClearButton: false,
                                                                showUndoButton: false,
                                                                todayClassSession: undefined,
                                                            });
                                                            this.clearSelections();
                                                            this.timeButtons = [];
                                                        }}
                                                    />


                                                )
                                                : null
                                        }


                                        {
                                            this.state.academyTitle === null && this.state.timeSearch === null
                                                ? (
                                                    <ScrollView
                                                        horizontal={false}
                                                        showsHorizontalScrollIndicator={false}
                                                        overScrollMode={'always'}
                                                        centerContent={false}
                                                        //contentOffset={{x:40, y:0}}
                                                        snapToAlignment={'center'}
                                                        bounce={true}
                                                        style={{
                                                            flexDirection:'column',
                                                            borderWidth:1,
                                                            borderColor:'white',
                                                            padding:5,
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            height: '90%'

                                                        }}
                                                        contentContainer={{justifyContent:'center', alignItems:'center' }}
                                                    >
                                                        <TouchableOpacity
                                                            style={styles.academyCheckInButton}
                                                            onPress={() => {
                                                                this._handleAcademySearchButtonPress('Dayton');
                                                            }}

                                                        >
                                                            <Text style={ {color: "white"}}>Dayton</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.academyCheckInButton}
                                                            onPress={() => {
                                                                this._handleAcademySearchButtonPress('Oxford');
                                                            }}

                                                        >
                                                            <Text style={ {color: "white"}}>Oxford</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.academyCheckInButton}
                                                            onPress={() => {
                                                                this._handleAcademySearchButtonPress('West Chester');
                                                            }}

                                                        >
                                                            <Text style={ {color:  "white" }}>West Chester</Text>

                                                        </TouchableOpacity>
                                                    </ScrollView>
                                                )
                                                : <View style={{
                                                    flexDirection:'row',
                                                    justifyContent: 'space-around',
                                                    padding:0,
                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                    width: '100%'
                                                }}>
                                                    <Text
                                                        style={{
                                                            color: '#fff',
                                                            padding:5,
                                                            fontWeight:'bold',
                                                            textAlign:'center',
                                                            fontSize:18
                                                        }}
                                                    >
                                                        {this.state.academyTitle}
                                                    </Text>
                                                </View>
                                        }


                                        {
                                            this.state.academyTitle === null
                                                ? null
                                                : (
                                                    <Query
                                                        query={ClassPeriodsToday}
                                                        variables={{
                                                            academyTitle: this.state.academyTitle,
                                                            daySearch: this.state.daySearch,

                                                        }}
                                                        fetchPolicy={'network-only'}
                                                    >
                                                        {({loading, error, data}) => {
                                                            if(loading){
                                                                return(<View><Text>Loading</Text></View>)
                                                            }
                                                            if(error){
                                                                console.log(error.message);
                                                                return(<View><Text>`Error! ${error.message}`</Text></View>)
                                                            }
                                                            return(
                                                                <ScrollView
                                                                    horizontal={true}
                                                                    showsHorizontalScrollIndicator={true}
                                                                    overScrollMode={'always'}
                                                                    centerContent={false}
                                                                    contentOffset={{x:0, y:0}}
                                                                    snapToAlignment={'start'}
                                                                    bounce={true}
                                                                    style={{
                                                                        flexDirection:'row',
                                                                        borderWidth:1,
                                                                        borderColor:'#000',
                                                                        padding:8,
                                                                        width: '100%'
                                                                    }}
                                                                    contentContainer={{justifyContent:'space-between', alignItems:'center' }}
                                                                >
                                                                    {data.classPeriodsToday.map((obj, index) => (
                                                                        <TouchableOpacity
                                                                            ref={component => this.timeButtons[index] = component}
                                                                            key={index}
                                                                            style={
                                                                                [styles.academySearchButton,
                                                                                    {backgroundColor: "#0c48c2", marginLeft: 15, marginRight:15, height: 40, },
                                                                                ]
                                                                            }
                                                                            onPress={() => {
                                                                                this._handleAClassPeriodButtonPress(obj);
                                                                                console.log('this.timeButtons[] ', this.timeButtons);
                                                                                console.log('length== ', this.timeButtons.length );
                                                                                if(this.timeButtons.length > 1){
                                                                                    this.timeButtons.map((button, i) => {
                                                                                        if(i === index){
                                                                                            this.setNativeProps(this.timeButtons[index], {backgroundColor: '#1cb684'});
                                                                                        }
                                                                                        else {
                                                                                            this.setNativeProps(this.timeButtons[i], {backgroundColor:'#0c48c2'})
                                                                                        }
                                                                                    })
                                                                                } else{
                                                                                    this.setNativeProps(this.timeButtons[0], {backgroundColor: '#1cb684'} )
                                                                                }
                                                                                console.log("Ref ===> ",this.timeButtons[index].props.style[1].backgroundColor)
                                                                            }}

                                                                        >
                                                                            <Text style={ {color: "white"}}>{obj.time}</Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </ScrollView>
                                                            )
                                                        }}
                                                    </Query>
                                                )
                                        }


                                        {
                                            this.state.timeSearch !== null
                                                ? (
                                                    <Query
                                                        query={ClassPeriodsTodayWithTime}
                                                        variables={{
                                                            academyTitle: this.state.academyTitle,
                                                            daySearch: this.state.daySearch,
                                                            timeSearch: this.state.timeSearch
                                                        }}
                                                        fetchPolicy={'network-only'}
                                                    >
                                                        {({loading, error, data}) => {
                                                            if(loading){
                                                                return(<View><Text>Loading</Text></View>)
                                                            }
                                                            if(error){
                                                                console.log(error.message);
                                                                return(<View><Text>`Error! ${error.message}`</Text></View>)
                                                            }
                                                            return(
                                                                <View style={{alignItems: 'center', justifyContent:'center', marginTop: 15}}>
                                                                    {data.classPeriodsTodayWithTime.map((obj, index) => (
                                                                            <View key={index}>
                                                                                {/** Class Period for CheckIn Status **/}
                                                                                <Text
                                                                                    style={{
                                                                                        color: '#0c48c2',
                                                                                        padding:5,
                                                                                        fontWeight:'bold',
                                                                                        textAlign:'center',
                                                                                        fontStyle:'italic',
                                                                                    }}
                                                                                >
                                                                                    {obj.title} -- {obj.day} at {obj.time}
                                                                                </Text>
                                                                                <View style={{alignItems: 'center', justifyContent:'center', marginTop: 15}}>
                                                                                    <Ionicons
                                                                                        ref={this.checkInButton}
                                                                                        name={'ios-checkmark-circle'}
                                                                                        color={'#0c48c2'}
                                                                                        size={75}
                                                                                        style={{
                                                                                            paddingTop: 20,
                                                                                            shadowOffset: {width: 1, height: 2,},
                                                                                            shadowColor: 'black',
                                                                                            shadowOpacity: 1.0,
                                                                                            shadowRadius: 2,
                                                                                        }}
                                                                                        onPress={() => {
                                                                                            this.setNativeProps(this.checkInButton.current, {style: {color: '#1cb684' }})
                                                                                            this._createCheckin();
                                                                                            this._addToAcademyRoster(this.state.userId, this.state.academyId);
                                                                                        } }

                                                                                    />
                                                                                    <Text>Check-In</Text>
                                                                                </View>

                                                                            </View>
                                                                        )
                                                                    )
                                                                    }

                                                                </View>
                                                            )
                                                        }}
                                                    </Query>
                                                )
                                                : null
                                        }

                                    </View>

                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>
        );
    }
}
SearchUsers.propTypes = {
    classPeriodId: PropTypes.string,
    academyId: PropTypes.string,
    instructorId: PropTypes.string,
};

const SearchUsersGraphQL = compose(
    graphql(CREATE_CHECKIN,{ name: "createCheckIn"}),
    graphql(ADD_USER_TO_ACADEMY, {name: "updateUser"}),
)(SearchUsers);


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
                <FullRosterButton navigation={() => this.props.navigation.navigate('FullRoster')}/>
                <ScrollView
                    contentContainer={{justifyContent:'flex-start', alignItems:'center'}}
                    style={{width:'100%', alignContent:'center', marginBottom:20}}
                >
                    <SearchUsersGraphQL navigation={this.props.navigation}/>
                    <RosterListGraphQL navigation={this.props.navigation}/>
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
    academyCheckInButton: {
        borderWidth: 1,
        borderRadius:10,
        borderColor: '#dadada',
        justifyContent:'space-around',
        alignItems: 'center',
        alignContent:'center',
        alignSelf:'center',
        textAlign:'center',
        padding: 10,
        marginTop:20,
        marginBottom: 20,
        backgroundColor:'rgba(0,0,0,0.2)',
        shadowOffset: {width: 0, height: 1,},
        shadowColor: '#0c48c2',
        shadowOpacity: 1,
        shadowRadius: 1,
    },
});
