import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types'
import {Ionicons, AntDesign} from '@expo/vector-icons';
import { Svg } from 'expo';

const {Line} = Svg;


export default class Technique extends React.Component{
    constructor(props){
        super(props);
        this.state={
            showTechTags: false,
            LinesToDraw: [],
            techAdded: false,
        }
    }
    // static getDerivedStateFromProps(nextProps, prevState) {
    //     if (nextProps.techniqueAdded !== prevState.techAdded) {
    //         return {
    //             techAdded: nextProps.techniqueAdded,
    //         };
    //     }
    //
    //     return null;
    // }

    _toggleTechTags = () => this.setState({showTechTags: !this.state.showTechTags});

    _renderTagLines = (tagNumber) => {
        let mainLineHeight = tagNumber * 35;
        let branchLength = 70;
        let branchYDiff = 35;
        let xAxisStart  = 15;
        const LineArr = [];
        for(let j = 0; j < tagNumber; j++){
               LineArr.push(

                   <Line
                        key={j}
                        x1={xAxisStart.toString()}
                        y1={( (branchYDiff*j) + branchYDiff).toString()}
                        x2={(xAxisStart+branchLength).toString()}
                        y2={( (branchYDiff*j) + branchYDiff).toString()}
                        stroke={"#1cb684"}
                        strokeWidth="1"
                    />

               );
        }
       this.setState({LinesToDraw: [...LineArr]})

    };
    componentDidMount(){
        this._renderTagLines(this.props.techTags.length);
    }
    render(){

        return(
            <View style={{alignItems:'center', margin: 5,
                marginRight:10,  width: 'auto',}}>

                {this.props.showAddButton
                    ?( <TouchableOpacity onPress={this.props.techPress}>
                        <Ionicons
                            name={'ios-add-circle-outline'}
                            size={28}
                            color={'red'}
                        />
                    </TouchableOpacity>)
                    :(null)
                }
                <TouchableOpacity
                    style={{

                        height: 30,
                        minWidth:70,
                        backgroundColor: (this.props.techColor),
                        borderColor:'#000',
                        borderWidth: 1,
                        borderRadius: 30,
                        padding:5
                    }}
                    onPress={ () => this._toggleTechTags() }
                    onLongPress={this.props.onLongPress}
                >
                    <Text style={{color: '#fff', fontSize:12, paddingLeft: 2, textAlign:'center'}}>{this.props.techTitle}</Text>
                </TouchableOpacity>
                {this.state.showTechTags && this.state.LinesToDraw.length > 0
                    ? (
                        <Svg
                            height={(this.state.LinesToDraw.length * 50).toString()}
                            width={'100%'}
                        >
                            <Line
                                x1={"15"}
                                y1="0"
                                x2={"15"}
                                y2={(this.state.LinesToDraw.length * 35).toString()}
                                stroke={"#1cb684"}
                                strokeWidth="1"
                            />
                            {this.state.LinesToDraw}
                            <View style={{width:'100%'}}>
                            {this.props.techTags.map((x,i) =>
                                <Text
                                    key={x.id}
                                    style={{
                                        position: 'absolute',
                                        top: (35*i) + 19,
                                        left: 20,
                                        fontSize: 10
                                    }}
                                >
                                    {x.name}
                                    </Text>
                            )}
                            </View>
                        </Svg>
                    )
                    : null
                }
            </View>

        );
    }
}
Technique.propTypes = {
    techTitle: PropTypes.string,
    techPress: PropTypes.func,
    onLongPress: PropTypes.func,
    techTags: PropTypes.array,
    showAddButton: PropTypes.bool,
    techColor: PropTypes.string,
};
