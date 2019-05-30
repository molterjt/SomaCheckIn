import React from 'react';
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
                    <Text style={{paddingLeft: 10, paddingTop: 5, fontSize: (Platform.isPad ? W*.025 : 14),
                        fontWeight: 'bold', color: '#8c030b'}}>
                        {this.props.title}
                    </Text>
                    <View style={{flexDirection: "row", flex: 1, justifyContent: 'flex-start'}}>
                        <Text style={{padding: 10, marginTop: 5, fontSize: (Platform.isPad ? W*.025 : 14), color: '#0c48c2'}}>
                            {this.props.time}
                        </Text>
                        <Text style={{padding: 10, marginLeft:5, marginTop: 5, fontSize: (Platform.isPad ? W*.025 : 14), color: '#0c48c2'}}>
                            {this.props.day}
                        </Text>
                        <Text style={{ padding: 10, marginLeft:5, marginTop: 5, fontSize: (Platform.isPad ? W*.025 : 14), color: '#0c48c2'}}>
                            {this.props.academy}
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
        marginTop: 6,
        width: Dimensions.get('window').width,
        borderRadius: 4,
        shadowOffset: {width: -1, height: 1,},
        shadowColor: 'black',
        shadowOpacity: 2.0,
        shadowRadius: 3,
        backgroundColor: '#ffffff',

    },
    rowText: {
        flex: 4,
        flexDirection: 'column',
        backgroundColor: '#fff',
    }
});