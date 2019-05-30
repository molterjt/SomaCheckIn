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
import { WebBrowser } from 'expo';
import SomaJJLogo from '../assets/images/SomaJJ_Logo.png';
import WhiateASRash from '../assets/images/WhiteASRash.png';
import MenuButton from '../components/MenuButton';
import ScheduleItem from '../components/ScheduleItem';
import {Ionicons} from '@expo/vector-icons'
import gql from 'graphql-tag';
import {graphql, Mutation, Query} from 'react-apollo';

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
            academies{title}
        }
    }
`

const CLASSPERIODS_TODAY = gql`
    query{     
      Dayton: classPeriodsToday(academyTitle:"Dayton", daySearch: "Wednesday"){
        time
        day
        title
        academy{title}
        classSessions{id, checkIns{checked}}
        id
      },
      Oxford:classPeriodsToday(academyTitle:"Oxford",  daySearch: "Tuesday"){
        time
        day
        title
        academy{title}
        classSessions{id, checkIns{checked}}
        id
      },
      WestChester:classPeriodsToday(academyTitle:"West Chester",  daySearch: "Tuesday"){
        time
        day
        title
        academy{title}
        classSessions{id, checkIns{checked}}
        id
      }
    }
    
`


class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props);
    this.state={
      showModal: false,
      myEmail: '',
      today: new Date().toISOString()
    }
  }
  compondentDidMount(){
    const {me} = this.props.data;
    this.setState({welcomeName: me.firstName})
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
                              <Text style={{fontStyle:'italic', fontSize: 20}}
                              >Welcome {data.me.firstName}!</Text>
                          </View>
                      )
                  }}
              </Query>
              <Ionicons
                  name={'ios-checkmark-circle'}
                  color={"#1cb684"}
                  size={100}
                  style={{
                      padding: 20,
                      position: 'absolute',
                      bottom: -150,
                      shadowOffset: {width: 1, height: 2,},
                      shadowColor: 'black',
                      shadowOpacity: 1.0,
                      shadowRadius: 2,
                  }}
                  onPress={() => this.toggleModal() }
                  //onPress={() => this.props.navigation.toggleDrawer() }
              />
              <Text style={{
                  padding: 20,
                  position: 'absolute',
                  bottom: -160,
                  color: "#1cb684",
                  marginTop: 5
              }}>Check-In</Text>

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
                      <Query query={CLASSPERIODS_TODAY} variables={{daySearch: "Tuesday"}} fetchPolicy={'network-only'}>
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
                                      <View
                                          style={{ backgroundColor: 'transparent', justifyContent: 'space-evenly',}}
                                      >
                                          <Text style={styles.dayHeader}>
                                              Classes for {this.renderToday()}
                                          </Text>
                                          {data.Dayton.length > 0
                                              ? (
                                                  <View style={{marginTop: 40}}>
                                                      <View style={styles.academyTitleContainer}>
                                                          <Text style={styles.academyTitle}>
                                                              {data.Dayton[0].academy.title}
                                                          </Text>
                                                      </View>

                                                      {data.Dayton.map((obj, index) => (
                                                          <View key={index} style={{backgroundColor: 'transparent', padding: 10,}}>
                                                              <View style={styles.rowContainer}>
                                                                  <Ionicons
                                                                      name={"md-add-circle"}
                                                                      color={"#1cb684"}
                                                                      size={45}
                                                                      onPress={() => this.toggleModal() }
                                                                  />
                                                                  <Text style={styles.classTitle}>{obj.title}</Text>
                                                                  <Text style={styles.classTime}>{obj.time}</Text>
                                                              </View>
                                                          </View>

                                                      ))}
                                                  </View>
                                              )
                                              : null
                                          }
                                          {data.WestChester.length > 0
                                              ? (
                                                  <View style={{marginTop: 40}}>
                                                      <View style={styles.academyTitleContainer}>
                                                          <Text style={styles.academyTitle}>
                                                              {data.WestChester[0].academy.title}
                                                          </Text>
                                                      </View>
                                                      {data.WestChester.map((obj, index) => (
                                                          <View key={index} style={{backgroundColor: 'transparent', padding: 10,}}>
                                                              <View key={index} style={styles.rowContainer}>
                                                                  <Ionicons
                                                                      name={"md-add-circle"}
                                                                      color={"#1cb684"}
                                                                      size={45}
                                                                      onPress={() => this.toggleModal() }
                                                                  />
                                                                  <Text style={styles.classTitle}>{obj.title}</Text>
                                                                  <Text style={styles.classTime}>{obj.time}</Text>
                                                              </View>
                                                          </View>
                                                      ))}
                                                  </View>
                                              )
                                              : null
                                          }
                                          {data.Oxford.length > 0
                                              ? (
                                                  <View style={{marginTop: 40}}>
                                                      <View style={styles.academyTitleContainer}>
                                                          <Text style={styles.academyTitle}>
                                                              {data.Oxford[0].academy.title}
                                                          </Text>
                                                      </View>
                                                      {data.Oxford.map((obj, index) => (
                                                          <View key={index} style={{backgroundColor: 'transparent', padding: 10,}}>
                                                              <View key={index} style={styles.rowContainer}>
                                                                  <Ionicons
                                                                      name={"md-add-circle"}
                                                                      color={"#1cb684"}
                                                                      size={45}
                                                                      onPress={() => this.toggleModal() }
                                                                  />
                                                                  <Text style={styles.classTitle}>{obj.title}</Text>
                                                                  <Text style={styles.classTime}>{obj.time}</Text>
                                                              </View>
                                                          </View>
                                                      ))}
                                                  </View>
                                              )
                                              : null
                                          }
                                  </View>
                                  )
                              }}
                      </Query>
                  <View style={{height: 50}}/>
                  </ScrollView>
              </Modal>
          </ImageBackground>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

export default (HomeScreen);

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
