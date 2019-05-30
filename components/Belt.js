import React from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    Image,
} from 'react-native';
import Colors from '../constants/Colors';







export default class Belt extends React.Component{
    constructor(props){
        super(props);
    }
    addStripes(){
        if(this.props.stripes > 0){
            const stripeArray = [];
            for( let i = 0; i < this.props.stripes; i += 1){
               stripeArray.push(
                   <View
                       key={i}
                       style={{
                            height: 33.5,
                            width: 5,
                            backgroundColor: 'white',
                            marginLeft: 2,
                            marginRight: 5,
                            alignSelf: 'right',
                            alignContent: 'flex-end'
                        }}
                   />
               );
           }
           return stripeArray;
        }
    }

    render() {
        return (

            <View style={[styles.belt, this.props.style]}>
                <View style={{
                    flex:1,
                    width: '60%',
                    height: 34,
                    alignSelf:'center',
                    flexDirection:'row',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    alignContent: 'flex-end',
                    backgroundColor: (this.props.BlackBelt ? '#850f0d' : 'black')
                }}>
                    {this.addStripes()}
                </View>

            </View>

        );
    }
}
Belt.propTypes = {
    style: PropTypes.object,
    stripes: PropTypes.number,
    BlackBelt: PropTypes.bool,
}

const styles = StyleSheet.create({
   belt:{
       width: 100,
       height: 35,
       borderWidth: 1,
       borderColor: '#000',
       backgroundColor: 'transparent',
       shadowOffset: {width: 1, height: 2,},
       shadowColor: 'black',
       shadowOpacity: 1.0,
       shadowRadius: 2,


   },

});