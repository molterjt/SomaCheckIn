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
    _bootstrapAsync = async () => {

        const userToken = await AsyncStorage.getItem('USER_TOKEN');

        this.props.navigation.navigate(userToken ? 'Main' : 'Auth');
    };

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