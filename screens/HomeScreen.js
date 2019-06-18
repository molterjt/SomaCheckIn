import React from 'react';
import {
    Button,
    Platform,
    KeyboardAvoidingView,
    TextInput,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground, Dimensions, TouchableWithoutFeedback, ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import { WebBrowser } from 'expo';
import SomaJJLogo from '../assets/images/SomaJJ_Logo.png';
import WhiateASRash from '../assets/images/WhiteASRash.png';
import MenuButton from '../components/MenuButton';
import ScheduleItem from '../components/ScheduleItem';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons'
import gql from 'graphql-tag';
import {graphql, Mutation, Query} from 'react-apollo';
import {checkInsByUserAndClassSession} from "./RosterScreen";

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
            academies{
                id
                title
            }
        }
    }
`

const CLASSPERIODS_TODAY = gql`
    query($academyTitle: String, $daySearch: String){     
      classPeriodsToday(academyTitle: $academyTitle, daySearch: $daySearch){
        id
        time
        day
        title
        instructor{id}
        academy{
            id
            title
        }
        classSessions{
            id, 
            title,
            checkIns{
                id
                checked
            }
        }
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
        classSession{id,title}
      }
    }
`;
const UPSERT_CLASSCHECKIN = gql`
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


class AcademyClassCheckInObject extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            classSessionTitle: undefined,
            classTimes: [],
            classButtonPress: false,
            selected: false
        };
        this.classPeriods = [];
    }
    _handleClassPeriodButtonPress = async (i) => {
        //const today = new Date().toDateString();
        //const titleSelector = await today.concat("__", classPeriodId);
        this.classPeriods[i].selected = !this.classPeriods[i].selected;

       // await this.setState({classSessionTitle: titleSelector,});
        console.log('classTimes: ', this.classPeriods);
        //console.log('classSessionTitle: ', this.state.classSessionTitle)

    };

    assignClassTimes = () => {
        const newEntry = Object.assign({"selected": false});
        this.classPeriods.push(newEntry);
    };
    _toggleSelection = () => { this.setState({ selected: !this.state.selected })}
    render(){
        return(
            <View style={{marginTop: 40}}>


                    <View style={{backgroundColor: 'transparent', padding: 10,}}>

                        <View style={styles.rowContainer}>
                            <TouchableOpacity
                                ref={component => this.classPeriods[this.props.classIndex] = component}
                                onPress={() => {
                                 this._toggleSelection();
                                }}
                                disabled={this.props.checkInSuccess}
                            >
                                {this.state.selected
                                    ? (
                                        <MaterialCommunityIcons
                                            name={"minus-circle"}
                                            color={"#8c030b"}
                                            size={43}
                                        />
                                    )
                                    : (
                                        <MaterialCommunityIcons
                                            name={"plus-circle"}
                                            color={"#1cb684"}
                                            size={43}
                                        />
                                    )
                                }
                            </TouchableOpacity>
                            <Text style={styles.classTitle}>{this.props.title}</Text>
                            <Text style={styles.classTime}>{this.props.time}</Text>
                        </View>
                        {
                            (this.state.selected  && this.props.checkInSuccess === false)
                                ? (
                                    <TouchableOpacity
                                        style={{
                                            marginTop: 20,
                                            borderRadius: 30,
                                            backgroundColor: '#8c030b',
                                            alignItems:'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: 'white',
                                            width: '35%',
                                            alignSelf: 'center',
                                            padding: 10
                                        }}
                                        onPress={this.props.createCheckIn}
                                    >
                                        <Text style={{color:'white'}}>Check-In</Text>
                                    </TouchableOpacity>
                                )
                                : null
                        }
                    </View>
            </View>
        );
    }
}
AcademyClassCheckInObject.propTypes = {
    createCheckIn: PropTypes.func,
    academyTitle: PropTypes.string,
    academyClassPeriodData: PropTypes.array,
    classPeriodId: PropTypes.string,
    title: PropTypes.string,
    time: PropTypes.string,
    checkInSuccess: PropTypes.bool,


}


class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props);
    this.state={
      showModal: false,
      myEmail: '',
      today: new Date().toISOString(),
      classSessionTitle: undefined,
      userId: undefined,
      userFirstName: undefined,
      classPeriodTitle: undefined,
      classPeriodTime: undefined,
      classPeriodAcademyTitle: undefined,
      academyTitle: undefined,
      checkInValues: undefined,
      checkInSuccess: false,

    selectedOptions: [
        {"Location": "Dayton", "selected": false},
        {"Location": "Oxford", "selected": false},
        {"Location": "West Chester", "selected": false},
    ],
    }
  }

  renderToday() {
    const today = new Date();
    const weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[today.getDay()];
  }
  toggleModal = () => {this.setState({showModal: !this.state.showModal})};

  _handleClassPeriodButtonPress = async (classsPeriodObjectId, classPeriodObjectTitle, classPeriodObjectTime, classPeriodObjectAcademyTitle ) => {
      const today = new Date().toDateString();
      const titleSelector = today.concat("__", classsPeriodObjectId);
      if(this.state.classSessionTitle === undefined){
          await this.setState({classSessionTitle: titleSelector});
      } else{
          this.setState({classSessionTitle: undefined});
      }

      await this.setState({classPeriodTitle: classPeriodObjectTitle});
      await this.setState({classPeriodTime: classPeriodObjectTime});
      await this.setState({classPeriodAcademyTitle: classPeriodObjectAcademyTitle});
      console.log("state.userId: ", this.state.userId);
      console.log("state.classSessionTitle: ", this.state.classSessionTitle);
  };

  _createCheckIn = async (classPeriodId) => {
      const today = new Date().toDateString();
      const titleSelector = await today.concat("__", classPeriodId);
      const result = await this.props.mutate({
        variables: {
            checked: true,
            userId: this.state.userId,
            classSessionTitle: titleSelector,
        },

    }).then(data => {
        console.log('CREATE_CHECKIN SUCCESS: ', data)
    }).catch(error => {
        console.log('CREATE_CHECKIN ERROR: ', error)
    });
    if(result){
        console.log("CREATE_CHECKIN_RESULT: ", result)
    }
  };

  _handleUpsertClassSessionCheckIn = async (classPeriodId, instructorId, academyId) => {
      const today = new Date().toDateString();
      const titleSelector = await today.concat("__", classPeriodId);
      const memberArray = [];
      const newPerson = Object.assign({"userId": this.state.userId, "checked":true});
      console.log('newPerson: ', newPerson);
      memberArray.push(newPerson);
      this.setState({checkInValues: memberArray});

      const result = await this.props.mutate({
          variables:{
              classPeriodId: classPeriodId,
              instructorId: instructorId,
              academyId: academyId,
              checkInValues: this.state.checkInValues,
          },
          refetchQueries: [

              {
                  query: checkInsByUserAndClassSession,
                  variables:{
                      userId: this.state.userId,
                      classSessionTitle: titleSelector
                  }
              },
          ],
      }).then(data => {
          console.log('CREATE_CHECKIN SUCCESS: ', data);
          this._toggleCheckInSuccess();
      }).catch(error => {
          console.log('CREATE_CHECKIN ERROR: ', error)
      });
      if(result){
          console.log("CREATE_CHECKIN_RESULT: ", result);
          this.setState({ checkInSuccess: true })
      }
  };

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
    clearSelections(){
        let newSelections = [...this.state.selectedOptions];
        newSelections.map(obj => obj.selected = false);
        this.setState({selectedOptions: newSelections, academyTitle: undefined});

    }
    _toggleCheckInSuccess = async () => {
        this.setState({ checkInSuccess: !this.state.checkInSuccess });
    }




  render() {
    const {showModal} = this.state;
    return (
      <View style={styles.container}>
          <MenuButton navigation={this.props.navigation}/>
          <ImageBackground
              source={SomaJJLogo}
              resizeMode={'contain'}
              width={400}
              style={{
                  width:250,
                  height: 400,
                  alignItems:'center',
                  alignSelf: 'center',
                  justifyContent:'center'}}
          >
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

                          <View style={{position:'absolute', top: 20}}>
                              <Text style={{fontStyle:'italic', fontSize: 20}}>
                                  Welcome {data.me.firstName}!
                              </Text>
                              <Ionicons
                                  name={'ios-checkmark-circle'}
                                  color={"#1cb684"}
                                  size={100}
                                  style={{
                                      padding: 20,
                                      position: 'relative',
                                      bottom: -300,
                                      shadowOffset: {width: 1, height: 2,},
                                      shadowColor: 'black',
                                      shadowOpacity: 1.0,
                                      shadowRadius: 2,
                                  }}
                                  onPress={() => {
                                      this.setState({
                                          userId: data.me.id,
                                          userFirstName: data.me.firstName
                                      });
                                      this.toggleModal();
                                  } }
                              />
                              <Text style={{
                                  position: 'relative',
                                  bottom: -270,
                                  color: "#1cb684",
                                  marginTop: 5,
                                  textAlign:'center'
                              }}>Check-In</Text>
                          </View>


                      )
                  }}
              </Query>


              <Modal
                  animationType="none"
                  transparent={false}
                  visible={showModal}
                  onRequestClose={() => this.toggleModal()}
              >
                  <View style={{backgroundColor:'rgba(0,0,0,0.8)', paddingTop: 60}}>
                      <Ionicons
                          name={"md-close-circle-outline"}
                          color={"#ffffff"}
                          size={32}
                          onPress={() => this.toggleModal() }
                          style={{
                              position:'absolute',
                              top: 30,
                              right: 10
                          }}
                    />
                  </View>
                  <ScrollView
                      style={{
                          flex:1,
                          marginTop: 0,
                          backgroundColor:'rgba(0,0,0,0.8)' ,
                          paddingBottom: 50,
                          width: '100%'
                      }}
                      contentContainerStyle={{
                          alignItems:'center',
                          justifyContent:'flex-start',
                      }}
                      showsVerticalScrollIndicator={false}
                  >
                      <ImageBackground
                          source={WhiateASRash}
                          resizeMode={'contain'}
                          style={{
                              width:200,
                              height: 200,
                              alignItems:'center',
                              alignSelf: 'center',
                              justifyContent:'center',
                              paddingTop: 40,
                              shadowOffset: {width: 1, height: 1,},
                              shadowColor: '#a1030b',
                              shadowOpacity: 1.0,
                              shadowRadius: 3,
                          }}
                      />
                      {
                          this.state.academyTitle === undefined
                              ? (
                                  <View
                                      style={{
                                      flexDirection:'row',
                                      justifyContent: 'space-around',
                                      borderWidth:1,
                                      borderColor:'white',
                                      padding:5,
                                      width: '96%',
                                      alignItems:'center',
                                  }}
                                  >
                                      <TouchableOpacity
                                          style={styles.academyCheckInButton}
                                          onPress={() => { this._handleAcademySearchButtonPress('Dayton') }}
                                      >
                                          <Text style={styles.academyTitle}>Dayton</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                          style={styles.academyCheckInButton}
                                          onPress={() => {
                                              this._handleAcademySearchButtonPress('Oxford');
                                          }}

                                      >
                                          <Text style={styles.academyTitle}>Oxford</Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                          style={styles.academyCheckInButton}
                                          onPress={() => {
                                              this._handleAcademySearchButtonPress('West Chester');
                                          }}

                                      >
                                          <Text style={styles.academyTitle}>West Chester</Text>

                                      </TouchableOpacity>
                                  </View>
                              )
                              : null
                      }

                      {
                          this.state.academyTitle
                          ? (
                              <Query
                                  query={CLASSPERIODS_TODAY}
                                  variables={{academyTitle: this.state.academyTitle}}
                                  fetchPolicy={'network-only'}>
                                  {({loading, error, data}) => {
                                      if(loading){
                                          return(
                                              <View><Text>Loading</Text></View>
                                          )
                                      }
                                      if(error){
                                          console.log(error.message);
                                          return(<View><Text>`Error! ${error.message}`</Text></View>)
                                      }
                                      return(
                                          <View
                                              style={{ backgroundColor: 'transparent', justifyContent: 'space-evenly',}}
                                          >
                                              <Text style={styles.dayHeader}>
                                                  Classes for {this.renderToday()}
                                              </Text>
                                              <View style={ [styles.academyTitleContainer, {marginTop: 20}]}>
                                                  <Text style={styles.academyTitle}>
                                                      {this.state.academyTitle}
                                                  </Text>
                                              </View>
                                              {data.classPeriodsToday.length > 0
                                                  ?
                                                  <View>

                                                      {data.classPeriodsToday.map((obj, index) => (
                                                      <AcademyClassCheckInObject
                                                          key={index}
                                                          time={obj.time}
                                                          title={obj.title}
                                                          checkInSuccess={this.state.checkInSuccess}
                                                          createCheckIn={() => {
                                                              this._handleUpsertClassSessionCheckIn(
                                                                  obj.id,
                                                                  obj.instructor.id,
                                                                  obj.academy.id,
                                                              )
                                                          }}

                                                      />
                                                  ))

                                                  }
                                                  </View>
                                                  : <Text style={styles.academyTitle}>No classes available today</Text>
                                              }
                                              {
                                                  this.state.checkInSuccess
                                                      ? (
                                                          <View style={{alignSelf:'center', marginTop: 30, marginBottom: 30}}>
                                                              <MaterialCommunityIcons
                                                                  style={{alignSelf:'center'}}
                                                                  name={"thumb-up-outline"}
                                                                  color={"#1cb684"}
                                                                  size={60}
                                                              />
                                                              <Text style={{color: '#fff', textAlign:'center', marginTop: 10}}>
                                                                  You have successfully checked-in!
                                                              </Text>
                                                              <Text style={{color: '#fff', textAlign:'center', marginTop: 10}}>
                                                                  Thank you, {this.state.userFirstName}!
                                                              </Text>
                                                          </View>
                                                      )
                                                      : null
                                              }
                                              <Button
                                                style={{padding: 50, marginTop: 30 }}
                                                title={'Clear'}
                                                onPress={() => this.clearSelections()}
                                              />
                                          </View>
                                      )
                                  }}
                              </Query>
                          )
                          : null
                      }

                  <View style={{height: 50}}/>
                  </ScrollView>
              </Modal>
          </ImageBackground>
      </View>
    );
  }
}

export default graphql(UPSERT_CLASSCHECKIN)(HomeScreen);

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        textAlign:'center',
        alignItems:'center',
        padding: 5,
        margin: 2,
        height: Dimensions.get('window').height * 0.08,
        width: Dimensions.get('window').width,
        borderRadius: 4,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 2.0,
        shadowRadius: 3,
        backgroundColor: '#fff',

    },
    academyTitleContainer:{
        //width: Dimensions.get('window').width,
        borderWidth: 1,
        borderColor: '#dadada',
        justifyContent:'space-around',
        alignItems: 'center',
        alignContent:'center',
        alignSelf:'center',
        textAlign:'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor:'rgba(0,0,0,0.2)'
    },
    academyTitle:{
        alignContent:'center',
        textAlign:'center',
        alignSelf:'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        shadowOffset: {width: 0, height: 1,},
        shadowColor: '#515151',
        shadowOpacity: 1,
        shadowRadius: 5,
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
        marginTop:5,
        marginBottom: 5,
        backgroundColor:'rgba(0,0,0,0.2)',
        shadowOffset: {width: 0, height: 1,},
        shadowColor: '#0c48c2',
        shadowOpacity: 1,
        shadowRadius: 1,
    },
    dayHeader:{
        textAlign:'center',
        alignSelf:'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        shadowOffset: {width: 0, height: 1,},
        shadowColor: '#000',
        shadowOpacity: 1,
        shadowRadius: 5,
    },
    classTitle:{
        fontWeight:'bold',
        color: '#2830a2',
        fontSize: 18
    },
    classTime:{
        color:'#494949',
        paddingRight: 10
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

  container: {
    flex: 1,
      alignItems:'center',
      justifyContent:'center',
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
