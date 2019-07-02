import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

import {Query, graphql} from 'react-apollo'
import gql from 'graphql-tag';
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
                academy{id, title}
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

export default class CheckInHistoryScreen extends React.Component{
    static navigationOptions = {
        title: 'Class Attendance Record',
    };

    constructor(){
        super();
    }
    render(){
        return(
            <View style={styles.container}>
                <Query query={ME} fetchPolicy={'network-only'}>
                    {({loading, error, data}) => {
                        if (loading) {
                            return (
                                <View>
                                    <Text>Loading</Text>
                                </View>
                            )
                        }
                        if (error) {
                            console.log(error.message);
                            return (<View><Text>`Error! ${error.message}`</Text></View>)
                        }
                        return (
                            <ScrollView
                                contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                                style={{width: '100%', backgroundColor: 'rgba(0,0,0, 0.8)'}}
                            >
                                {data.me.checkIns.map( (x, index) => (
                                    <View
                                        style={{
                                            margin:10,
                                            padding:10,
                                            borderWidth: 1,
                                            width: '90%',
                                            flex:1,
                                            borderRadius: 20,
                                            backgroundColor: '#fff',
                                        }}
                                        key={index}
                                    >
                                        <View
                                            style={{flexDirection:'row', justifyContent:'space-around', padding:4 ,  backgroundColor: 'rgba(0,0,0, 0.8)', borderRadius:20}}
                                        >
                                            <Text style={{color: '#fff',fontStyle:'italic'}}>{x.classSession.date}</Text>
                                            <Text style={{color: '#fff',fontStyle:'italic'}}>{x.classSession.classPeriod.time}</Text>

                                        </View>


                                        <View style={{flexDirection:'row', justifyContent:'space-around', borderBottomWidth: 1, padding:4}}>
                                            <Text style={{fontStyle:'italic'}}>{x.classSession.academy.title}</Text>
                                            <Text style={{fontStyle:'italic'}}>{x.classSession.classPeriod.title}</Text>
                                        </View>
                                        {x.classSession.techniques.length > 0
                                            ?(
                                                <View>
                                                    {x.classSession.techniques.map((z, index) => (
                                                        <View
                                                            style={{margin:4, borderWidth: 1, padding: 8, backgroundColor: 'rgba(0,0,0, 0.8)',  borderRadius: 14,}}
                                                            key={index}
                                                        >
                                                            <Text style={{fontWeight:'bold', color: '#fff'}} >{z.title}</Text>
                                                            <View
                                                                style={{flexDirection:'row', flexWrap:'wrap',margin:1, padding: 4}}
                                                            >
                                                            {z.tags.map((tag, i) => (
                                                                <View
                                                                    key={i}
                                                                    style={{
                                                                        width:'auto',
                                                                        backgroundColor: '#26a2dd',
                                                                        borderRadius: 35,
                                                                        padding:8,
                                                                        borderWidth: 1,
                                                                        borderColor: '#fff',
                                                                        margin:3,
                                                                        shadowOffset: {width: 0, height: 1,},
                                                                        shadowColor: '#0c48c2',
                                                                        shadowOpacity: 1,
                                                                        shadowRadius: 1,

                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{color: '#fff', fontSize:12}}
                                                                        key={i}
                                                                    >
                                                                        #{tag.name}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                            </View>

                                                        </View>

                                                    )) }

                                                </View>
                                            )
                                            : null
                                        }


                                    </View>
                                ))}
                                <Text></Text>
                            </ScrollView>
                        )
                    }}
                </Query>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent:'center',

    }
})