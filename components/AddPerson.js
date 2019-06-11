import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet, TextInput, TouchableWithoutFeedback,Picker,
    View, Text, Button,Dimensions,
    Image, TouchableOpacity, ActivityIndicator,
    Animated, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import {Ionicons, MaterialIcons, AntDesign} from '@expo/vector-icons';
import validation from 'validate.js';
import { CheckBox } from 'react-native-elements'
import {compose, graphql, Mutation, Query} from 'react-apollo';
import gql from "graphql-tag";


const WIDTH=Dimensions.get('window').width;
const HEIGHT=Dimensions.get('window').height;

const BELT_OPTIONS = gql`
    query{
        __type(name: "BeltColor"){
             name
             enumValues{name}
        }
    }
`;

const ACADEMY_LIST = gql`
    query{
        academies{
            title
            id
        }
    }
`;


const CREATE_USER = gql`
    mutation createUser($firstName: String!, $lastName: String!, $email: String!, $password: String!, $phone: String, $dob: String, $joinDate: String, $beltColor: BeltColor, $stripeCount: Int, $academies: [ID]){
        createUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password, phone: $phone, dob: $dob, joinDate: $joinDate, beltColor: $beltColor, stripeCount: $stripeCount, academies: $academies){
            user{id, firstName }
            token
            
        }
    }
`;


const constraints = {
    email:{
        presence: {
            message: '^Please enter an email address',
        },
        email: {
            message: '^Please enter a valid email address'
        },
    },
    phone:{
        presence: {
            message: '^Please enter a phone number',
        },
        format: {
            pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            flags: 'i',
            message: '^Please enter a valid phone number'
        },
    },
    firstName: {
        presence: {
            message: '^Please enter a first name'
        },
        length: {
            minimum: 1,
            message: '^Your first name must be more than 1 character'
        },
    },
    lastName: {
        presence: {
            message: '^Please enter a last name'
        },
        length: {
            minimum: 1,
            message: '^Your last name must be more than 1 character'
        },
    },

}

const validate = (fieldName, value) => {
    let formValues = {};
    formValues[fieldName] = value;

    let formFields = {};
    formFields[fieldName] = constraints[fieldName];

    const result = validation(formValues, formFields);
    if(result){
        return result[fieldName][0]
    }
    return null;
};


class AddPerson extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showModal: false,
            myRoster: [],
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: 'password',

            emailError: '',
            firstNameError: '',
            lastNameError: '',
            phoneError:'',


            dob: undefined,
            joinDate: undefined,
            beltColor: undefined,
            showBeltPickerModal: false,
            stripeCount: 0,
            stripeEntry: undefined,
            academies: [],

            checkedAcademyList: [],
            checked:false,

        }
    }

    _submit = async () => {
        const { firstName,lastName, password, email, phone, dob, joinDate, beltColor, stripeEntry, checkedAcademyList } = this.state;


        const result = await this.props.mutate({
            variables: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phone: phone,
                dob: dob,
                joinDate: joinDate,
                beltColor: beltColor,
                stripeCount: stripeEntry,
                academies: checkedAcademyList,
            }
        }).catch(error => {
            console.log('Update User Error: ', error.message);
        });
        if(result){
           this.toggleModal();

        }

    };

    _createPassword(firstName, lastName){
        const min_length = 8;
        const name_length = lastName.length;
        let minCutDepth = min_length - name_length;
        if(minCutDepth > 2) {
            let myPass =  lastName + firstName.substring(0,minCutDepth);
            if(myPass.length > 7){
                return myPass;
            }
            else {
                myPass = myPass + 'pass';
                return myPass;
            }

        }else {
            let myPass =  lastName + firstName.substring(0,2);
            if(myPass.length > 7){
                return myPass;
            } else {
                myPass = myPass + 'pass';
                return myPass;
            }
        }
    }


    _handleInterestListCheck(id){
        let checkedAcademies = this.state.checkedAcademyList;
        if(checkedAcademies && checkedAcademies.includes(id)){
            const index = checkedAcademies.indexOf(id);
            checkedAcademies.splice(index, 1);
        } else {
            checkedAcademies = checkedAcademies.concat(id);
        }
        this.setState({checkedAcademyList: checkedAcademies});
        console.log(checkedAcademies);
    }


    clearUserFormInputs(){
        this.setState({

            firstName: '',
            lastName: '',
            email: '',
            password: '',

            emailError: '',
            firstNameError: '',
            lastNameError: '',
            passwordError:'',
        });
    };
    checkRegisterCredentials(){
        const {showModal,firstName,firstNameError, lastName, lastNameError, phone, phoneError, email, emailError, DoB, DoBError } = this.state;
        if(email && !emailError){
            if(phone  && !phoneError){
                if( firstName && !firstNameError){
                    if(lastName && !lastNameError){
                        return false;
                    }
                }
            }
        }
        return true;
    };
    toggleModal = () => {this.setState({showModal: !this.state.showModal})};



    render(){
        const {showModal,firstName,firstNameError, passwordError, lastName, lastNameError, phone, phoneError, email, emailError, DoB, DoBError } = this.state;
        return(
            <View style={{marginTop: 50, justifyContent:'center', alignItems:'center'}}>
               <View style={{flexDirection:'row'}}>
                    <Ionicons
                        name={"md-person-add"}
                        color={"#0c48c2"}
                        size={32}
                        onPress={() => this.toggleModal() }
                    />
                   {/*<Text>Add</Text>*/}
               </View>
                <Modal
                    animationType="none"
                    transparent={false}
                    visible={showModal}
                    onRequestClose={() => this.toggleModal()}
                    style={styles.container}
                >
                    <ScrollView
                        style={{paddingBottom: 50, paddingTop:50, backgroundColor: 'rgba(0,0,0,0.8)', padding:20 }}
                        showsVerticalScrollIndicator={false}
                        alwaysBounceVertical={true}

                    >

                        <Button
                            title={'Close'}
                            style={{color:'red'}}
                            onPress={() => this.toggleModal()}
                        />

                        <Text style={styles.inputLabel}>First Name</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(firstName) => {
                                this.setState({firstName});
                            }}
                            value={this.state.firstName}
                            onBlur={() => {
                                this.setState({emailError: validate('firstName', firstName)});
                            }}
                            type={'text'}
                            accessibilityLabel={'Username field for Registration'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                        />
                        {firstNameError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{firstNameError}</Text>
                            : null
                        }
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(lastName) => this.setState({lastName})}
                            value={this.state.lastName}
                            onBlur={() => {
                                this.setState({lastNameError: validate('lastName', lastName)});
                            }}
                            type={'text'}
                            accessibilityLabel={'Username field for Registration'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                        />
                        {lastNameError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{lastNameError}</Text>
                            : null
                        }

                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(email) => {
                                this.setState({email});

                            }}
                            value={this.state.email}
                            onBlur={() => {
                                this.setState({emailError: validate('email', email)});
                            }}
                            type={'text'}
                            accessibilityLabel={'Email field for Registration'}
                            autoCapitalize={'none'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                        />

                        {emailError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{emailError}</Text>
                            : null
                        }
                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(phone) => this.setState({phone})}
                            value={this.state.phone}
                            accessibilityLabel={'Phone number field'}
                            autoCapitalize={'none'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                            placeholder={'Ex: 513-555-0101'}
                        />
                        <Text style={styles.inputLabel}>BirthDate</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(dob) => this.setState({dob})}
                            value={this.state.dob}
                            accessibilityLabel={'BirthDate field'}
                            autoCapitalize={'none'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                            placeholder={'Ex: 02/13/1901'}
                        />
                        <Text style={styles.inputLabel}>Join Date</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(joinDate) => this.setState({joinDate})}
                            value={this.state.joinDate}
                            accessibilityLabel={'Join Date field'}
                            autoCapitalize={'none'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                            placeholder={'Ex: 01/21/1901'}
                        />


                        <Text
                            style={{textAlign:'center', fontStyle:'italic', color: '#fff', marginTop:10, fontSize: (Platform.isPad ? WIDTH*.02 : 14),}}
                            accessibilityLabel={'Academy Checkbox Header'}
                            accessibilityRole={'header'}
                        >
                            Select The Academies You Attend:
                        </Text>
                        <Query query={ACADEMY_LIST} >
                            {({loading, error, data}) => {
                                if(loading){
                                    return <ActivityIndicator/>
                                }
                                if(error){
                                    console.log(error);
                                    return <Text>Sorry, there was an error. Check that you are connected to the internet or cellular data?</Text>
                                }
                                return(
                                    <View style={{flexDirection:'row', flexWrap: 'wrap', borderRadius:15, marginBottom: 20, marginTop: 20, padding:5, justifyContent:'space-evenly',
                                        backgroundColor: 'rgba(2500,250,250,0.1)'}}>
                                        {data.academies.map((obj, index) =>
                                            <View
                                                accessibilityLabel={'Checkbox Option'} accessibilityHint={'Tap to select if interested'}
                                                key={index}
                                                style={styles.containerRow}
                                            >
                                                <CheckBox
                                                    // ref={obj.id}
                                                    containerStyle={{ borderRadius:15, borderWidth:2, borderColor:'#000', backgroundColor: 'white'}}
                                                    textStyle={{color: '#000', fontSize:12}}
                                                    value={obj.id}
                                                    title={obj.title}
                                                    checkedColor={'#1cb684'}
                                                    checkedIcon={'dot-circle-o'}
                                                    uncheckedIcon={'circle-o'}
                                                    onPress={() => this._handleInterestListCheck(obj.id)}
                                                    checked={this.state.checkedAcademyList && this.state.checkedAcademyList.includes(obj.id)}
                                                />
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        </Query>
                        <Query query={BELT_OPTIONS} >
                            {({loading, error, data}) => {
                                if(loading){
                                    return <ActivityIndicator/>
                                }
                                if(error){
                                    console.log(error);
                                    return <Text>Sorry, there was an error. Check that you are connected to the internet or cellular data?</Text>
                                }
                                return(
                                    <View style={{borderWidth: 1, borderRadius:15, borderColor:'#000', height: 240, marginBottom: 10, marginTop: 10, justifyContent:'space-evenly', alignItems:'center', flexDirection:'row', backgroundColor: 'rgba(2500,250,250,0.1)'}}>

                                        <View style={{flexDirection:'column', borderWidth:1, borderColor: '#fff',  alignItems:'center', width: '45%', backgroundColor: '#fff', padding: 1}}>

                                            <View style={{flexDirection:'row', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', width: '100%', padding: 5}}>
                                                <Text style={{color:'#fff', marginRight:5, marginBottom:10}}>Belt Rank:</Text>
                                                <Text style = {{color:'#1cb684', marginRight:5, marginBottom:10}}>{this.state.beltColor}</Text>
                                            </View>

                                            <View style={{padding:10, position: 'relative', top: -60,}}>
                                                <Picker
                                                    selectedValue={this.state.beltColor}
                                                    style={{ height: 100, width: 120, borderColor: '#000'}}
                                                    itemStyle={{color:'#000'}}
                                                    onValueChange={(itemValue, itemIndex) =>
                                                        this.setState({beltColor: itemValue})
                                                    }>
                                                    {data.__type.enumValues.map((obj, index) =>
                                                        <Picker.Item key={index} label={obj.name} value={obj.name}  />
                                                    )}
                                                </Picker>
                                            </View>

                                        </View>
                                        <View style={{flexDirection:'column'}}>
                                            <Text style={{color:'#fff', alignSelf:'center', marginBottom:10}}>Stripe Count:</Text>
                                            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                                                <AntDesign
                                                    name={"minuscircleo"}
                                                    color={"#1cb684"}
                                                    size={25}
                                                    onPress={() =>{
                                                        if(this.state.stripeCount > 0){
                                                            this.setState({stripeCount: this.state.stripeCount-1})
                                                            this.setState({stripeEntry: this.state.stripeCount-1 })
                                                        }
                                                    }}
                                                />
                                                <Text style={{color: '#fff', marginLeft: 15, marginRight:15}}>
                                                    {this.state.stripeCount}
                                                </Text>
                                                <AntDesign
                                                    name={"pluscircleo"}
                                                    color={"#1cb684"}
                                                    size={25}
                                                    onPress={() =>{
                                                        if(this.state.stripeCount < 4){
                                                            this.setState({stripeCount: this.state.stripeCount+1})
                                                            this.setState({stripeEntry: this.state.stripeCount+1 })
                                                        }
                                                    }}
                                                />
                                            </View>

                                        </View>
                                    </View>
                                );
                            }}
                        </Query>

                        <TouchableOpacity
                            style={[styles.formButton, {marginBottom: 40}]}
                            accessible={true}
                            accessibilityLabel={'Submit Button'}
                            accessibilityHint={'Complete form fields then press Submit Button'}
                            accessibilityRole={'button'}
                            onPress={ () => {
                                this._submit();
                                //this.clearUserFormInputs();

                            }}

                            // disabled={this.checkRegisterCredentials()}

                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                        <View style={{height: 40}}/>


                    </ScrollView>

                </Modal>

            </View>
        );
    }
}

export default graphql(CREATE_USER)(AddPerson);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    textInput: {
        alignSelf: 'stretch',
        height: 40,
        width: 'auto',
        minWidth: 250,
        margin: 15,
        padding: 10,
        borderWidth:0.5,
        borderColor:'#8c030b',
        // borderBottomColor: '#000000',
        // borderBottomWidth: 1,
        backgroundColor: "#fff"
    },
    inputLabel:{
        color: 'white',
    },
    formButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor: 'rgba(155, 10, 2, 0.9)',
        backgroundColor: '#8c030b',
        padding: 8,
        marginTop: 20,
        marginBottom: 20,
        width: '33%',
        height: 'auto',
        borderWidth:1,
        borderRadius: 15,
        borderColor: '#ffffff',
    },
    buttonText:{
        color: "#ffffff",
        alignSelf: 'center',
        alignContent:'center',
        justifyContent:'center',
    },
});