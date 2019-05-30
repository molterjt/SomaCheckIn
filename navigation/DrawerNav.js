import React from 'react';
import {Button, Image, Platform, StyleSheet, Text, View} from 'react-native';
import { createDrawerNavigator, createAppContainer } from 'react-navigation';
// import HomeScreen from "../screens/HomeScreen";
import MenuButton from '../components/MenuButton';
import MenuDrawer from "../components/MenuDrawer";


class MyHomeScreen extends React.Component {
    static navigationOptions = {
        drawerLabel: 'Home',
        drawerIcon: ({ tintColor }) => (
            <Image
                source={require('../assets/images/icon.png')}
                style={[styles.icon, {tintColor: tintColor}]}
            />
        ),
    };

    render() {
        return (
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <MenuButton navigation={this.props.navigation}/>
                <Text>adfadsfdasfadsfads</Text>
                <Button
                onPress={() => this.props.navigation.navigate('Notifications')}
                title="Go to notifications"
            />
            </View>
        );
    }
}

class MyNotificationsScreen extends React.Component {


    render() {
        return (
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <MenuButton navigation={this.props.navigation}/>
                <Button
                    onPress={() => this.props.navigation.goBack()}
                    title="Go back home"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});



const MyDrawer = createDrawerNavigator(
    {
        Home: {
            screen: MyHomeScreen,
        },
        Notifications: {
            screen: MyNotificationsScreen
        },
    },
    {
        drawerWidth: 200,
        contentComponent: ({navigation}) => {
            return(<MenuDrawer navigation={navigation}/>)
        }
    }
);

//const MyApp = createAppContainer(MyDrawer);

export default MyDrawer;
