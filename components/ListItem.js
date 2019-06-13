import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { GestureHandler } from 'expo';


const { Swipeable } = GestureHandler;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    text: {
        color: '#4a4a4a',
        fontSize: 15,
    },
    separator: {
        flex: 1,
        height: 1,
        backgroundColor: '#e4e4e4',
        marginLeft: 10,
    },
    leftAction: {
        backgroundColor: '#rgba(28,182,132,1)',
        justifyContent: 'center',
        margin:1,
        borderWidth:1,
        //flex: 1,
    },
    rightAction: {
        backgroundColor: '#dd2c00',
        justifyContent: 'center',
        // flex: 1,
        alignItems: 'flex-end',
        borderWidth:1,
        textAlign:'center',
        margin:1
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        padding: 20,
        alignSelf:'center',
    },
});

export const Separator = () => <View style={styles.separator} />;

const LeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    return (
        <View style={styles.leftAction}>
            <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
                Check-In
            </Animated.Text>
        </View>
    );
};

const RightActions = ({ progress, dragX, onPress, objectButton }) => {
    const scale = dragX.interpolate({
        inputRange: [-80, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    return (
       // <TouchableOpacity onPress={onPress}>
            <Animated.View style={styles.rightAction}>

                    {objectButton}

            </Animated.View>
        //</TouchableOpacity>
    );
};

const ListItem = ({ onSwipeFromLeft, onRightPress, swipeWhat, objectButtonRight }) => (
    <Swipeable
        friction={1}
        renderLeftActions={LeftActions}
        onSwipeableLeftOpen={onSwipeFromLeft}
        renderRightActions={(progress, dragX) => (
            <RightActions
                progress={progress}
                dragX={dragX}
                objectButton={objectButtonRight}
                //onPress={onRightPress}
            />
        )}
    >
        {swipeWhat}
    </Swipeable>
);

export default ListItem;