import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet, TextInput,
    View, Text, Button,
    Image, TouchableOpacity,
    Animated, Modal, KeyboardAvoidingView, AsyncStorage
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

const LOGIN = gql`
    mutation login($email: String!, $password: String!){
        login(
            email: $email
            password: $password
        ){
  	        user{id, firstName}
            token
        }
}
`


class LoginScreen extends React.Component{
    static navigationOptions = {header: null,};
    constructor(props){
        super(props);
        this.state={
            email: 'molterjt@miamioh.edu',
            password: 'one4one9',
            emailError: '',
            passwordError:'',
        }
    }
    _submit = async () => {
        const { password, email } = this.state;
        const result = await this.props.mutate({
            variables: {
                email: email, password: password}
        }).catch(error => {
            console.log('Login Error: ', error.message);
            this.setState({graphQL_Error: error.message});
        });
        if(result){
            const {token} = result.data.login;
            AsyncStorage.setItem('USER_TOKEN', token);
            console.log('Token: ', token);
            console.log('Welcome: ', result.data.login.user.firstName);
            this.props.navigation.navigate('Main')
        }

    }
    clearUserFormInputs(){
        this.setState({
            password: '',
            email: '',
            emailError: '',
            passwordError: '',
            graphQL_Error: '',

        });
    };
    checkRegisterCredentials(){
        const {password, passwordError, email, emailError} = this.state;
        if(email && !emailError){
            if(password  && !passwordError){
                return false;
            }
        }
        return true;
    };

    render(){
        const {password, passwordError, email, emailError, graphQL_Error } = this.state;
        return(

            <View style={styles.container}>
                <View style={{
                    //backgroundColor: 'rgba(0,0,0,0.1)',
                    height: '40%',
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
                    keyboardVerticalOffset={-10}
                    style={{
                        paddingTop: 30
                    }}
                >
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
                        accessibilityLabel={'Email field for Login'}
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
                        secureTextEntry
                        accessibilityLabel={'Password field for Login'}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                        autoCorrect={false}
                        placeholderTextColor={'#4f4f4f'}
                        keyboardAppearance={'dark'}
                    />
                    {passwordError
                        ? <Text style={{color: '#c81515', textAlign:'center'}}>{passwordError}</Text>
                        : null
                    }
                    {graphQL_Error
                        ? <Text style={{color: '#c81515', textAlign:'center', fontWeight: 'bold'}}>{graphQL_Error.substring(15).toUpperCase()}!!</Text>
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
                    style={{marginTop: 50}}
                    title={"Need to Sign Up"}
                    onPress={() => this.props.navigation.navigate('SignUp')}
                />



            </View>



        );
    }
}


export default graphql(LOGIN)(LoginScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.8)',

    },
    inputLabel:{
        color: 'white'
    },
    textInput: {
        alignSelf: 'stretch',
        height: 40,
        width: 'auto',
        minWidth: 250,
        margin: 20,
        padding: 10,
        borderWidth:0.5,
        borderColor:'#8c030b',
        // borderBottomColor: '#000000',
        // borderBottomWidth: 1,
        backgroundColor: "#fff"
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
        borderColor: '#fff',
    },
    buttonText:{
        color: "#ffffff",
        alignSelf: 'center',
        alignContent:'center',
        justifyContent:'center',
    },
});