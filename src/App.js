import React, { Component } from 'react';
import './App.scss';
import axios from 'axios';
import Map from './Map.js'
import Podcast from './Podcast';
import { scroller } from 'react-scroll';
import swal from 'sweetalert';



// App holds all components and elements vital to structure of the page
class App extends Component {
  constructor(props){

    super(props);

    this.state = {
      // podcast type search field
      userInput: '',
      // commute time in minutes based off users selected mode of transportation
      appTime: 0,
      // starting address
      fromStreet: '',
      // starting city
      fromCity:'',
      // starting province
      fromProvince: '',
      // destination address
      toStreet: '',
      // destination city
      toCity: '',
      // destination province
      toProvince: '',
      // entire string of starting address
      from: '',
      // entire string of destination
      to: '',
      // sets podcast type search field to empty after submit
      userEntry: '',
      // holds podcast results
      podData: [],
      // preloader
      isLoading: false,
      isLoadingPodcast: false,
      menuOpen: false,
    }

  }

  // Function to grab commute time from Map.js
  // Function runs when user selects their transportation method (walk or bike)
  grabCommuteTime = (time, callback) => {
    this.setState({
      appTime: time,
    }, callback)
  }

  // Function runs when user selects their transportation method, and podcasts are loading
  grabLoading = () => {
    this.setState({
      isLoadingPodcast: true,
    })
  }

  // Function runs when user submits form
  grabMapUrl = () => {
    this.setState({
      isLoading: false,
    })
  }

  // When user selects (walk or bike), run Podcast API call
  routeSelected = () => {
    axios({
      url: `https://listen-api.listennotes.com/api/v2/search`,
      method: `GET`,
      headers: { 'X-ListenAPI-Key': 'efedd950b2d84805a5c9ede9b4543e23' },
      dataResponse: `jsonp`,
      params: {
        q: this.state.userInput,
        type: "episode",
        language: 'English',
        // Taking commute time from Map.js, passing it to App.js and running it through grabCommuteTime function
        len_min: this.state.appTime,
        len_max: this.state.appTime + 5,
      }
    }).then((response) => {
      // Creating new array with data from listenNotes API call

      // If there are no results, alert the user
      if (response.data.count === 0){
        swal({
          title: "Oops!",
          text: "There are no podcasts that meets your search!",
          type: "error",
        }).then((click) => {
          this.scrollToTop();
        });

      // If there are results, setState with response data that the application needs
      } else {
        const newState = [];
        response.data.results.map(function (podcast) {
          newState.push({
            podData: podcast,
            podTitle: podcast.podcast_title_original,
            podDescription: podcast.title_original,
            podImage: podcast.image,
            podUrl: podcast.listennotes_url,
            podTime: podcast.audio_length_sec,
            podAudio: podcast.audio,

          })
          // Returns all data in each podcast response
          return podcast;
        })

        // Use podData to display podcast information on the page
        this.setState({
          podData: newState,
          isLoadingPodcast: false,
        })
      }
    })
  }

  // onChange function, captures every key stroke in input fields related to Map
  handleMapChange = (e) => {
    this.setState({
      // Dynamically set state by capturing the name attribute in target JSX element
      [e.target.name]: e.target.value
    })
  }

  // onChange function, captures every key stroke in input fields related to Podcast
  handlePodcastChange = (e) => {
    this.setState({
      userEntry: e.target.value,
    }, () => {
    })
  }

  // Handles submit button
  handleSubmit = (e) => {
    e.preventDefault();
    // Captures starting address and destination, and compiles them into a string
    const from = `${this.state.fromStreet.trim()}, ${this.state.fromCity.trim()}, ${this.state.fromProvince}`
    const to = `${this.state.toStreet.trim()}, ${this.state.toCity.trim()}, ${this.state.toProvince}`

    this.setState({
      from: from,
      to: to,
      userInput: this.state.userEntry,
      isLoading: true,
      userEntry: '',
    })

    // Scroll to "Pick a mode of transportation" section
    setTimeout(() => {
      scroller.scrollTo('mapResults', { 
        offset: 150,
        smooth: true,
        duration: 500,
      });
    }, 500);
  }

// Scrolls to form from "Start" button
  scrollToForm = () => {
    scroller.scrollTo('formInfo', {
      smooth: true,
      duration: 700,
    });
  }

  // Scrolls to top of page from fixed arrow
  scrollToTop = () => {
    scroller.scrollTo('header', {
      smooth: true,
      duration: 700,
    });
  }

  // Importing components and vital information for app to run
  render(){
    return(
      <div>
        <header>
          <nav className="wrapper" id="header">
            <img className="logo" alt="Logo for Podcast Commuter"src={require('./assets/logo.png')}></img>
              <label htmlFor="toggle" className="hamburger"><span className="sr-only">Navigation menu</span><i className="fa fa-bars"></i></label>
              <label htmlFor="toggle" className="close"><span className="sr-only">Close menu</span><i className="fas fa-times"></i></label>
              <input type="checkbox" id="toggle" name="toggle" className="inputButton" />
              <ul className="mainNav">
                <li className="menu"><a href="#formInfo">Search</a></li>
                <li className="menu"><a href="#mapResults">Results</a></li>
                <li className="menu"><a href="#podcastResults">Recommendations</a></li>
                <li className="menu"><a href="#finalPodcast">Listen</a></li>
              </ul>
          </nav>
          <div className="headerContent wrapper">
            <div className="headerInfo">
              <h1>Podcast Commuter</h1>
              <h2 className="headerDescriptionMobile">Find podcasts that suit your length of commute</h2>
              <button onClick={this.scrollToForm}>Start</button>
            </div>
            <div className="headerImage">
              <img alt="Person walking through park listening to podcast" className="desktopImg" src={require('./assets/headerDeskop.svg')}></img>
              <img alt="Person walking listening to podcast" className="mobileImg" src={require('./assets/headerMobile.svg')}></img>
            </div>
          </div>
        </header>

        {/* Get user input */}
        <section className="wrapper mobileMap"> 
          <div className="formInfo" id='formInfo'>
            <h3>Let's find some podcasts.</h3>
            <p>Enter your starting and ending location, along with what type of podcast you’re in the mood for. We will calculate
            your commute time, and ask you to select your preferred mode of transportation. Based on the time of your trip,
            we will give you some podcast recommendations.</p>
          </div>
          <form action="" onSubmit={this.handleSubmit} className="mapForm">
            <div className="mapInput">
              <input className="address" type="text" id="fromStreet" name="fromStreet" placeholder="Starting address" value={this.state.fromStreet} onChange={this.handleMapChange} required />
              <input className="city" type="text" id="fromCity" name="fromCity" placeholder="Starting city" value={this.state.fromCity} onChange={this.handleMapChange} required />
              <select className="province" name="fromProvince" id="fromProvince" onChange={this.handleMapChange} required>
                <option value="">Prov</option>
                <option value="ON">ON</option>
                <option value="BC">BC</option>
                <option value="QC">QC</option>
                <option value="NS">NS</option>
                <option value="NB">NB</option>
                <option value="AB">AB</option>
                <option value="PE">PE</option>
                <option value="SK">SK</option>
                <option value="NL">NL</option>
                <option value="MB">MB</option>
                <option value="NT">NT</option>
                <option value="YT">YT</option>
                <option value="NU">NU</option>
              </select>
            </div>
            <div className="mapInput">
              <input className="address" type="text" id="toStreet" name="toStreet" placeholder="Destination address" value={this.state.toStreet} onChange={this.handleMapChange} required/>
              <input className="city" type="text" id="toCity" name="toCity" placeholder="Destination city" value={this.state.toCity} onChange={this.handleMapChange} required/>
              <select className="province" name="toProvince" id="toProvince" onChange={this.handleMapChange} required>
                <option value="">Prov</option>
                <option value="ON">ON</option>
                <option value="BC">BC</option>
                <option value="QC">QC</option>
                <option value="NS">NS</option>
                <option value="NB">NB</option>
                <option value="AB">AB</option>
                <option value="PE">PE</option>
                <option value="SK">SK</option>
                <option value="NL">NL</option>
                <option value="MB">MB</option>
                <option value="NT">NT</option>
                <option value="YT">YT</option>
                <option value="NU">NU</option>
              </select>
            </div>
            <div className="podcastSearch">
              <input
                type="text"
                placeholder='Search for a Podcast'
                onChange={this.handlePodcastChange}
                value={this.state.userEntry} required>
              </input>
            </div>
            <div>
              <button className="mapSubmitButton">Search</button>
            </div>
          </form>
        </section>
        {/* Needs to be fixed, left in our code to come back to! */}
        {/* {this.state.isLoading ? <Preloader /> : null} */}
        
        <Map 
          grabCommuteTime={this.grabCommuteTime} 
          grabMapUrl={this.grabMapUrl}
          from={this.state.from} 
          to={this.state.to}
          routeSelected={this.routeSelected}
          isLoadingPodcast={this.state.isLoadingPodcast}
          grabLoading = {this.grabLoading}
        />
        <Podcast 
          time={this.state.appTime} 
          userInput={this.state.userInput}
          podData={this.state.podData}
        />

        <footer>
        <nav className="wrapper" id="header">
            <img className="logo" alt="Logo for Podcast Commuter"src={require('./assets/logo.png')}></img>
            <ul className="mainNav">
              <li>
              <p href="#formInfo">Julia</p>
              <div className="contactUs">
                <a href="https://www.linkedin.com/in/juliadufresne/"><i className="fab fa-linkedin"></i></a>
                <a href="https://github.com/juliadufresne"><i className="fab fa-github-square"></i></a>
              </div>
              </li>

              <li>
              <p href="#mapResults">Ken</p>
              <div className="contactUs">
                <a href="https://www.linkedin.com/in/ken-taylor-a433221a1/"><i className="fab fa-linkedin"></i></a>
                <a href="https://github.com/kentaylor92"><i className="fab fa-github-square"></i></a>
              </div>
              </li>
              
              <li>
              <p href="#podcastResults">Brandon</p>
              <div className="contactUs">
                <a href="https://www.linkedin.com/in/brandonerictang/"><i className="fab fa-linkedin"></i></a>
                <a href="https://github.com/btangsup"><i className="fab fa-github-square"></i></a>
              </div>
              </li>

              <li>
              <p href="#finalPodcast">Alice</p>
              <div className="contactUs">
                <a href="https://www.linkedin.com/in/zhuyingsong-619212158/"><i className="fab fa-linkedin"></i></a>
                <a href="https://github.com/Aliceeeee825"><i className="fab fa-github-square"></i></a>
              </div>
              </li>
            </ul>
          </nav>
        </footer>
      </div>
    )
  }
}

export default App;


