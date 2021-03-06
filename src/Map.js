import React, { Component } from 'react';
import Preloader from "./Preloader";
import './App.scss';
import axios from 'axios';
import { scroller } from 'react-scroll';
import swal from 'sweetalert';

// Functionality involving MapQuest API
class Map extends Component {
    constructor() {

        super()
        this.state = {
            // routeType takes strings of pedestrian or bike 
            routeType: '',
            // routeResult is an object that holds two objects (bicycle and pedestrian results)
            routeResult: {},
            // commuteTime is the length of commute in minutes
            commuteTime: 0,
        }
    }


    componentDidUpdate(prevProps, prevState){
        // prevProps is an empty string initally, and this.props is populated with users input, so this conditional will run
        if(prevProps.from !== this.props.from || prevProps.to !== this.props.to) {

            if (this.props.from !== '' && this.props.to !== '') {
                const routeType = ['pedestrian', 'bicycle']

                // Mapping over the routeType and do axios calls 
                let flag = false
                // parameter (type) holds bicycle or pedestrian options
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
                    })
                })
                // Catch the axios calls and put them in to the response array
                Promise.all(promises).then((responseArray) => {
                    // Error handling, if user inputs a starting point and destination that do not give any commute results, an error will occur
                    if (flag === true) {
                        swal({
                            title: "Oops!",
                            text: "Invalid location, please try again!",
                            type: "error",
                        }).then((click) => {
                            this.scrollToTop();
                        });
                    }

                    // Get commute time from the axios call
                    // Taking the first element in the response array and add the next one to create an object
                    if (flag === false){
                        const transformedResponse = responseArray.reduce((acc, response, i) => {
                            const userRouteTime = response.data.route.legs[0].formattedTime;
                            const hour = userRouteTime.slice(0, 2);
                            const minutes = userRouteTime.slice(3, 5);
                            const mapImage = `https://www.mapquestapi.com/staticmap/v5/map?key=GjfNgstNA6zUKUgGcbkAzOwhHGvwyPRl&size=600,250@2x&defaultMarker=marker-sm-81003c-81003c&routeColor=ff7600&margin=60&type=map&start=${this.props.from}&end=${this.props.to}`
                            // Separating bike and pedestrain so that they are their own object
                            return {
                                ...acc,
                                // Once they are in their own object, add key value pairs to each object
                                [routeType[i]]: {
                                    travelHour: hour,
                                    travelMinute: minutes,
                                    mapImage: mapImage,
                                }
                            }
                        }, {})

                        if (Number(transformedResponse['bicycle']['travelHour'] + transformedResponse['bicycle']['travelMinute'] === 0) && Number(transformedResponse['pedestrian']['travelHour'] + transformedResponse['pedestrian']['travelHour'] === 0)){
                        
                            // Error handling if the commute time is 0
                            swal({
                                title: "Oops!",
                                text: "Invalid location, please try again!",
                                type: "error",
                            }).then((click) => {
                                this.scrollToTop();
                            });
                        } else {
                            // Assigning objects to route result
                            this.setState({
                                routeResult: transformedResponse,
                            }, () => {
                                const {
                                    grabMapUrl,
                                } = this.props;
                                grabMapUrl()
                            })
                        }        
                    }
                })
            }
        }
    }

    // If user chooses bike
    chooseBike = () => {
        // Selecting value from routeResult state
        // (time) is holding travel time in minutes
        const time = Number(this.state.routeResult['bicycle']['travelHour']) * 60 + Number(this.state.routeResult['bicycle']['travelMinute'])

        // Setting commuteTime to (time)
        // Referring to grabCommuteTime function in App.js, and assigning it to be a prop
        // Call grabCommuteTime function with value of "time"
        this.setState({
            commuteTime: time,
        }, () => {
            const {
                grabCommuteTime,
                routeSelected,
                grabLoading,
            } = this.props;
            
            grabCommuteTime(time, routeSelected)
            grabLoading();
        })

        // Scroll feature to scroll to "Pick a podcast"
        setTimeout(() => {
            scroller.scrollTo('podcastResults', {
                offset: 150,
                smooth: true,
                duration: 500,
            });
        }, 1000);
    }

    chooseWalk =  () => {
        const time = Number(this.state.routeResult['pedestrian']['travelHour']) * 60 + Number(this.state.routeResult['pedestrian']['travelMinute'])

        this.setState({
            commuteTime: time,
        }, () => {
            const {
                grabCommuteTime,
                routeSelected,
                grabLoading,
            } = this.props;

            grabCommuteTime(time, routeSelected)
            grabLoading();
        })

        // Scroll feature to scroll to "Pick a podcast"
        setTimeout(() => {
            scroller.scrollTo('podcastResults', {
                offset: 150,
                smooth: true,
                duration: 500,
            });
        }, 1000);
    }

    scrollToTop = () => {
        scroller.scrollTo('header', {
            smooth: true,
            duration: 700,
        });
    }

    render() {
        return (
            <div className="App">
                {/* when there is nothing in the routeResult, show nothing */}
                {/* otherwise, show results */}
                {(this.state.routeResult["bicycle"] === undefined) &
                (this.state.routeResult["pedestrian"] === undefined) ? (
                <div className="placeholderMap" id="mapResults">
                    <div className="emptyDiv wrapper">
                    <h3>Pick a mode of transportation</h3>
                    <div>
                        <p className="scrollUp">Scroll up to make a search!</p>
                    </div>
                    </div>
                </div>
                ) : (
                <section className="routeResults wrapper" id="mapResults">
                    {/* grab map url from the routeResult and display it */}
                    <h3>Pick a mode of transportation</h3>
                    <p className="commuteText">
                    Based off your commute, pick a mode of transportation
                    </p>
                    <div className="mapContainer">
                    <img
                        className="mapImage"
                        src={this.state.routeResult["pedestrian"]["mapImage"]}
                        alt="Travel route map from start to end"
                    />
                    </div>

                    <div className="commuteOptions">
                    <div className="commuteResult pedestrianResult">
                        <img
                        className="mobileRouteTypeImg"
                        src={require("./assets/walk.svg") } alt="Feet walking to show pedestrian option"
                        ></img>
                        {/* Do not display hours when time is under 60 minutes */}
                        <label className="routeType" htmlFor="walk">Walk</label>
                        <button
                        type="submit"
                        onClick={this.chooseWalk}
                        className="routeTypeButton"
                        name="walk"
                        >
                        {this.state.routeResult["pedestrian"]["travelHour"] !==
                        "00" ? (
                            <p>
                            {this.state.routeResult["pedestrian"]["travelHour"]}{" "}
                            hrs{" "}
                            {this.state.routeResult["pedestrian"]["travelMinute"]}{" "}
                            min
                            </p>
                        ) : (
                            <p>
                            {this.state.routeResult["pedestrian"]["travelMinute"]}{" "}
                            min
                            </p>
                        )}
                        </button>
                        <p className="recommendation">
                        Walking is a great way to improve or maintain your overall
                        health. Just 30 minutes every day can increase
                        cardiovascular fitness, strengthen bones, reduce excess
                        body fat, and boost muscle power and endurance
                        </p>
                    </div>

                    <div className="commuteResult bicycleResult">
                        <img alt="Bicycle to show bike option"
                        className="mobileRouteTypeImg"
                        src={require("./assets/bike.svg")}
                        ></img>
                    <label className="routeType" htmlFor="bike">Bike</label>
                        <button
                        type="submit"
                        onClick={this.chooseBike}
                        className="routeTypeButton"
                        name="bike"
                        >
                        {this.state.routeResult["bicycle"]["travelHour"] !==
                        "00" ? (
                            <p>
                            {this.state.routeResult["bicycle"]["travelHour"]} hrs{" "}
                            {this.state.routeResult["bicycle"]["travelMinute"]}{" "}
                            min
                            </p>
                        ) : (
                            <p>
                            {this.state.routeResult["bicycle"]["travelMinute"]}{" "}
                            min
                            </p>
                        )}
                        </button>
                        <p className="recommendation">
                        Riding to work or the shops is one of the most
                        time-efficient ways to combine regular exercise with your
                        everyday routine. An estimated one billion people ride
                        bicycles every day – for transport, recreation and sport.
                        </p>
                    </div>
                    </div>
                    {this.props.isLoadingPodcast ? <Preloader /> : null}
                </section>
                )}
            </div>
        );
    }
}

export default Map;