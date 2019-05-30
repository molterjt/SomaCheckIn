import React from 'react';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';


import MainTabNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';




class AuthLoadingScreen extends React.Component {
    constructor() {
        super();
        this._bootstrapAsync();
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {

        const userToken = await AsyncStorage.getItem('USER_TOKEN');

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        this.props.navigation.navigate(userToken ? 'Main' : 'Auth');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}

export default createAppContainer(
    createSwitchNavigator(
      {
        AuthLoading: AuthLoadingScreen,
        Auth: AuthNavigator,
        Main: MainTabNavigator,
      },
      {
        initialRouteName: 'AuthLoading',
      }
    )
);