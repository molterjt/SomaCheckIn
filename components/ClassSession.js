import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {Ionicons, AntDesign} from '@expo/vector-icons';


export default class ClassSession extends React.Component {
    render() {
        return (
            <View style={{margin: 6,}}>
                <View
                    style={{
                        flexDirection:'row',
                        justifyContent:'space-between',
                        padding:5,
                        marginTop:5,
                        borderBottomWidth:1,
                        borderBottomColor: '#0c48c2',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                    }}
                >
                    <Text style={{fontStyle:'italic'}}>{this.props.classSessionDate}</Text>
                    <Text style={{fontStyle:'italic'}}>{this.props.time}</Text>
                    <Text style={{fontStyle:'italic'}}>{this.props.classperiodInstructorName}</Text>
                </View>
                <View
                    style={{
                        flexDirection:'row',
                        justifyContent:'space-between',
                        padding:5,
                        backgroundColor: '#0c48c2'
                    }}
                >
                    <Text style={{color: '#fff'}}>{this.props.classPeriodTitle}</Text>
                    <Text style={{color: '#fff'}}>{this.props.classSessionAcademy}</Text>
                </View>
                <View style={{flexDirection:'row', flexWrap: 'wrap', justifyContent:'space-between', padding:5, width:'100%'}}>
                    {this.props.techniques.map((z, ii) => (
                        <View
                            style={{
                                flexDirection:'column',
                                justifyContent:'flex-start',
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                width: '50%',
                                borderWidth:1,
                            }}
                            key={ii}
                        >
                            <Text style={{backgroundColor: '#1cb684', color: 'white', width:'100%', textAlign:'left', padding: 3, fontWeight:'500'}}>{z.title}</Text>
                            {z.tags.map((obj,index) =>
                                <View key={index} style={{padding:3, paddingLeft: 9}}>
                                    <Text style={{fontSize:10, fontStyle:'italic'}}>#{obj.name}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
                <View style={{flexDirection:'row', flexWrap: 'wrap', justifyContent:'space-between', padding:5}}>
                    <Text style={{ backgroundColor: '#0c48c2', color: '#fff', width:'100%', textAlign:'center', paddingLeft:5}}>Notes</Text>
                    <View  style={{padding:3, paddingLeft: 9, width: '100%', borderWidth: 1, height: 'auto', minHeight: 50}}>
                        <Text style={{padding:5}}>{this.props.classSessionNotes}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={{padding: 3, alignItems:'center'}}
                    onPress={this.props.editClassSession}
                >
                    <AntDesign
                        name={"edit"}
                        color={"#b4b4b4"}
                        size={32}
                    />
                </TouchableOpacity>
                <View style={{marginTop: 8, borderBottomWidth: 2,  borderBottomColor: '#0c48c2',}}/>

            </View>
        );
    }
};
ClassSession.propTypes = {
    day: PropTypes.string,
    time: PropTypes.string,
    classPeriodTitle: PropTypes.string,
    classPeriodInstructorName: PropTypes.string,
    classSessionAcademy: PropTypes.string,
    classSessionDate: PropTypes.string,
    techniques: PropTypes.array,
    classSessionNotes: PropTypes.string,
    editClassSession: PropTypes.func,
};


const styles = StyleSheet.create({


});