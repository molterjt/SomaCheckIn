import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet, TextInput,
    View, Text, Button,
    Image, TouchableOpacity,
    Animated, AsyncStorage, KeyboardAvoidingView
} from 'react-native';
import gql from 'graphql-tag';
import {graphql, Mutation} from 'react-apollo';
import {Ionicons} from '@expo/vector-icons';
import validation from 'validate.js';
import WhiateASRash from '../assets/images/WhiteASRash.png';

const constraints = {
    email:{
        presence: {
            message: '^Please enter an email address',
        },
        email: {
            message: '^Please enter a valid email address'
        },
    },
    password:{
        presence: {
            message: '^Please enter a password',
        },
        length: {
            minimum: 5,
            message: "^Your password must be at least 6 characters"
        }
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
            message: '^You must enter your first name'
        },
    },
    lastName: {
        presence: {
            message: '^Please enter a last name'
        },
        length: {
            minimum: 1,
            message: '^You must enter your last name'
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

const SIGN_UP = gql`
    mutation signup($first: String!, $last: String!, $email: String!, $password: String!){
        signup(
            firstName: $first
            lastName: $last
            email: $email
            password: $password
        ){
  	        user{id, firstName}
            token
        }
}
`


class SignUpScreen extends React.Component{
    static navigationOptions = {header: null,};
    constructor(props){
        super(props);
        this.state={
            myRoster: [],

            firstName: '',
            lastName: '',
            email: '',
            password: '',

            emailError: '',
            firstNameError: '',
            lastNameError: '',
            passwordError:'',

        }
    }

    componentDidMount(){
        const {myRoster} = this.state;
        this.setState({
            myRoster: [this.props.roster]
        })
        console.log('MyRoster: ', myRoster);

    }
    _submit = async () => {
        const { firstName,lastName, password, email } = this.state;
        const result = await this.props.mutate({
            variables: {
                first: firstName, last: lastName, email: email, password: password}
        }).catch(error => {
            console.log('SignUp Error: ', error.message);
        });
        if(result){
            const {token} = result.data.signup;
            console.log('Token: ', token);
            console.log('Welcome: ', result.data.signup.firstName);
            AsyncStorage.setItem('USER_TOKEN', token);
            this.props.navigation.navigate('Login')
        }

    }
    clearUserFormInputs(){
        this.setState({
            firstName: '',
            lastName: '',
            password: '',
            email: '',
            emailError: '',
        });
    };
    checkRegisterCredentials(){
        const {firstName, firstNameError, lastName, lastNameError, password, passwordError, email, emailError, DoB, DoBError } = this.state;
        if(email && !emailError){
            if(password  && !passwordError){
                if( firstName && !firstNameError){
                    if(lastName && !lastNameError){
                        return false;
                    }
                }
            }
        }
        return true;
    };

    render(){
        const {firstName,firstNameError, lastName, lastNameError, password, passwordError, email, emailError, } = this.state;
        return(
            <View style={styles.container}>
                <View style={{
                    //backgroundColor: 'rgba(0,0,0,0.1)',
                    height: '35%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent:'center',
                    shadowOffset: {width: 1, height: 1,},
                    shadowColor: '#000',
                    shadowOpacity: 1.0,

                    shadowRadius: 3,
                    padding: 40,
                }}
                >

                    <Image
                        source={WhiateASRash}
                        resizeMode={'contain'}
                        style={{
                            width: 250,
                            height:250,
                            paddingTop: 50,
                            shadowOffset: {width: 1, height: 1,},
                            shadowColor: '#a1030b',
                            shadowOpacity: 1.0,

                            shadowRadius: 3,
                            padding: 10,

                        }}
                    />
                </View>

                    <KeyboardAvoidingView
                        behavior="position"
                        enabled
                        keyboardVerticalOffset={-20}
                    >
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
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(password) => this.setState({password})}
                            value={this.state.password}
                            onBlur={() => {
                                this.setState({passwordError: validate('password', password)});
                            }}
                            type={'password'}
                            accessibilityLabel={'Password field for Registration'}
                            autoCapitalize={'none'}
                            underlineColorAndroid={'transparent'}
                            autoCorrect={false}
                            placeholderTextColor={'#4f4f4f'}
                            keyboardAppearance={'dark'}
                            secureTextEntry
                        />
                        {passwordError
                            ? <Text style={{color: '#c81515', textAlign:'center'}}>{passwordError}</Text>
                            : null
                        }
                        <TouchableOpacity
                            style={styles.formButton}
                            accessible={true}
                            accessibilityLabel={'Submit Button'}
                            accessibilityHint={'Complete form fields then press Submit Button'}
                            accessibilityRole={'button'}
                            onPress={ () => {
                                this._submit();
                                this.clearUserFormInputs();

                            }}

                            disabled={this.checkRegisterCredentials()}

                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>


                <Button
                    title={"Login"}
                    onPress={() => this.props.navigation.navigate('Login')}
                />
            </View>



        );
    }
}


export default graphql(SIGN_UP)(SignUpScreen);

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
        shadowOffset: {width: -1, height: 1,},
        shadowColor: '#000',
        shadowOpacity: 1.0,
        shadowRadius: 2,
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