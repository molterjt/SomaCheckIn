import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList
}
from 'react-native'
import MenuButton from '../components/MenuButton';
import Event from '../components/Event';
import Swiper from "react-native-swiper/index";



export default class EventScreen extends React.Component{
    static navigationOptions = {header: null};
    constructor(props){
        super(props);
        this.state={
            position: 0,
            items: [],
        }
    }
    componentDidMount() {
        console.log('data: ', this.props);
        this.setState({
            items: [
                {
                    title:`Scott Evans' Super Seminar`,
                    date:'4/20/2020',
                    day:'Saturday',
                    time:'10:00 a.m.',
                    location:'Oxford',
                    type:'Seminar',
                    price:'$95',
                    note:`Scott Evans' Super Seminar will include all of the secrets that he holds onto to make his game so strong.  The seminar will run for about 3.5 hours followed by a group picture and an opportunity for an open mat.`,
                    eventImage:'http://www.somajj.com/assets/pictures/scottthumb.jpg',
                },
                {
                    title:`Scott Totts`,
                    date:'4/20/2020',
                    day:'Saturday',
                    time:'10:00 a.m.',
                    location:'Oxford',
                    type:'Seminar',
                    price:'$95',
                    note:`Scott Evans' Super Seminar will include all of the secrets that he holds onto to make his game so strong.  The seminar will run for about 3.5 hours followed by a group picture and an opportunity for an open mat.`,
                    eventImage:'http://www.somajj.com/assets/pictures/scottthumb.jpg',
                },
            ],
            position: 0,
        })
    };
    _renderItem = ({item}) => {
        return(
            <Event
                id={item.id}
                title={item.title}
                date={item.date}
                day={item.day}
                time={item.time}
                location={item.location}
                type={item.type}
                price={item.price}
                note={item.note}
                eventImage={item.eventImage}
            />
        );
    };

    render(){
        return(
            <View style={styles.container}>
                 <MenuButton navigation={this.props.navigation}/>

                <Swiper
                    index={this.state.position}
                    showButtons={false}
                    dot={<View style={{backgroundColor: '#a5b1b2', width: 10, height: 10, borderRadius: 7, marginLeft: 5, marginRight: 5}} />}
                    activeDot={<View style={{backgroundColor: '#1cb684', width: 12, height: 12, borderRadius: 7, marginLeft: 5, marginRight: 5}} />}
                    paginationStyle={{bottom: 25}}
                >
                <View>
                    <Event
                        id={6626}
                        title={`Scott Evans' Super Seminar`}
                        date={'4/20/2020'}
                        day={'Saturday'}
                        time={'1:00 p.m.'}
                        location={'Oxford'}
                        type={'Seminar'}
                        price={'$95'}
                        note={`Scott Evans' Super Seminar will include all of the secrets that he holds onto to make his game so strong.  The seminar will run for about 3.5 hours followed by a group picture and an opportunity for an open mat.`}
                        eventImage={'http://www.somajj.com/assets/pictures/scottthumb.jpg'}
                    />
                </View>
                <View>
                    <Event
                        id={666}
                        title={`Local Jiu-Jitsu Tournament`}
                        date={'5/20/2020'}
                        day={'Saturday'}
                        time={'10:00 a.m.'}
                        location={'Cincinnati'}
                        type={'Competition'}
                        price={'$75'}
                        note={`Single Elimination.  Weigh-Ins from 8:00 - 10:00 a.m.  `}
                        eventImage={'http://www.somajj.com/assets/pictures/jjprogram.jpg'}
                    />
                </View>
                <View>
                    <Event
                        id={6646}
                        title={`Garrett Myers' Super Seminar`}
                        date={'3/20/2020'}
                        day={'Friday'}
                        time={'7:00 p.m.'}
                        location={'Dayton'}
                        type={'Seminar'}
                        price={'Free'}
                        note={'Learn GJJ with Garrett Myers.'}
                        eventImage={'http://www.somajj.com/assets/pictures/garrettthumb.jpg'}
                    />
                </View>





                </Swiper>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    }
});

{/*

<Event
    title={`Scott Evans' Super Seminar`}
    date={'4/20/2020'}
    day={'Saturday'}
    time={'10:00 a.m.'}
    location={'Oxford'}
    type={'Seminar'}
    price={'$95'}
    note={`Scott Evans' Super Seminar will include all of the secrets that he holds onto to make his game so strong.  The seminar will run for about 3.5 hours followed by a group picture and an opportunity for an open mat.`}
    eventImage={'http://www.somajj.com/assets/pictures/scottthumb.jpg'}
/>

*/}