import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import PropTypes from 'prop-types';
import {Ionicons,MaterialIcons} from '@expo/vector-icons'




class Event extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        const {eventImage, title, day, time, date, type, price, location, note, publish} = this.props;
        return(
            <View style={styles.container}>

               <View style={styles.infoSectionTop}>
                   <Image
                        source={{uri: eventImage}}
                        resizeMode={'contain'}
                        style={{
                            height: 300,
                            width: '100%',
                            shadowOffset: {width: 1, height: 2,},
                            shadowColor: 'black',
                            shadowOpacity: 1.0,
                            shadowRadius: 5,
                            borderRadius: 35
                        }}
                   />
                   <View style={{backgroundColor:'rgba(0,0,0,0.8)', alignItems:'center', paddingTop:3, paddingBottom:3, width:'100%'}}>
                    <Text style={{color:'#fff', fontWeight:'bold', fontStyle:'italic', fontSize: 20}}>{title}</Text>
                   </View>
               </View>
                <View style={styles.eventInfoContainer}>

                    <View style={styles.infoSectionLeft}>
                        <View style={styles.infoDetailContainer}>
                            <Ionicons
                                name={'md-calendar'}
                                color={"#1cb684"}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{day}</Text>
                        </View>
                        <View style={styles.infoDetailContainer}>
                            <Ionicons
                                name={'ios-calendar'}
                                color={"#1cb684"}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{date}</Text>
                        </View>

                        <View style={styles.infoDetailContainer}>
                            <Ionicons
                                name={'md-clock'}
                                color={"#1cb684"}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{time}</Text>
                        </View>
                    </View>
                    <View style={styles.infoSectionRight}>
                        <View style={[styles.infoDetailContainer, {paddingBottom:1}]}>
                            <MaterialIcons
                                name={'attach-money'}
                                color={'#1cb684'}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{price}</Text>
                        </View>
                        <View style={[styles.infoDetailContainer, {paddingBottom:4}]}>
                            <MaterialIcons
                                name={'location-on'}
                                color={'#1cb684'}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{location}</Text>
                        </View>
                        <View style={[styles.infoDetailContainer, {paddingBottom:2}]}>
                            <MaterialIcons
                                name={'list'}
                                color={'#1cb684'}
                                size={28}
                            />
                            <Text style={styles.eventInfo}>{type}</Text>
                        </View>
                    </View>

                    </View>


                    <View style={styles.infoSectionBottom}>
                        <Text style={{padding: 15, fontStyle:'italic', color:'white'}}>{note}</Text>
                    </View>

            </View>
        )
    }
}
Event.propTypes = {
    title: PropTypes.string,
    eventImage:PropTypes.string,
    day:  PropTypes.string,
    time:  PropTypes.string,
    date:  PropTypes.string,
    type:  PropTypes.string,
    price:  PropTypes.string,
    location:  PropTypes.string,
    note:  PropTypes.string,
    publish:  PropTypes.bool,

};


export default Event;

const styles = StyleSheet.create({
    container:{
        // flex:1,
        justifyContent:'center',
        alignItems:'center',
        width:'100%',

    },
    eventInfoContainer:{
        backgroundColor:'rgba(0,0,0,0.8)',
        width:'95%',
        flexDirection:'row',
        justifyContent:'space-evenly',
        padding:10
    },
    infoSectionTop:{
        marginTop:50,
        alignItems: 'center',
        justifyContent:'center',
        padding: 5,
        backgroundColor:'#fff',
        width:'95%'
    },
    infoSectionBottom:{
        // borderWidth:1,
        borderColor: '#adb6bf',
        textAlign:'center',
        height: '25%',
        width:'95%',
        justifyContent:'flex-start',
        padding:10,
        backgroundColor:'rgba(0,0,0,0.8)',
    },
    infoSectionLeft:{
        flexDirection:'column',
        justifyContent:'flex-start',
        width:'50%'
    },
    infoSectionRight:{
        flexDirection:'column',
        justifyContent:'flex-start',
        width:'50%'
    },
    infoDetailContainer:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginTop:4,
        marginLeft: 10,
        borderBottomWidth:1,
        borderColor: '#adb6bf',
        width: '80%'
    },
    eventInfo:{
        marginLeft: 20,
        marginTop: 5,
        color: 'white',
    }
})

