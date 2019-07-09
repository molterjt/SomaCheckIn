import React from 'react';
import PropTypes from 'prop-types';
import {
    ScrollView, StyleSheet, TextInput,
    View, Text, Button, Picker, Modal,
    Image, TouchableOpacity, Dimensions, Platform,
    Animated, AsyncStorage, KeyboardAvoidingView, ActivityIndicator, TouchableWithoutFeedback
} from 'react-native';
import gql from 'graphql-tag';
import {compose, graphql, Mutation, Query} from 'react-apollo';
import {Ionicons, AntDesign, MaterialIcons} from '@expo/vector-icons';
import validation from 'validate.js';
import { CheckBox } from 'react-native-elements'
import Belt from "../components/Belt";



const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

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

const EDIT_PROFILE = gql`
    mutation updateUser($id: ID!,$firstName: String, $lastName: String, $email: String, $password: String, $phone: String, $dob: String, $joinDate: String, $beltColor: BeltColor, $stripeCount: Int, $academies: [ID]){
        updateUser(userId: $id, firstName: $firstName, lastName: $lastName, email: $email, password: $password,phone: $phone, dob: $dob, joinDate: $joinDate, beltColor: $beltColor, stripeCount: $stripeCount, academies: $academies){
            id
            firstName 
        }
    }
`;

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
        }
    }
`;


class EditProfileScreen extends React.Component{
   // static navigationOptions = {header: null,};
    constructor(props){
        super(props);
        this.state={
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            password: undefined,

            emailError: '',
            firstNameError: '',
            lastNameError: '',
            passwordError:'',

            userId: this.props.navigation.state.params.itemId,
            phone: undefined,
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
    componentDidMount(){
        console.log('==========> ', this.state.userId)
    }
    _toggleBeltPickerModal(){
        const {showBeltPickerModal} = this.state;
        this.setState({showBeltPickerModal: !showBeltPickerModal});
    }

    _handleAcademyListCheck(id){
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


    _submit = async () => {
        const { firstName,lastName, password, email, userId, phone, dob, joinDate, beltColor,stripeEntry,checkedAcademyList } = this.state;
        const result = await this.props.mutate({
            variables: {
                id: userId,
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
            this.props.navigation.goBack(null);

        }

    };
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
        const {
            firstName,firstNameError,
            lastName, lastNameError,
            password, passwordError,
            email, emailError,
            userId, phone, dob, joinDate, beltColor, stripeCount, academies
        } = this.state;

        return (
            <View style={styles.container}>

                <View
                    style={{alignItems:'center', justifyContent:'center', marginTop: 20,}}
                   >
                    <ScrollView style={{marginBottom: 30}}>
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
                                    <View style={{ marginBottom: 10, marginTop: 10, justifyContent:'space-evenly', alignItems:'center', flexDirection:'row'}}>
                                        <View style={{flexDirection:'column'}}>
                                            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                                                <Text style={{color:'white', marginRight:5, marginBottom:10}}>Belt Rank:</Text>
                                                <TouchableOpacity
                                                    onPress={() => this._toggleBeltPickerModal()}
                                                >
                                                    <MaterialIcons
                                                        name={"open-in-new"}
                                                        color={"#1cb684"}
                                                        size={25}
                                                        style={{marginBottom:10}}

                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style = {{color:'#fff', alignSelf:'center'}}>{this.state.beltColor}</Text>
                                        </View>
                                        <View style={{flexDirection:'column'}}>
                                            <Text style={{color:'#fff', alignSelf:'center', marginBottom:10}}>Stripe Count:</Text>
                                            <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                                                <AntDesign
                                                    name={"minuscircleo"}
                                                    color={"#1cb684"}
                                                    size={20}
                                                    onPress={() =>{
                                                        if(stripeCount > 0){
                                                            this.setState({stripeCount: stripeCount-1})
                                                            this.setState({stripeEntry: stripeCount-1 })
                                                        }
                                                    }}
                                                />
                                                <Text style={{color: '#fff', marginLeft: 10, marginRight:10}}>
                                                    {this.state.stripeCount}
                                                </Text>
                                                <AntDesign
                                                    name={"pluscircleo"}
                                                    color={"#1cb684"}
                                                    size={20}
                                                    onPress={() =>{
                                                        if(stripeCount < 4){
                                                            this.setState({stripeCount: stripeCount+1})
                                                            this.setState({stripeEntry: stripeCount+1 })
                                                        }
                                                    }}
                                                />
                                            </View>

                                        </View>


                                        <Modal
                                            transparent={true}
                                            animationType={"none"}
                                            visible={this.state.showBeltPickerModal}
                                            onRequestClose={() => this._toggleBeltPickerModal() }
                                        >
                                            <TouchableOpacity
                                                onPress={() => this._toggleBeltPickerModal()}
                                            >
                                                <ScrollView contentContainerStyle={styles.modalContainer} showsVerticalScrollIndicator={false}>
                                                    <TouchableWithoutFeedback>
                                                        <View style={{backgroundColor: 'rgba(250,250,250,1)', height: 'auto', width: '60%', borderWidth:1}}>
                                                            <View style={{
                                                                backgroundColor:'#fff',flexDirection:"column",
                                                                justifyContent: 'center', margin: 3, flexWrap:'wrap',
                                                                height: '40%', width: 'auto', padding: 5
                                                            }}
                                                            >
                                                                <Button
                                                                    title={'Close'}
                                                                    onPress={() => this._toggleBeltPickerModal()}
                                                                />
                                                                <Picker
                                                                    selectedValue={this.state.beltColor}
                                                                    style={{height:50, width: 120, alignSelf:'center',}}
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
                                                    </TouchableWithoutFeedback>
                                                </ScrollView>
                                            </TouchableOpacity>
                                        </Modal>

                                    </View>
                                );
                            }}
                        </Query>


                            <Text
                                style={{textAlign:'center', fontStyle:'italic', color: '#fff', marginTop:10, fontSize: (Platform.isPad ? WIDTH*.02 : 14),}}
                                accessibilityLabel={'Interest Check Box Header'}
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
                                        <View style={{flexDirection:'row', flexWrap: 'wrap', marginBottom: 10, marginTop: 10, justifyContent:'space-evenly',}}>
                                            {data.academies.map((obj, index) =>
                                                <View
                                                    accessibilityLabel={'Checkbox Option'} accessibilityHint={'Tap to select if interested'}
                                                    key={index}
                                                    style={styles.containerRow}
                                                >
                                                    <CheckBox
                                                        // ref={obj.id}
                                                        containerStyle={{ borderRadius:15, borderWidth:1, borderColor:'#fff', backgroundColor: 'transparent'}}
                                                        textStyle={{color: '#fff', fontSize:12}}
                                                        value={obj.id}
                                                        title={obj.title}
                                                        checkedColor={'#1cb684'}
                                                        checkedIcon={'dot-circle-o'}
                                                        uncheckedIcon={'circle-o'}
                                                        onPress={() => this._handleAcademyListCheck(obj.id)}
                                                        checked={this.state.checkedAcademyList && this.state.checkedAcademyList.includes(obj.id)}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    );
                                }}
                            </Query>




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

                            // disabled={this.checkRegisterCredentials()}

                        >
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>


           </View>



        );
    }
}


export default graphql(EDIT_PROFILE)(EditProfileScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    containerRow:{
        borderRadius:15,
        width: WIDTH*.35 || 'auto',
        backgroundColor: 'transparent'

    },
    textInput: {
        alignSelf: 'center',
        height: 35,
        width: WIDTH * 0.6,
        minWidth: 250,
        margin: 10,
        padding: 10,
        borderWidth:0.5,
        borderColor:'#8c030b',
        backgroundColor: "#fff"
    },
    inputLabel:{
        marginLeft: 20,
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