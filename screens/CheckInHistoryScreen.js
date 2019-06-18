import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

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
                            <View style={{width: '100%'}}>
                                {data.me.checkIns.map( (x, index) => (
                                    <View style={{margin:10, borderWidth: 1}} key={index}>
                                        <Text>{x.classSession.date}</Text>
                                        <Text>{x.classSession.academy.title}</Text>
                                        <View style={{margin:10, borderWidth: 1}}>
                                            <Text>{x.classSession.classPeriod.day}</Text>
                                            <Text>{x.classSession.classPeriod.time}</Text>
                                            <Text>{x.classSession.classPeriod.title}</Text>
                                        </View>
                                        {x.classSession.techniques.length > 0
                                            ?(
                                                <View style={{margin:10, borderWidth: 1}}>
                                                    {x.classSession.techniques.map((z, index) => (
                                                        <View key={index}>
                                                            <Text >{z.title}</Text>
                                                            <View style={{margin:10, borderWidth: 1}}>
                                                            {z.tags.map((tag, i) => (
                                                                <Text key={i} >{tag.name}</Text>
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
                            </View>
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
        justifyContent:'center'
    }
})