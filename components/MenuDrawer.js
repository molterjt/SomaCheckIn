import React from 'react';
import {Platform, View, Text, StyleSheet, Dimensions,TouchableOpacity,Image} from 'react-native';
import SomaMenuImg from '../assets/images/SOMA---White-Outline.png'
import SomaShield from '../assets/images/SomaJJ_Logo.png'
import {Ionicons} from '@expo/vector-icons';
import gql from 'graphql-tag';
import {graphql, Mutation, Query} from 'react-apollo';


const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

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


export default class MenuDrawer extends React.Component{
    navLink(nav,text, icon){
        return(
            <TouchableOpacity style={{ flexDirection: 'row', height: 60}} onPress={() => this.props.navigation.navigate(nav)}>
                <Ionicons
                    name={icon}
                    color={"#000"}
                    size={32}
                    //style={styles.menuIcon}
                    onPress={() => this.props.navigation.toggleDrawer() }
                />
                <Text style={styles.link}>{text}</Text>
            </TouchableOpacity>
        )
    }

    render(){
        return(
            <View style={styles.container}>

                <View style={styles.topLinks}>
                    <View style={styles.profile}>
                        <View style={styles.imgView}>
                            <Image style={styles.image} source={SomaMenuImg} />
                        </View>
                    </View>
                </View>
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
                            <View style={styles.bottomLinks}>
                                {this.navLink('Home', 'Home', )}
                                {this.navLink('Profile', 'Profile')}
                                {this.navLink('Schedule', 'Schedule')}
                                {data.me.position === 'ADMIN' ? this.navLink('Roster', 'Roster') : null}
                                { this.navLink('Events', 'Events')}
                            </View>
                        )
                    }}
                </Query>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'gray',
    },
    link:{
        flex:1,
        fontSize:20,
        padding: 6,
        paddingLeft:14,
        margin:5,
        textAlign: 'left',
    },
    topLinks:{
        height: 150,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    bottomLinks:{
        flex:1,
        backgroundColor: 'rgba(250,250,250,0.7)',
        paddingTop: 10,
        paddingBottom: 450,

    },
    profile:{
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#777777",
    },
    imgView:{
        flex:1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    image:{
        height: '75%',
        width: '100%',
    }
})