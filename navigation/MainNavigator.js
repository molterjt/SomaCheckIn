import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import RosterScreen from '../screens/RosterScreen';
import CheckInHistoryScreen from '../screens/CheckInHistoryScreen';
import PersonScreen from '../screens/PersonScreen';


import MenuDrawer from "../components/MenuDrawer";
import FullRosterScreen from "../screens/FullRosterScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import EventScreen from "../screens/EventScreen";
import ClassManagementScreen from "../screens/ClassManagementScreen";
import EditClassSessionScreen from "../screens/EditClassSessionScreen";


const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const ProfileStack = createStackNavigator({
    Profile: ProfileScreen,
    CheckInHistory: CheckInHistoryScreen,
    EditProfile: EditProfileScreen,
});

ProfileStack.navigationOptions = {

};

const ScheduleStack = createStackNavigator({
  Schedule: ScheduleScreen,
});

ScheduleStack.navigationOptions = {

};

const RosterStack = createStackNavigator({
    Roster: RosterScreen,
    Person: PersonScreen,
    CheckInHistory: CheckInHistoryScreen,
    EditProfile: EditProfileScreen,
    FullRoster: FullRosterScreen
});

RosterStack.navigationOptions = {

};

const EventStack = createStackNavigator({
    Events: EventScreen,

});

EventStack.navigationOptions = {

};

const ClassSessionManagementStack = createStackNavigator({
    ClassManagement: ClassManagementScreen,
    EditClassSession: EditClassSessionScreen,

});

EventStack.navigationOptions = {

};


export default  createDrawerNavigator(
    {
        HomeStack,
        ProfileStack,
        ScheduleStack,
        RosterStack,
        EventStack,
        ClassSessionManagementStack,

    },
    {
        initialRouteName: "ClassSessionManagementStack",
        drawerWidth: 200,
        contentComponent: ({navigation}) => {
            return(<MenuDrawer navigation={navigation}/>)
        }
    }
)