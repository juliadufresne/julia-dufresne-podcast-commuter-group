import React, { Component } from 'react';
import './App.scss';
import axios from 'axios';

// Functionality involving MapQuest API
class Map extends Component {
    constructor() {
        super()
        // routeType takes strings of pedestrian or bike 
        // routeResult is an object that holds two objects (bicycle and pedestrian results)
        this.state = {
            routeType: '',
            routeResult: {},
            commuteTime: 0,
            isLoading: false,
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(prevProps.from != this.props.from || prevProps.to != this.props.to){

            if (this.props.from !== '' && this.props.to !== '') {
                const routeType = ['pedestrian', 'bicycle']
    
                //mapping over the routeType and do axios calls 
                let flag = false
                const promises = routeType.map((type) => {
                    return axios({
                        url: 'https://www.mapquestapi.com/directions/v2/route',
                        params: {
                            key: 'GjfNgstNA6zUKUgGcbkAzOwhHGvwyPRl',
                            from: this.props.from,
                            to: this.props.to,
                            routeType: type,
                        },
                        timeout: 2000,
                    }).catch((e)=>{
                        flag=true
                        console.log(flag)
                    })
                })
                //catch the axios calls and put them in to the response array
                Promise.all(promises).then((responseArray) => {
                    console.log(responseArray)
                    if (flag === true) {
                        alert("Wrong!!!!!!!!!!!!!!!!!!!!! Mother Fucker")
                    }
                    if(flag===false){
                        //get time from the axios call
                        //taking the first element in the response array (pedestrain for now) and add the next one to create an object
                        const transformedResponse = responseArray.reduce((acc, response, i) => {
                            const userRouteTime = response.data.route.legs[0].formattedTime;
                            const hour = userRouteTime.slice(0, 2);
                            const minutes = userRouteTime.slice(3, 5);
                            const mapImage = `https://www.mapquestapi.com/staticmap/v5/map?key=GjfNgstNA6zUKUgGcbkAzOwhHGvwyPRl&size=600,250@2x&defaultMarker=marker-sm-81003c-81003c&routeColor=ff7600&margin=60&type=map&start=${this.props.from}&end=${this.props.to}`
        
                            //separating bike and pedestrain so that they are their own object
                            return {
                                ...acc,
                                //once they are in their own object, add key value pairs to each object
                                [routeType[i]]: {
                                    travelHour: hour,
                                    travelMinute: minutes,
                                    mapImage: mapImage,
                                }
                            }
                            // reduce syntax 
                        }, {})
        
                        // assigning objects to route result
                        this.setState({
                            routeResult: transformedResponse
                        })
                    }

                })
            }
        }
    }

    // If user chooses bike
    chooseBike = () => {
        // selecting value from routeResult state
        // "time" is holding travel time in minutes
        const time = Number(this.state.routeResult['bicycle']['travelHour']) * 60 + Number(this.state.routeResult['bicycle']['travelMinute'])

        // Setting commuteTime to "time"
        // Referring to grabCommunteuteTime function in App.js, and assigning it to be a prop
        // Call grabCommunteuteTime function with value of "time"
        this.setState({
            commuteTime: time,
        }, () => {
            const {
                grabCommuteTime,
                routeSelected
            } = this.props;
            
            // console.log(time);
            grabCommuteTime(time, routeSelected)
        })
    }

    chooseWalk =  () => {
        const time = Number(this.state.routeResult['pedestrian']['travelHour']) * 60 + Number(this.state.routeResult['pedestrian']['travelMinute'])
        console.log(time)

        this.setState({
            commuteTime: time,
        }, () => {
            const {
                grabCommuteTime,
                routeSelected
            } = this.props;

            grabCommuteTime(time, routeSelected)
        })
    }

    render() {
        return (
            <div className="App">

                {/* when there is nothing in the routeResult, show nothing */}
                {/* otherwise, show results */}
                {(this.state.routeResult['bicycle'] === undefined & this.state.routeResult['pedestrian'] === undefined) 
                ? 
                
                <div className="placeholderMap" id="mapResults">
                    <div className="emptyDiv wrapper">
                        <h3>Pick a mode of transportation</h3>
                        <div>
                            <p className="scrollUp">Scroll up to make a search!</p>
                        </div>
                    </div>
                </div>

                
                : (
                    <section className="routeResults wrapper" id="mapResults">
                        {/* grab map url from the routeResult and display it */}
                        <h3>Pick a mode of transportation</h3>
                        <p className="commuteText">Based off your commute, pick a mode of transportation</p>
                        <div className="mapContainer">
                            <img className="mapImage" src={this.state.routeResult['pedestrian']['mapImage']} alt="Travel route map from start to end" />
                        </div>

                        <div className="commuteOptions">
                            <div className="commuteResult pedestrianResult">
                                <img className="mobileRouteTypeImg" src={require('./assets/walk.svg')}></img>
                                {/* Do not display hours when time is under 60 minutes */}
                                
                                <button 
                                    type='submit'
                                    onClick={this.chooseWalk}
                                    className="routeTypeButton" >
                                        {this.state.routeResult['pedestrian']['travelHour'] !== "00"
                                        ?
                                        <p>{this.state.routeResult['pedestrian']['travelHour']} hrs {this.state.routeResult['pedestrian']['travelMinute']} min</p>
                                        :
                                        <p>{this.state.routeResult['pedestrian']['travelMinute']} min</p>}
                                </button>
                                <p className='recommendation'>Walking is a great way to improve or maintain your overall health. Just 30 minutes every day can increase cardiovascular fitness, strengthen bones, reduce excess body fat, and boost muscle power and endurance</p>
                            </div>

                            <div className="commuteResult bicycleResult">
                                <img className="mobileRouteTypeImg" src={require('./assets/bike.svg')}></img>
                                
                                <button type='submit'
                                    onClick={this.chooseBike}
                                    className="routeTypeButton" >
                                    {this.state.routeResult['bicycle']['travelHour'] !== "00"
                                        ?
                                        <p>{this.state.routeResult['bicycle']['travelHour']} hrs {this.state.routeResult['bicycle']['travelMinute']} min</p>
                                        :
                                        <p>{this.state.routeResult['bicycle']['travelMinute']} min</p>}
                                </button>
                                <p className="recommendation">Riding to work or the shops is one of the most time-efficient ways to combine regular exercise with your everyday routine. An estimated one billion people ride bicycles every day – for transport, recreation and sport.</p>
                            </div>
                        </div>
                        
                    </section>
                )}
            </div>
        );
    }
}

export default Map;