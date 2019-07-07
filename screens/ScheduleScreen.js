import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet, Text, View, ActivityIndicator, Platform, Dimensions,
    TouchableOpacity, FlatList, RefreshControl, Button, ScrollView, TouchableWithoutFeedback, Modal, Image,
} from 'react-native';
import gql from 'graphql-tag';
import {graphql, Query}  from 'react-apollo';
import ScheduleItem from '../components/ScheduleItem';
import {Entypo} from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import MenuButton from '../components/MenuButton'

import _forEach from 'lodash/forEach'
import _sortBy from 'lodash/sortBy';



const window = Dimensions.get('window');
const W = window.width;
const H = window.height;


const GET_SCHEDULES = gql `
    query($academyTitle: String){    
	    classPeriodsByAcademy(academyTitle: $academyTitle){
            time
            day
            title
            academy{title}
            classSessions{id, checkIns{checked}}
            id
        }
    }
`
const CLASS_PERIODS = gql`
    query{    
	    classPeriods{
            time
            day
            title
            academy{title}
            instructor{ 
                id
                bio
                lineage
                photo 
                user{
                    id
                    firstName
                    phone
                }
            }
            classSessions{id, checkIns{checked}}
            id
        }
    }
`

const weekdayList = [
    {"title": "Monday", "value": 0},
    {"title": "Tuesday", "value": 1},
    {"title": "Wednesday", "value": 2},
    {"title": "Thursday", "value": 3},
    {"title": "Friday", "value": 4},
    {"title": "Saturday", "value": 5},
    {"title": "Sunday", "value": 6},
];



class ScheduleScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props){
        super(props);
        this.state = {
            items: [],
            loading: true,
            refreshing: false,
            showInstructorModal: false,
            modalClassTitle: undefined,
            modalClassAcademy: undefined,
            modalClassInstructor: undefined,
            instructorBio: undefined,
            instructorLineage: undefined,
            instructorPhoto: undefined,
            instructorPhone: undefined,
            academyTitle: null,
            daySearch: null,
            showClearButton: false,
            selectedOptions: [
                {"Location": "Dayton", "selected": false},
                {"Location": "Oxford", "selected": false},
                {"Location": "West Chester", "selected": false},
            ],
            selectedDayOptions: [
                {"title": "Monday", "selected": false},
                {"title": "Tuesday", "selected": false},
                {"title": "Wednesday", "selected": false},
                {"title": "Thursday", "selected": false},
                {"title": "Friday", "selected": false},
                {"title": "Saturday", "selected": false},
                {"title": "Sunday", "selected": false},
            ],

        };
    };
    _toggleInstructorModal(){
        this.setState({showInstructorModal: !this.state.showInstructorModal})
    }
    _setClassAndInstructorModalDetails(title, inst, bio, lineage, pic, academy, phone){
        this.setState({
            modalClassTitle: title,
            modalClassAcademy: academy,
            modalClassInstructor: inst,
            instructorBio: bio,
            instructorLineage: lineage,
            instructorPhoto: pic,
            instructorPhone: phone,

        })
    }
    clearAcademySelections(){
        let newSelections = [...this.state.selectedOptions];
        newSelections.map(obj => obj.selected = false);
        this.setState({selectedOptions: newSelections});
    }
    clearDaySelections(){
        let newSelections = [...this.state.selectedDayOptions];
        newSelections.map(obj => obj.selected = false);
        this.setState({selectedDayOptions: newSelections, daySearch: null});

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

    updateChoiceOfDay(day){
        let newSelections = [...this.state.selectedDayOptions];
        newSelections.filter(obj =>
            obj.title === day
                ? obj.selected = true
                : obj.selected = false
        );
        this.setState({selectedDayOptions: newSelections});
    }

    _handleAcademySearchButtonPress(searchString){
        this.updateChoice(searchString);
        this.setState({academyTitle: searchString, daySearch: null});
        this.clearDaySelections();
        setTimeout(()=>this.setState({showClearButton: true}), 500);
    }


    _handleDayFilterButtonPress(day){
        this.updateChoiceOfDay(day);
        this.setState({
            daySearch: day,
            academyTitle: null,
        });
        this.clearAcademySelections();
    }

    _onRefresh = () => {
        this.setState({refreshing:true});
        this.props.data.refetch().then(() => {
            this.setState({refreshing: false});
        });
    };
    _renderItem = ({item}) => {
        return(
            <View>
                <TouchableOpacity
                    onPress={() => {
                        this._toggleInstructorModal();
                        this._setClassAndInstructorModalDetails(item.title, item.instructor.user.firstName, item.instructor.bio, item.instructor.lineage, item.instructor.photo, item.academy.title, item.instructor.user.phone)
                    }}
                    key={this._keyExtractor}
                >
                    <ScheduleItem
                        id={item.id}
                        title={item.title}
                        time = {item.time}
                        day={item.day}
                        instructorName={item.instructor.user.firstName}
                    />
                </TouchableOpacity>
            </View>

        )
    };
    _renderDayClassPeriods = ({item}) => {
        return(
            <View>
                <TouchableOpacity
                    onPress={() => {
                        this._toggleInstructorModal();
                        this._setClassAndInstructorModalDetails(item.title, item.instructor.user.firstName, item.instructor.bio, item.instructor.lineage, item.instructor.photo, item.academy.title, item.instructor.user.phone)

                    }}
                    key={this._keyExtractor}
                >
                    <ScheduleItem
                        id={item.id}
                        title={item.title}
                        time = {item.time}
                        day={item.day}
                        academy={item.academy.title}
                        instructorName={item.instructor.user.firstName}
                    />
                </TouchableOpacity>
            </View>

        )
    };

    _keyExtractor = (item) => item.id;


    render(){

    return (
        <View style={{flex:1, alignItems:'center', justifyContent:'flex-start'}}>
            <Text style={{marginTop:60, fontWeight:'bold', fontSize: 18}}>Academy Schedules</Text>
            <View style={styles.academyButtonRow}>
                <TouchableOpacity
                    style={
                        [styles.academySearchButton,
                            {backgroundColor: (this.state.selectedOptions[0].selected ? 'rgba(250,250,250,0.8)' : "#1cb684")},
                        ]
                    }
                    onPress={() => {
                        this._handleAcademySearchButtonPress('Dayton');
                    }}

                >
                    <Text style={ {color: (this.state.selectedOptions[0].selected ? "#2e5885" : "white")}}>Dayton</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.academySearchButton,
                            {backgroundColor: (this.state.selectedOptions[1].selected ? 'rgba(250,250,250,0.8)' : "#1cb684")},
                        ]
                    }
                    onPress={() => {
                        this._handleAcademySearchButtonPress('Oxford');
                    }}

                >
                    <Text style={ {color: (this.state.selectedOptions[1].selected ? "#2e5885" : "white")}}>Oxford</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.academySearchButton,
                            {backgroundColor: (this.state.selectedOptions[2].selected ? 'rgba(250,250,250,0.8)': "#1cb684")}
                        ]
                    }
                    onPress={() => {
                        this._handleAcademySearchButtonPress('West Chester');
                    }}

                >
                    <Text style={ {color: (this.state.selectedOptions[2].selected ? "#2e5885" : "white")}}>West Chester</Text>

                </TouchableOpacity>
            </View>
            <View style={styles.dayButtonRow}>
            <ScrollView
                horizontal={true}
                contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'space-around',

                }}
                style={{
                    width: W,
                    flexDirection:'row',
                    padding:5,
                }}
            >
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[0].selected ? '#fff' : "#26a2dd")},
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Monday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[0].selected ? "#26a2dd" : "white")}}>Monday</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[1].selected ? '#fff' : "#26a2dd")},
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Tuesday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[1].selected ? "#26a2dd" : "white")}}>Tuesday</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[2].selected ? '#fff': "#26a2dd")}
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Wednesday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[2].selected ? "#26a2dd" : "white")}}>Wednesday</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[3].selected ? '#fff': "#26a2dd")}
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Thursday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[3].selected ? "#26a2dd" : "white")}}>Thursday</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[4].selected ? '#fff': "#26a2dd")}
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Friday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[4].selected ? "#26a2dd" : "white")}}>Friday</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[5].selected ? '#fff': "#26a2dd")}
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Saturday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[5].selected ? "#26a2dd" : "white")}}>Saturday</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    style={
                        [styles.daySearchButton,
                            {backgroundColor: (this.state.selectedDayOptions[6].selected ? '#fff': "#26a2dd")}
                        ]
                    }
                    onPress={() => {
                        this._handleDayFilterButtonPress('Sunday');
                    }}

                >
                    <Text style={ {color: (this.state.selectedDayOptions[6].selected ? "#26a2dd" : "white")}}>Sunday</Text>

                </TouchableOpacity>
            </ScrollView>
            </View>
            <View style={{flex:1, }}>
                    <Query
                        query={CLASS_PERIODS}
                        // variables={{academyTitle: this.state.academyTitle}}
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
                            let classData = _forEach(data.classPeriods, function(classPeriod, index){
                                weekdayList.map(weekday => {
                                    if(weekday.title === classPeriod.day){
                                        classPeriod.dayValue= weekday.value;
                                    }
                                })
                            });

                            console.log('class Data: ', classData)


                            return(

                                <View  style={styles.daySlide}>
                                    {this.state.academyTitle
                                        ? (
                                            <View style={styles.dayScheduleContainer}>
                                                <Text style={styles.text}>{this.state.academyTitle}</Text>
                                            </View>
                                        )
                                        : null
                                    }
                                    {this.state.daySearch
                                        ? (
                                            <View style={styles.dayScheduleContainer}>
                                                <Text style={styles.text}>{this.state.daySearch}</Text>
                                            </View>
                                        )
                                        : null
                                    }

                                    {
                                        this.state.daySearch
                                        ? (
                                            <FlatList
                                                data={_sortBy(data.classPeriods.filter(obj => obj.day === this.state.daySearch), 'academy.title') }
                                                keyExtractor={this._keyExtractor}
                                                renderItem={this._renderDayClassPeriods}
                                                refreshControl={
                                                    <RefreshControl
                                                        refreshing={this.state.refreshing}
                                                        onRefresh={this._onRefresh}
                                                        tintColor={'#931414'}
                                                    />
                                                }
                                            />
                                        )
                                        : null
                                    }
                                    {
                                        this.state.academyTitle
                                        ? (
                                                <FlatList
                                                    data={_sortBy(classData.filter(obj => obj.academy.title === this.state.academyTitle), 'dayValue')}
                                                    keyExtractor={this._keyExtractor}
                                                    renderItem={this._renderItem}
                                                    refreshControl={
                                                        <RefreshControl
                                                            refreshing={this.state.refreshing}
                                                            onRefresh={this._onRefresh}
                                                            tintColor={'#931414'}
                                                        />
                                                    }
                                                />
                                        )
                                        : null
                                    }
                                    {
                                        this.state.academyTitle === null && this.state.daySearch === null
                                            ? (

                                                <FlatList
                                                    data={_sortBy(classData, 'dayValue')}
                                                    keyExtractor={this._keyExtractor}
                                                    renderItem={this._renderDayClassPeriods}
                                                    refreshControl={
                                                        <RefreshControl
                                                            refreshing={this.state.refreshing}
                                                            onRefresh={this._onRefresh}
                                                            tintColor={'#931414'}
                                                        />
                                                    }
                                                />
                                            )
                                            : null
                                    }


                                </View>
                            )
                        }}
                    </Query>
                <Modal
                    transparent={true}
                    animationType={"none"}
                    visible={this.state.showInstructorModal}
                    onRequestClose={() => this._toggleInstructorModal() }
                >
                    <TouchableOpacity
                        onPress={() => this._toggleInstructorModal()}
                    >
                        <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                            <TouchableWithoutFeedback>
                                <View style={{
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    minHeight: '70%',
                                    height: 'auto',
                                    width: '85%',
                                    borderWidth:2,
                                    borderColor: 'white'
                                }}
                                >
                                    <View style={{ flex:1,
                                        backgroundColor:'transparent',flexDirection:"column",
                                        justifyContent: 'space-around', margin: 3,
                                        width: 'auto', padding: 5,
                                    }}
                                    >

                                        <View style={{ alignItems: 'center',}}>
                                            <Text style={{color: 'white'}}>{this.state.modalClassTitle}</Text>
                                            <Text style={{color: 'white'}}>{this.state.modalClassAcademy}</Text>
                                        </View>
                                        <View style={{flex:1, alignItems: 'center', marginTop:15, padding: 8}}>
                                            <Image
                                                source={{uri:this.state.instructorPhoto}}
                                                style={{
                                                    width:200,
                                                    height: 200,
                                                    resizeMode: 'cover',
                                                    borderRadius: 30,
                                                    borderWidth:1,
                                                    borderColor: 'white'
                                                }}
                                            />

                                            <Text style={{color: 'white', marginTop: 20}}>{this.state.modalClassInstructor}</Text>
                                            <Text style={{color: 'white', marginTop: 5}}>{this.state.instructorPhone}</Text>

                                            <Text style={{color: 'white', marginTop: 20}}>{this.state.instructorBio}</Text>

                                            <Text style={{color: 'white', marginTop: 20}}>{this.state.instructorLineage}</Text>
                                        </View>



                                    </View>

                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </TouchableOpacity>
                </Modal>


            {
                this.state.showClearButton
                    ? (
                        <View style={{position:'relative', top:-20}}>
                            <Button
                                title={'Clear'}
                                onPress={() => {
                                    this.setState({academyTitle: null, showClearButton: false});
                                    this.clearAcademySelections();
                                    this.clearDaySelections();
                                }}
                            />
                        </View>
                    )
                    : null
            }
            </View>


        </View>
    );
  }
}
ScheduleScreen.propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.object,
    Dayton: PropTypes.array,
    WestChester: PropTypes.array,
    Oxford: PropTypes.array,
};

const AllAcademySchedules =  graphql(GET_SCHEDULES)(ScheduleScreen);

export default class ScheduleDisplay extends React.Component{
    static navigationOptions = {
        header: null,
    };
    constructor(){
        super();
    }
    render(){
        return(
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <MenuButton navigation={this.props.navigation}/>
                <AllAcademySchedules/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dayScheduleContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: W,
        marginTop:5,
        marginBottom:5,
        padding: 5
    },
    wrapper:{
        marginTop: 10,
        marginBottom: 60,
        paddingBottom:20,
        backgroundColor: 'transparent',
    },
    daySlide:{
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        //borderColor: '#931414',
        //backgroundColor: '#cdcdcd',

    },
    text:{
        color: 'white',
        fontWeight: '500',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        fontSize: (Platform.isPad ? W*.04 : 24),
        marginLeft: 40,
        marginRight: 40,
    },
    academyButtonRow:{
        marginTop: 15,
        flexDirection:'row',
        justifyContent: 'space-around',
        borderWidth:2,
        padding:5,
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: W,
    },
    dayButtonRow:{
        marginTop: 5,
        // flexDirection:'row',
        justifyContent: 'space-around',
        borderWidth:2,
        alignItems:'center',
        padding:5,
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: W,
        // height: 60
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
    daySearchButton: {
        //backgroundColor: '#8c030b',
        borderWidth:1,
        padding: 10,
        shadowOffset: {width: 1, height: 2,},
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 2,
        borderRadius: 10,
        marginRight: 15
    },
    academySearchText: {
        color: '#fff'
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
});

{/*<View style={{flex:1, alignItems: 'center', marginTop:30}}>*/}
{/*<Text style={{fontStyle:'italic', fontSize: 16}}>Filter By Academy or Day</Text>*/}
{/*</View>*/}