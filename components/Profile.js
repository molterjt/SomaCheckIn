import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, Text, AsyncStorage, Button, Image, Linking, Platform, TouchableOpacity} from 'react-native';
import Belt from "./Belt";
import Colors from '../constants/Colors';
import {withNavigation} from 'react-navigation';
import {Ionicons,MaterialIcons} from '@expo/vector-icons'


class Profile extends React.Component{
    constructor(){
        super();
    }
    matchColor(myBeltColor) {
        const myColor = myBeltColor.toString();
        if (myColor === 'BROWN') return Colors.BROWN;
        if (myColor === 'BLACK') return Colors.BLACK;
        if (myColor === 'PURPLE') return Colors.PURPLE;
        if (myColor === 'BLUE') return Colors.BLUE;
        if (myColor === 'WHITE') return Colors.WHITE;
    };
    phonecall(phoneNumber, prompt) {
        if(arguments.length !== 2) {
            console.log('you must supply exactly 2 arguments');
            return;
        }

        if(!isCorrectType('String', phoneNumber)) {
            console.log('the phone number must be provided as a String value');
            return;
        }

        if(!isCorrectType('Boolean', prompt)) {
            console.log('the prompt parameter must be a Boolean');
            return;
        }

        let url;

        if(Platform.OS !== 'android') {
            url = prompt ? 'telprompt:' : 'tel:';
        }
        else {
            url = 'tel:';
        }

        url += phoneNumber;

        LaunchURL(url);
    }
    LaunchURL(url) {
        Linking.canOpenURL(url).then(supported => {
            if(!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                Linking.openURL(url)
                    .catch(err => {
                        if(url.includes('telprompt')) {
                            // telprompt was cancelled and Linking openURL method sees this as an error
                            // it is not a true error so ignore it to prevent apps crashing
                            // see https://github.com/anarchicknight/react-native-communications/issues/39
                        } else {
                            console.warn('openURL error', err)
                        }
                    });
            }
        }).catch(err => console.warn('An unexpected error happened', err));
    };
    render(){
        return(
            <View style={styles.profileCard}>
                <View style={styles.infoSectionContainer}>
                    <View style={styles.infoSectionTop}>
                        {this.props.showDeleteButton
                            ?  <MaterialIcons
                                name={'delete'}
                                size={25}
                                color={'#1cb684'}
                                style={{position:'absolute', top: 5, left: 5}}
                                onPress={this.props.deleteUserAccount}
                            />
                            : null

                        }
                        {this.props.showEditButton
                            ?  <MaterialIcons
                                name={'edit'}
                                size={25}
                                color={'#1cb684'}
                                style={{position:'absolute', top: 5, right: 5}}
                                onPress={() => this.props.navigation.navigate('EditProfile',  {itemId: this.props.id})}
                            />
                            : null

                        }

                        <Text style={[styles.contactInfo, styles.profileName]}>
                            {this.props.firstName} {this.props.lastName}
                        </Text>
                        {this.props.position  && this.props.position !== 'STUDENT'
                            ?  <Text style={[styles.contactInfo, {color:'black'}]}>({this.props.position})</Text>
                            :  null
                        }
                        {this.props.beltColor
                            ? (
                                <Belt
                                    stripes={this.props.stripeCount}
                                    style={{backgroundColor: (this.matchColor(this.props.beltColor))}}
                                    BlackBelt={this.props.beltColor === 'BLACK'}
                                />
                            )
                            : null
                        }
                        <View style={{flexDirection:'row'}}>
                            <MaterialIcons
                                name={'pin-drop'}
                                color={"#1cb684"}
                                size={30}
                                style={{
                                    paddingTop: 3 ,
                                }}
                            />
                            <Text style={[styles.contactInfo, {color:'black'}]}>{this.props.joinDate} </Text>
                        </View>
                    </View>
                    <View style={styles.infoSectionBottom}>
                        <View style={styles.infoDetailContainer}>
                            <Ionicons
                                name={'ios-call'}
                                color={"#1cb684"}
                                size={28}
                                style={{
                                    padding: 0 ,
                                }}
                                onPress={() => this.props.navigation.toggleDrawer() }
                            />
                            <Text style={styles.contactInfo}>{this.props.phone}</Text>
                        </View>
                        <View style={styles.infoDetailContainer}>
                            <Ionicons
                                name={'ios-mail'}
                                color={"#1cb684"}
                                size={28}
                            />
                            <Text style={styles.contactInfo}>{this.props.email}</Text>
                        </View>
                        {this.props.dob
                            ?   (
                                <View style={styles.infoDetailContainer}>
                                    <MaterialIcons
                                        name={'cake'}
                                        color={"#1cb684"}
                                        size={28}
                                    />
                                    <Text style={styles.contactInfo}>{this.props.dob}</Text>
                                </View>
                            )
                            :  null
                        }
                        <View style={styles.infoDetailContainer}>
                            <MaterialIcons
                                name={'school'}
                                color={"#1cb684"}
                                size={28}
                            />
                            {this.props.academies && this.props.academies.map((obj, index) => (
                                <Text key={index} style={styles.contactInfo}>{obj.title}</Text>
                            ))}
                        </View>
                        <View style={styles.infoDetailContainer}>
                            <Text style={styles.lastCheckInText}>
                                Last Check-In:
                            </Text>
                            <Text style={[styles.lastCheckInText, {color: 'white', marginLeft:5}]}>
                                {this.props.lastCheckIn}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('CheckInHistory')}
                            style={styles.attendanceButton}
                        >
                            <Text style={{color:'#fff', fontSize: 14}}>Attendance</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}
Profile.propTypes = {
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    dob: PropTypes.string,
    position: PropTypes.string,
    joinDate: PropTypes.string,
    beltColor: PropTypes.string,
    stripeCount: PropTypes.number,
    academies: PropTypes.array,
    lastCheckIn: PropTypes.string,
    showEditButton: PropTypes.bool,
    showDeleteButton: PropTypes.bool,
    deleteUserAccount: PropTypes.func,
};


export default withNavigation(Profile);

const styles = StyleSheet.create({

    profileCard:{
        alignItems: 'center',
        width: '100%',
        height: '80%',
        backgroundColor: '#7e8082',
        borderWidth: 1,
        marginTop: 80,
        margin: 15,
        padding: 20,
        borderRadius: 10,

    },
    infoSectionContainer:{
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        borderRadius: 10,
    },
    infoSectionTop: {
        alignContent: 'flex-start',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flex: 1,
        width: '100%',
        minHeight: '35%',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#fff',

    },
    infoSectionBottom:{
        flexDirection: 'column',
        backgroundColor:'rgba(0,0,0,0.8)',
        flex:1,
        alignContent: 'flex-start',
        justifyContent:'flex-start',
        alignItems: 'flex-start',
        minHeight: '50%',
        width: '100%',
        padding: 10,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 5,
    },
    infoDetailContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginTop:4,
        borderBottomWidth:1,
        borderColor: '#cbd5e0',
        width: '80%'
    },
    attendanceButton:{
        backgroundColor: '#1cb684',
        color: '#000',
        borderWidth:1,
        borderColor: '#fff',
        borderRadius: 20,
        padding: 8,
        shadowOffset: {width: 1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 1.0,
        alignSelf:'center',
        position: 'absolute',
        bottom: 15,
    },
    lastCheckInText:{
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 3,
        justifyContent: 'space-evenly',
        color: '#1cb684'
    },
    profileImage:{
        alignSelf: 'center',
        width: '60%',
        height: 180,
        borderRadius: 85,
        borderWidth: 1,
    },
    profileName:{
        fontWeight: 'bold',
        fontSize: 22,
        color:"#8c030b",
        shadowOffset: {width: -1, height: 1,},
        shadowColor: '#fff',
        shadowOpacity: 1.0,
        shadowRadius: 2,
    },
    contactInfo:{
        color:'#fff',
        textAlign: 'center',
        padding: 8,
        justifyContent: 'space-evenly',
    },
})