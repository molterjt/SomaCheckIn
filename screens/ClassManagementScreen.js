import React from 'react';
import {
    View, Text, StyleSheet, Button, ScrollView, FlatList, TouchableOpacity, Modal,
    TouchableWithoutFeedback, TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import {Query, graphql, compose, Mutation} from 'react-apollo'
import gql from 'graphql-tag';
import ClassSession from '../components/ClassSession'
import MenuButton from "../components/MenuButton";

export const GET_CLASS_SESSIONS = gql`
    query($academyTitle: String, $first: Int, $skip: Int){
        classSessionsByAcademy(academyTitle: $academyTitle, first: $first, skip: $skip){
           id
           title
           date
           notes
           academy{
              id
              title
           }
           techniques{
             id
             title
             tags{
                id
                name
             }
           }
           instructor{
            id
            user{
                id
                firstName
            }
           }
           classPeriod{
              id
              day
              title
              time
              stamp
             
           }
          
        }
    
    }
`;

class ClassManagementScreen extends React.Component{
    static navigationOptions = {header: null,};

    constructor(props){
        super(props);
        this.state={
            first: 2,
            skip: 0,
            academy: undefined,
            academyOptions: ['Oxford', 'Dayton', 'West Chester'],
            classSessionHeader: undefined,
            noMoreToRender: false,
            showEditClassSessionModal: false
        }
    }

    _toggleEditClassSessionModal(){
        this.setState({showEditClassSessionModal: !this.state.showEditClassSessionModal})
    }

    _renderItems = ({item}) => (
        <ClassSession
            time={item.classPeriod.time}
            day={item.classPeriod.day}
            classperiodInstructorName={item.instructor.user.firstName}
            classPeriodTitle={item.classPeriod.title}
            classSessionDate={item.date}
            techniques={item.techniques}
            classSessionAcademy={item.academy.title}
            classSessionNotes={item.notes}
            editClassSession={() => this.props.navigation.navigate('EditClassSession', {
                classSessionId: item.id, classSessionTime: item.classPeriod.time, classSessionDay: item.classPeriod.day, classSessionDate: item.date,
                classSessionAcademy: item.academy.title,  classSessionInstructor: item.instructor.user.firstName, classSessionTitle: item.classPeriod.title,
                classSessionTechniques: item.techniques, classSessionNotes: item.notes,
                })
            }
        />
    );
    _keyExtractor = (item, index) => item.id;

    _renderAcademySelectionOptions = ({item}) => (
        <Button
            style={{borderRightWidth:1, borderLeftWidth: 1, padding:4}}
            title={item}
            onPress={() => this.setState({academy: item, classSessionHeader: item + " Class Sessions"})}

        />

    );

    _renderAcademySelectionOption = ({item}) => (
        <TouchableOpacity
            onPress={() => this.setState({academy: item, classSessionHeader: item + " Class Sessions"})}
            style={{borderRightWidth:1, borderLeftWidth: 1, padding:4}}
        >
            <Text>{item}</Text>
        </TouchableOpacity>

    );

    _academyOptionKeyExtractor = (item,index) => item;


    render() {
        return (
            <View style={styles.container}>
                <MenuButton navigation={this.props.navigation}/>
                {
                    this.state.classSessionHeader === undefined
                    ? ( <View style={{marginTop:90, marginBottom:0, }}>
                            <Text style={{textAlign:'center'}}>
                                Select Academy for Class Sessions
                            </Text>
                            <FlatList
                                data={this.state.academyOptions}
                                renderItem={this._renderAcademySelectionOptions}
                                keyExtractor={this._academyOptionKeyExtractor}
                                horizontal
                            />
                        </View>
                    )
                    : (
                        <Query
                            variables={{academyTitle: this.state.academy, first: this.state.first, skip: this.state.skip}}
                            fetchPolicy={'network-only'} query={GET_CLASS_SESSIONS}
                        >
                            {
                                ({ loading, error, data, fetchMore }) => {
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
                                        <View
                                            style={{
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                marginTop: 60,
                                                marginBottom: 20,
                                                width: '90%',
                                                flex:1,

                                                // backgroundColor:'rgba(0,0,0,0.6)'

                                            }}
                                        >


                                            <FlatList
                                                ref={ref => this.flatList = ref}
                                                initialNumToRender={1}
                                                extraData={this.state.noMoreToRender}
                                                onContentSizeChange={() => this.flatList.scrollToEnd({animated: true})}
                                                ListHeaderComponent={
                                                    <View>
                                                        <Button title={'Clear'} onPress={() => {
                                                            this.setState({classSessionHeader: undefined,academy: undefined});
                                                            this.flatList = 0;
                                                        }}
                                                        />
                                                        <Text style={{marginBottom:0, textAlign:'center'}}>{this.state.classSessionHeader}</Text>
                                                    </View>
                                                }
                                                ListFooterComponent={
                                                    <View>
                                                    {this.state.noMoreToRender
                                                        ? (
                                                            null
                                                        )
                                                        : (
                                                            <Button
                                                                title={'More'}
                                                                style={{marginBottom:50}}
                                                                onPress={() => fetchMore({
                                                                    variables:{
                                                                        first: 2,
                                                                        skip: data.classSessionsByAcademy.length
                                                                    },
                                                                    updateQuery: (previousResult, {fetchMoreResult}) => {
                                                                        if (!fetchMoreResult){
                                                                            console.log('NO FetchMore');
                                                                            this.setState({noMoreToRender: true})
                                                                            return previousResult;
                                                                        }
                                                                        console.log('trying to copy data');
                                                                        return Object.assign({}, previousResult, {
                                                                            classSessionsByAcademy : [...previousResult.classSessionsByAcademy, ...fetchMoreResult.classSessionsByAcademy]
                                                                        });
                                                                    }
                                                                })}
                                                            />
                                                        )
                                                    }
                                                    </View>
                                                }
                                                data={data.classSessionsByAcademy}
                                                renderItem={ this._renderItems }
                                                keyExtractor={this._keyExtractor}
                                                style={{width: '90%', }}
                                                onLayout={() => this.flatList.scrollToEnd({animated: true})}

                                            />
                                            <Modal
                                                transparent={true}
                                                animationType={"none"}
                                                visible={this.state.showEditClassSessionModal}
                                                onRequestClose={() => this._toggleEditClassSessionModal() }
                                            >
                                                <TouchableOpacity
                                                    onPress={() => this._toggleEditClassSessionModal()}
                                                >
                                                    <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                                                        <TouchableWithoutFeedback>
                                                            <View style={{
                                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                                minHeight: '80%',
                                                                height: 'auto',
                                                                width: '85%',
                                                                borderWidth:2,
                                                                borderColor: 'white'
                                                            }}
                                                            >
                                                                <View style={{
                                                                    backgroundColor:'transparent',flexDirection:"column",
                                                                    justifyContent: 'space-around', margin: 3,
                                                                    width: 'auto', padding: 5,
                                                                }}
                                                                >
                                                                    <Button
                                                                        title={'Close'}
                                                                        onPress={() => this._toggleEditClassSessionModal()}
                                                                    />

                                                                </View>

                                                            </View>
                                                        </TouchableWithoutFeedback>
                                                    </ScrollView>
                                                </TouchableOpacity>
                                            </Modal>



                                        </View>
                                    );
                                }
                            }
                        </Query>
                    )
                }





            </View>
        );
    }
}

export default ClassManagementScreen;

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent:'flex-start',
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