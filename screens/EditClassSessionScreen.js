import React from 'react';
import {
    View, Text, StyleSheet, TextInput, FlatList, ScrollView, TouchableOpacity,
    TouchableWithoutFeedback, Modal, Button, Alert,
} from 'react-native';
import gql from 'graphql-tag'
import {Query, Mutation, graphql, compose} from 'react-apollo'
import { Svg } from 'expo';
import _filter from 'lodash/filter';
import _find from 'lodash/find';


import Tag from "../components/Tag";
import Technique from "../components/Technique";

import {Ionicons, AntDesign, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';
import {GET_CLASS_SESSIONS} from "./ClassManagementScreen";


const { Circle, Rect, Path, Line} = Svg;

const GET_TECHNIQUES = gql`
    query($techSearch: String){
       techniques(techSearch:$techSearch){
            id
            title
            tags{
                id
                name
            }
        }
    }
`;

const GET_TAGS = gql`
    query($tagSearch: String){
        tags(tagSearch:$tagSearch){
            id
            name
        }
    }
`
;

const CREATE_TAG = gql`
    mutation createTag($newTagName: String!){
        createTag(name: $newTagName){
            id
        }
    }
`;

const CREATE_TECHNIQUE_WITH_TAGS = gql`
    mutation createTechniqueWithExistingTags($title: String!, $tagIds: [ID]){
        createTechniqueWithExistingTags(title: $title, tagIds: $tagIds){
            id
        }
    }
`;

const DELETE_TECHNIQUE = gql`
    mutation deleteTechnique($techniqueId: ID!){
        deleteTechnique(techniqueId:$techniqueId){
            id
        } 
    }
`;

const DELETE_TAG = gql`
    mutation deleteTag($tagId: ID!){
        deleteTag(tagId:$tagId){
            id
        } 
    }
`;

const UPDATE_CLASS_SESSION = gql`
    mutation updateClassSession($classSessionId: ID!,$notes: String, $techniqueIds: [ID], $instructorId: ID){
        updateClassSession(classSessionId: $classSessionId, notes: $notes, techniqueIds: $techniqueIds, instructorId: $instructorId  ){
            id
        }
    }
`;

//deleteClassSessionTechnqiue(classSessionId: ID!, technqiueIds: [ID!]): ClassSession
const REMOVE_TECHS_FROM_CLASS_SESSION = gql`
    mutation deleteClassSessionTechnqiue($classSessionId: ID!, $techniqueIds: [ID]){
        deleteClassSessionTechnqiue(classSessionId: $classSessionId, techniqueIds: $techniqueIds ){
            id
        }
    }
`;

const GET_CLASS_SESSION = gql`
    query($classSessionId: ID!){
        classSession(classSessionId: $classSessionId){
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


class EditClassSessionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            techSearch: undefined,
            tagSearch: undefined,
            classNotes: undefined,
            showCreateTechniqueModal: false,
            showCreateTagModal: false,
            newTechTitle: undefined,
            newTechTagsToAdd: [],
            newTechniquesToAdd: [],
            showCreateNewTag: false,
            newTechCreateTagName: undefined,
            newTagTitle: undefined,
            techniqueAdded: false,
            newInstructor: undefined,

        };
        this.instructorButtons = [];
    }
    _toggleCreateTechniqueModal = () => this.setState({showCreateTechniqueModal: !this.state.showCreateTechniqueModal});
    _toggleCreateTagModal = () => this.setState({showCreateTagModal: !this.state.showCreateTagModal});
    _toggleShowCreateNewTagOption = () => this.setState({showCreateNewTag: !this.state.showCreateNewTag});

    _handleTechniqueListCheck(item){
        let checkedTechs = this.state.newTechniquesToAdd;
        if(checkedTechs && checkedTechs.includes(item)){
            const index = checkedTechs.indexOf(item);
            checkedTechs.splice(index, 1);
        } else {
            checkedTechs = checkedTechs.concat(item);
        }
        this.setState({newTechniquesToAdd: checkedTechs});
        console.log(checkedTechs);
    };

    _handleTagListCheck(item){
        let checkedTags = this.state.newTechTagsToAdd;
        if(checkedTags && checkedTags.includes(item)){
            const index = checkedTags.indexOf(item);
            checkedTags.splice(index, 1);
        } else {
            checkedTags = checkedTags.concat(item);
        }
        this.setState({newTechTagsToAdd: checkedTags});
        console.log(checkedTags);
    };

    _deleteThisTechnique = async (id) => {
        Alert.alert(
            'Alert',
            "Are you really, really sure you want to DELETE this Technique?",
            [
                {
                    text: 'DELETE', onPress: async () => {
                        await this.props.deleteTechnique({
                            variables: {
                                techniqueId: id,
                            },
                            refetchQueries: [
                                {
                                    query: GET_TECHNIQUES,
                                },
                            ],
                        });
                    }
                },
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')}
            ],
            { cancelable: true },
        );
    };
    _deleteThisTag = async (id) => {
        Alert.alert(
            'Alert',
            "Are you really, really sure you want to DELETE this tag?",
            [
                {
                    text: 'DELETE', onPress: async () => {
                        await this.props.deleteTag({
                            variables: {
                                tagId: id,
                            },
                            refetchQueries: [
                                {
                                    query: GET_TAGS,
                                },
                            ],
                        });
                    }
                },
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed!')}
            ],
            { cancelable: true },
        );
    };

    _submitUpdateClassSession = async (id, academyTitle) => {
        const result = await this.props.updateClassSession({
            variables: {
                classSessionId: id,
                notes: this.state.classNotes,
                techniqueIds: this.state.newTechniquesToAdd.map(x => x.id),
                instructorId: this.state.newInstructor ? this.state.newInstructor.id : null,
            },
            refetchQueries: [
                {
                    query: GET_CLASS_SESSIONS,
                    variables: {
                        academyTitle: academyTitle,
                        first:2,
                        skip:0
                    }
                },
            ]
        }).catch(error => {
            console.log('Failure of UpdateClassSession: ', error);
        });
        if(result){
            console.log('Success Update ClassSession Result: ', result);
            this.props.navigation.navigate('ClassManagement');
        }

    };

    changeInstructor = (instructor) => {
        this.setState({newInstructor: instructor});
    };

    setNativeProps = (x, nativeProps) => {
        x.setNativeProps(nativeProps);
    };

    _techKeyExtractor = (item) => item.id;
    _renderTechs = ({item}) => (
        <Technique
            techTitle={item.title}
            techPress={() => this._handleTechniqueListCheck(item)}
            techTags={item.tags}
            onLongPress={() => this._deleteThisTechnique(item.id) }
            techColor={'#26a2dd'}
            showAddButton={true}
        />
    );
    _tagKeyExtractor = (item) => item.id;
    _renderTags = ({item}) => (
        <Tag
          tagName={item.name}
          tagPress={() => console.log(item.name)}
          onLongPress={() => this._deleteThisTag(item.id)}
        />
    );
    _renderTagsForNewTechnique = ({item}) => (
        <Tag
            tagName={item.name}
            tagPress={() => this._handleTagListCheck(item)}
            onLongPress={() => this._deleteThisTag(item.id)}

        />
    );

    render(){
        const {classSessionId, classSessionTechniques, classSessionTime,classSessionNotes, classSessionDay, classSessionDate, classSessionAcademy, classSessionInstructor, classSessionTitle} = this.props.navigation.state.params;
        return(
            <View style={styles.container}>
                <Text>Editing Class Session: </Text>
                <View
                    style={{
                        width: '90%',
                        flexDirection:'row',
                        justifyContent:'space-evenly',
                        padding:5,
                        marginTop:5,
                        borderBottomWidth:1,
                        borderBottomColor: '#0c48c2',
                        borderTopWidth: 1,
                        borderTopColor: '#0c48c2',
                        backgroundColor: 'rgba(0,0,0,0.1)'
                    }}
                >
                    <Text>{classSessionDate}</Text>
                    <Text>{classSessionAcademy}</Text>
                    <Text>{classSessionTime}</Text>
                </View>
                <View  style={{
                    width: '90%',
                    flexDirection:'row',
                    justifyContent:'space-evenly',
                    padding:5,
                    marginTop:5,
                    borderBottomWidth:1,
                    borderBottomColor: '#0c48c2',
                    borderTopWidth: 1,
                    borderTopColor: '#0c48c2',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                }}
                >
                    <Text>{classSessionTitle}</Text>
                    <Text>Instructor: {this.state.newInstructor ? this.state.newInstructor.user.firstName : classSessionInstructor}</Text>
                </View>
                <Mutation mutation={REMOVE_TECHS_FROM_CLASS_SESSION}>
                    {(updateClassSession, { data }) => (
                        <TouchableOpacity
                            style={{alignItems:'center', margin:10}}
                            onPress={() => {
                                updateClassSession({
                                    variables: {
                                        classSessionId: classSessionId,
                                        techniqueIds: classSessionTechniques.map(x => x.id),
                                    },
                                    refetchQueries: [
                                        {
                                            query: GET_CLASS_SESSIONS,
                                            variables: {
                                                academyTitle: classSessionAcademy,
                                                first:2,
                                                skip:0
                                            }
                                        },
                                    ]
                                });
                                this.props.navigation.goBack(null);
                            }}
                        >
                            <MaterialCommunityIcons
                                name={'backup-restore'}
                                color={'#a1030b'}
                                size={32}

                            />
                            <Text style={{color:'#a1030b'}}>Remove Techniques</Text>
                        </TouchableOpacity>
                    )}
                </Mutation>
                <ScrollView
                    contentContainerStyle={{justifyContent:'flex-start'}}
                    style={{marginTop: 10, width: '100%'}}
                >
                    {/****INSTRUCTOR*****/}
                <Query query={gql`query{ instructors{ id, user{ id, firstName} }}`}>
                    {({error, loading, data}) => {
                        if (error) return <Text>{error.message}</Text>;
                        if (loading) return <Text>Loading...</Text>;
                        return (
                            <View style={{
                                flex:1,
                                width: '100%',
                                borderTopWidth: 1,
                                borderTopColor: '#1519b4',
                                borderBottomWidth: 1,
                                borderBottomColor: '#1519b4',
                                marginBottom: 10,
                            }}>
                                <Text style={{
                                    color: '#1519b4',
                                    textAlign:'center',
                                    fontSize: 14,
                                    fontWeight:'500',
                                    padding:3,
                                }}>
                                    Select to Change Instructor:
                                </Text>
                                <View style={{flexDirection:'row', flexWrap:'wrap', alignItems: 'center', justifyContent:'space-evenly', margin:10}}>
                                    {data.instructors.map((x,index) => (
                                        <TouchableOpacity
                                            key={index}
                                            ref={component => this.instructorButtons[index] = component}
                                            style={{borderWidth: 2, borderColor:'#000', padding:8, backgroundColor: '#1cb684', borderRadius: 20 }}
                                            onPress={() => {
                                                this.changeInstructor(x);
                                                console.log('this.instructorButtons[] ', this.instructorButtons);
                                                console.log('length== ', this.instructorButtons.length );
                                                if(this.instructorButtons.length > 1){
                                                    this.instructorButtons.map((button, i) => {
                                                        if(i === index){
                                                            this.setNativeProps(this.instructorButtons[index], {backgroundColor: '#2e5885'});
                                                        }
                                                        else {
                                                            this.setNativeProps(this.instructorButtons[i], {backgroundColor:'#1cb684'})
                                                        }
                                                    })
                                                } else{
                                                    this.setNativeProps(this.instructorButtons[0], {backgroundColor: '#1cb684'} )
                                                }
                                            }}
                                        >
                                            <Text style={{color: '#fff', fontWeight:'500'}}>{x.user.firstName}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        );
                    }}
                </Query>

                    {/****TECHNIQUES*****/}
                <Query query={GET_TECHNIQUES}  variables={{techSearch: this.state.techSearch}} >
                    {({error, loading, data}) => {
                        if(error) return <Text>{error.message}</Text>;
                        if(loading) return <Text>Loading...</Text>;
                        return(

                              <View style={{
                                  flex:1,
                                  width: '100%',
                                  borderTopWidth: 1,
                                  borderTopColor: '#1519b4',
                                  borderBottomWidth: 1,
                                  borderBottomColor: '#1519b4',
                                  marginBottom: 10,
                              }}>
                                  <Text style={{

                                      color: '#1519b4',

                                      textAlign:'center',
                                      fontSize: 14,
                                      fontWeight:'500',
                                      padding:3,
                                  }}>
                                      Techniques
                                  </Text>
                                  <TextInput
                                      style={styles.textInput}
                                      onChangeText={(techSearch) => this.setState({techSearch})}
                                      value={this.state.techSearch}
                                      accessibilityLabel={'Technique Search Field'}
                                      underlineColorAndroid={'transparent'}
                                      autoCorrect={false}
                                      placeholderTextColor={'#4f4f4f'}
                                      keyboardAppearance={'dark'}
                                      placeholder={'Technique Search'}
                                  />
                                 <FlatList
                                      data={data.techniques}
                                      renderItem={this._renderTechs}
                                      keyExtractor={this._techKeyExtractor}
                                      horizontal
                                      extraData={this.state.techniqueAdded}
                                 />
                                  <View style={{alignItems: 'center', margin:10, borderWidth:1, padding:10}}>
                                      <Text style={{color:'#000', marginBottom:5}}>Create New Technique/Tags</Text>
                                      <MaterialCommunityIcons
                                        name={'plus-box'}
                                        color={'#1cb684'}
                                        size={32}
                                        onPress={() => this._toggleCreateTechniqueModal()}
                                      />
                                  </View>
                                  <Text style={{

                                      color: '#1519b4',
                                      textAlign:'center',
                                      fontSize: 14,
                                      fontWeight:'500',
                                      padding:3,
                                  }}>
                                      New Techniques To Add
                                  </Text>
                                  <View style={{
                                      borderTopWidth: 1,
                                      borderTopColor: '#1519b4',
                                      flexDirection: 'row',
                                      alignItems:'center',
                                      justifyContent:'center',
                                      flexWrap: 'wrap',
                                  }}>

                                      {this.state.newTechniquesToAdd.map( (x,i) => (
                                              <Technique
                                                  key={i}
                                                  techTitle={x.title}
                                                  techTags={x.tags}
                                                  techColor={'#2e5885'}
                                                  showAddButton={false}
                                              />
                                      ))}

                                  </View>
                                  <Modal
                                      transparent={true}
                                      animationType={"none"}
                                      visible={this.state.showCreateTechniqueModal}
                                      onRequestClose={() => this._toggleCreateTechniqueModal() }
                                  >
                                      <TouchableOpacity
                                          onPress={() => this._toggleCreateTechniqueModal()}
                                      >
                                          <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                                              <TouchableWithoutFeedback>
                                                  <View style={{
                                                      backgroundColor: 'rgba(0,0,0,0.8)',
                                                      minHeight: '80%',
                                                      height: 'auto',
                                                      width: '85%',
                                                      borderWidth:2,
                                                      borderColor: 'white'
                                                  }}
                                                  >
                                                      <View style={{
                                                          backgroundColor:'transparent',
                                                          flexDirection:"column",
                                                          justifyContent: 'center',
                                                          margin: 3,
                                                          width: 'auto',
                                                          padding: 5,
                                                      }}
                                                      >
                                                          <TouchableOpacity
                                                            style={{position:'relative', top:0, right:1}}
                                                            onPress={() => this._toggleCreateTechniqueModal()}
                                                          >
                                                              <Ionicons
                                                                  size={28}
                                                                  color={'red'}
                                                                  name={'md-close-circle-outline'}
                                                              />
                                                          </TouchableOpacity>

                                                          <Text style={{
                                                              color: '#fff',
                                                              textAlign:'center',
                                                              fontSize: 14,
                                                              fontWeight:'500',
                                                              padding:3,
                                                          }}>
                                                              Create Technique
                                                          </Text>
                                                          <TextInput
                                                              style={{
                                                                  borderColor:'#fff',
                                                                  borderWidth: 1,
                                                                  width: 200,
                                                                  height: 35,
                                                                  alignSelf: 'center',
                                                                  margin:15,
                                                                  padding: 5,
                                                                  color: '#000',
                                                                  backgroundColor: 'rgba(250,250,250,0.65)'
                                                              }}
                                                              onChangeText={(newTechTitle) => this.setState({newTechTitle})}
                                                              value={this.state.newTechTitle}
                                                              accessibilityLabel={'Create Technique Title Field'}
                                                              underlineColorAndroid={'transparent'}
                                                              autoCorrect={false}
                                                              placeholderTextColor={'#000'}
                                                              keyboardAppearance={'dark'}
                                                              placeholder={'New Technique Title'}
                                                          />
                                                          <Text style={{
                                                              color: '#fff',
                                                              textAlign:'center',
                                                              fontSize: 14,
                                                              fontWeight:'500',
                                                              padding:3,
                                                          }}>
                                                              Add Tags For The Technique:
                                                          </Text>
                                                          <Query query={GET_TAGS} variables={{tagSearch: this.state.tagSearch}} >
                                                              {({error, loading, data}) => {
                                                                  if(error) return <Text>{error.message}</Text>;
                                                                  if(loading) return <Text>Loading...</Text>;
                                                                  return(
                                                                      <FlatList
                                                                          data={data.tags}
                                                                          renderItem={this._renderTagsForNewTechnique}
                                                                          keyExtractor={this._tagKeyExtractor}
                                                                          horizontal
                                                                      />
                                                                  );
                                                              }}
                                                          </Query>
                                                          <Text style={{
                                                              color: '#fff',
                                                              textAlign:'center',
                                                              fontSize: 14,
                                                              fontWeight:'500',
                                                              padding:3,
                                                          }}>
                                                              Tags Added:
                                                          </Text>

                                                          <View
                                                            style={{
                                                                alignSelf:'center',
                                                                flexDirection: 'row',
                                                                flexWrap: 'wrap',
                                                                borderColor: '#fff',
                                                                borderWidth: 1,
                                                                height: 'auto',
                                                                minHeight: 50,
                                                                width: '90%',
                                                                justifyContent: 'center'
                                                            }}
                                                          >
                                                            {this.state.newTechTagsToAdd.map(x =>
                                                                <Text
                                                                    key={x.id}
                                                                    style={{color: 'white', margin:5,}}
                                                                >
                                                                    #{x.name}
                                                                </Text>
                                                            )}

                                                          </View>
                                                          <Mutation mutation={CREATE_TECHNIQUE_WITH_TAGS}>
                                                              {(createTechniqueWithExistingTags, { data }) => (
                                                                  <Button
                                                                      title={'Submit'}
                                                                      color={'red'}
                                                                      onPress={() => {
                                                                          createTechniqueWithExistingTags({
                                                                              variables: {
                                                                                  title: this.state.newTechTitle,
                                                                                  tagIds: this.state.newTechTagsToAdd.map(x => x.id),
                                                                              },
                                                                              refetchQueries: [
                                                                                  {
                                                                                      query: GET_TECHNIQUES,
                                                                                  },
                                                                              ],
                                                                          });
                                                                          this.setState({
                                                                              newTechTitle: undefined,
                                                                              newTechTagsToAdd: [],
                                                                          });
                                                                          this._toggleCreateTechniqueModal();
                                                                      }}
                                                                  />
                                                              )}
                                                          </Mutation>

                                                          <View style={{
                                                              borderTopWidth: 2,
                                                              borderTopColor: '#fff',
                                                              position: 'relative',
                                                              bottom: -120,
                                                              padding:10,
                                                          }}>
                                                              <TouchableOpacity
                                                                style={{position:'relative', bottom:5, alignSelf:'center', alignItems:'center'}}
                                                                onPress={()=>this._toggleShowCreateNewTagOption()}
                                                                color={'#21d79c'}
                                                              >
                                                                  <Text style={{color:'#fff'}}>{
                                                                  this.state.showCreateNewTag ? 'Hide' : 'Create New Tag'
                                                                  }</Text>
                                                                  <AntDesign
                                                                    name={'tagso'}
                                                                    size={38}
                                                                    color={'#21d79c'}
                                                                  />
                                                              </TouchableOpacity>
                                                              {
                                                                  this.state.showCreateNewTag
                                                                  ?(<View>
                                                                      <Text style={{
                                                                          color: '#fff',
                                                                          textAlign:'center',
                                                                          fontSize: 14,
                                                                          fontWeight:'500',
                                                                          padding:3,
                                                                      }}>
                                                                          Create New Tag:
                                                                      </Text>

                                                                      <TextInput
                                                                          style={{
                                                                              borderColor:'#fff',
                                                                              borderWidth: 1,
                                                                              width: 200,
                                                                              height: 35,
                                                                              alignSelf: 'center',
                                                                              margin:15,
                                                                              padding: 5,
                                                                              color: '#000',
                                                                              backgroundColor: 'rgba(250,250,250,0.65)'
                                                                          }}
                                                                          onChangeText={(newTechCreateTagName) => this.setState({newTechCreateTagName})}
                                                                          value={this.state.newTechCreateTagName}
                                                                          accessibilityLabel={'Create Tag Name Field'}
                                                                          underlineColorAndroid={'transparent'}
                                                                          autoCorrect={false}
                                                                          placeholderTextColor={'#000'}
                                                                          keyboardAppearance={'dark'}
                                                                          placeholder={'New Tag Name'}
                                                                        />
                                                                              <Mutation mutation={CREATE_TAG}>
                                                                                  {(createTag, { data }) => (
                                                                                      <Ionicons
                                                                                        style={{alignSelf:'center'}}
                                                                                        name={'md-add-circle'}
                                                                                        color={'#a1030b'}
                                                                                        size={38}
                                                                                        onPress={() => {
                                                                                            createTag({
                                                                                                variables: {
                                                                                                    newTagName: this.state.newTechCreateTagName
                                                                                                },
                                                                                                refetchQueries: [
                                                                                                    {
                                                                                                        query: GET_TAGS,
                                                                                                    },
                                                                                                ],
                                                                                            });
                                                                                            this.setState({newTechCreateTagName: undefined})
                                                                                        }}
                                                                                      />
                                                                                  )}
                                                                              </Mutation>
                                                                  </View>
                                                                  )
                                                                  :(null)
                                                              }
                                                          </View>
                                                      </View>
                                                  </View>
                                              </TouchableWithoutFeedback>
                                          </ScrollView>
                                      </TouchableOpacity>
                                  </Modal>
                              </View>
                        );
                    }}
                </Query>

                <View style={{
                    flex:1,
                    borderTopWidth: 1,
                    borderTopColor: '#1519b4',
                    borderBottomWidth: 1,
                    borderBottomColor: '#1519b4',
                    marginBottom: 10,
                    marginTop: 15,

                }}>
                        <Text style={{
                            width: '100%',
                            color: '#1519b4',

                            textAlign:'center',
                            fontSize: 14,
                            fontWeight:'500',
                            padding:3,
                        }}>
                            Notes
                        </Text>
                        <TextInput
                            style={{height: 150, alignSelf: 'center',width: 250,  borderWidth: 0.5, borderColor: '#8c030b', margin:10, padding:10}}
                            onChangeText={(classNotes) => this.setState({classNotes})}
                            value={this.state.classNotes}
                            accessibilityLabel={'Notes Entry Field'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                            placeholder={'Class Notes'}
                            numberOfLines={10}
                            multiline={true}
                        />
                    </View>
                    <TouchableOpacity
                        style={{alignItems: 'center', margin:30}}
                        onPress={() => this._submitUpdateClassSession(classSessionId, classSessionAcademy)}

                    >
                        <MaterialIcons
                            name={'system-update-alt'}
                            color={'#a1030b'}
                            size={40}
                        />
                        <Text style={{color:'#a1030b'}}>Submit Update</Text>
                    </TouchableOpacity>
            </ScrollView>
        </View>
        );
    }
}
export default compose(
    graphql(DELETE_TECHNIQUE, {name: "deleteTechnique"} ),
    graphql(DELETE_TAG, {name: "deleteTag"}),
    graphql(UPDATE_CLASS_SESSION, {name:'updateClassSession'}),
    )(EditClassSessionScreen);

const styles = StyleSheet.create({
    container:{
        flex:1,
        width: '100%',
        alignItems: 'center',
        justifyContent:'center',
        alignContent:'center',
        marginTop:5
    },
    textInput: {
        alignSelf: 'center',
        height: 35,
        minWidth: 150,
        margin: 10,
        padding: 10,
        borderWidth: 0.5,
        borderColor: '#8c030b',
        // borderBottomColor: '#000000',
        // borderBottomWidth: 1,
        backgroundColor: "#fff"
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


{/****TAGS*****/}
{/*<Query query={GET_TAGS} variables={{tagSearch: this.state.tagSearch}} >*/}
{/*{({error, loading, data}) => {*/}
{/*if(error) return <Text>{error.message}</Text>;*/}
{/*if(loading) return <Text>Loading...</Text>;*/}
{/*return(*/}
{/*<View style={{*/}
{/*flex:1,*/}
{/*width: '100%',*/}
{/*borderTopWidth: 1,*/}
{/*borderTopColor: '#1519b4',*/}
{/*borderBottomWidth: 1,*/}
{/*borderBottomColor: '#1519b4', }}>*/}
{/*<Text style={{*/}
{/*color: '#1519b4',*/}
{/*textAlign:'center',*/}
{/*fontSize: 14,*/}
{/*fontWeight:'500',*/}
{/*padding:3,*/}
{/*}}>*/}
{/*Tags*/}
{/*</Text>*/}
{/*<TextInput*/}
{/*style={styles.textInput}*/}
{/*onChangeText={(tagSearch) => this.setState({tagSearch})}*/}
{/*value={this.state.tagSearch}*/}
{/*accessibilityLabel={'Tag Search Field'}*/}
{/*underlineColorAndroid={'transparent'}*/}
{/*autoCorrect={false}*/}
{/*placeholderTextColor={'#4f4f4f'}*/}
{/*keyboardAppearance={'dark'}*/}
{/*placeholder={'Tag Search'}*/}
{/*/>*/}
{/*<FlatList*/}
{/*data={data.tags}*/}
{/*renderItem={this._renderTags}*/}
{/*keyExtractor={this._tagKeyExtractor}*/}
{/*horizontal*/}
{/*/>*/}
{/*<Button*/}
{/*title={'Create Tag'}*/}
{/*onPress={() => this._toggleCreateTagModal()}*/}
{/*/>*/}
{/*<Modal*/}
{/*transparent={true}*/}
{/*animationType={"none"}*/}
{/*visible={this.state.showCreateTagModal}*/}
{/*onRequestClose={() => this._toggleCreateTagModal() }*/}
{/*>*/}
{/*<TouchableOpacity*/}
{/*onPress={() => this._toggleCreateTagModal()}*/}
{/*>*/}
{/*<ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>*/}
{/*<TouchableWithoutFeedback>*/}
{/*<View style={{*/}
{/*backgroundColor: 'rgba(0,0,0,0.7)',*/}
{/*minHeight: '80%',*/}
{/*height: 'auto',*/}
{/*width: '85%',*/}
{/*borderWidth:2,*/}
{/*borderColor: 'white'*/}
{/*}}*/}
{/*>*/}
{/*<View style={{*/}
{/*backgroundColor:'transparent',flexDirection:"column",*/}
{/*justifyContent: 'space-around', margin: 3,*/}
{/*width: 'auto', padding: 5,*/}
{/*}}*/}
{/*>*/}
{/*<Button*/}
{/*title={'Close'}*/}
{/*onPress={() => this._toggleCreateTagModal()}*/}
{/*/>*/}

{/*</View>*/}

{/*</View>*/}
{/*</TouchableWithoutFeedback>*/}
{/*</ScrollView>*/}
{/*</TouchableOpacity>*/}
{/*</Modal>*/}
{/*</View>*/}
{/*);*/}
{/*}}*/}
{/*</Query>*/}