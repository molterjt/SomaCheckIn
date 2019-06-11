
<Query
    query={ClassPeriodsToday}
    variables={{
        academyTitle: this.state.academyTitle,
        daySearch:"Tuesday",

    }}
    fetchPolicy={'network-only'}
>
    {({loading, error, data}) => {
        if(loading){
            return(<View><Text>Loading</Text></View>)
        }
        if(error){
            console.log(error.message);
            return(<View><Text>`Error! ${error.message}`</Text></View>)
        }
        return(
            <View style={{marginTop: 5}}>
                {data.classPeriodsToday.map((obj, index) => (
                        <View key={index}>
                            {/** Class Period for CheckIn Status **/}
                            <Text>{obj.title} -- {obj.day} at {obj.time}</Text>
                            {obj.academy.users.map((x, index) => (
                                    <ListItem
                                        key={index}
                                        onSwipeFromLeft={() => console.log('swiped from left!')}
                                        onRightPress={() => console.log('pressed right!')}
                                        swipeWhat={
                                            <RosterRow
                                                key={x.id}
                                                memberId={x.id}
                                                beltColor={x.beltColor}
                                                stripeCount={x.stripeCount}
                                                joinDate={x.joinDate}
                                                firstName={x.firstName}
                                                lastName={x.lastName}
                                                navigation={this.props.navigation}
                                                checkedIn={false}
                                                classSessionTitle={"Tue Jun 04 2019__cjw1kxp9c053r0882omxxn8qs"}
                                            />
                                        }
                                    />
                                )
                            )
                            }
                        </View>
                    )
                )
                }

            </View>
        )
    }}
</Query>