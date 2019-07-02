import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet, Image, Platform,
    Text, View, Dimensions,
} from 'react-native';

const window = Dimensions.get('window');
const W = window.width;
const H = window.height;

class ScheduleItem extends React.Component{
    constructor(props){
        super(props);
    };
    render(){
        return(
            <View style={styles.rowContainer}>
                <View style={styles.rowText}>
                    <Text style={{paddingLeft: 10, paddingTop: 5, fontSize: (Platform.isPad ? W*.025 : 16),
                        fontWeight: 'bold', color: '#fff', fontStyle:'italic'}}>
                        {this.props.title}
                    </Text>
                    <View style={{flexDirection: "row", justifyContent: 'space-around', alignItems:'center'}}>
                        <Text style={{padding: 10, fontSize: (Platform.isPad ? W*.025 : 14), color: '#1cb684'}}>
                            {this.props.time}
                        </Text>
                        <Text style={{padding: 10, fontSize: (Platform.isPad ? W*.025 : 14), color: '#1cb684'}}>
                            {this.props.day}
                        </Text>
                        <Text style={{ padding: 10, fontSize: (Platform.isPad ? W*.025 : 14), color: '#1cb684'}}>
                            {this.props.academy}
                        </Text>
                        <Text style={{ padding: 10, fontSize: (Platform.isPad ? W*.025 : 14), color: '#26a2dd'}}>
                            {this.props.instructorName}
                        </Text>

                    </View>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                    </View>
                </View>
                <View/>
            </View>
        );
    }
}
ScheduleItem.propTypes = {
    title: PropTypes.string,
    time: PropTypes.string,
    day: PropTypes.string,
    academy: PropTypes.string,
    instructorName: PropTypes.string,
    instructorId: PropTypes.string,
};

export default ScheduleItem;

const styles = StyleSheet.create({
    thumbnail: {
        //flex: 1,
        marginLeft: 1,
        height: H * 0.12 ,
        width: W * 0.3,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 1.0,
        shadowRadius: 3,
        borderRadius: 15,
        borderWidth: 1,
        alignSelf: 'center',
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: 10,
        paddingLeft: 8,
        paddingBottom: 5,
        marginBottom: 5,
        width: Dimensions.get('window').width,
        borderRadius: 4,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 2.0,
        shadowRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.6)',

    },
    rowText: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'transparent',
    }
});