import React, { Component } from 'react';
import Header from './Header';
import { WEATHERGOVSTATIONS, WEATHERGOVPOINTS } from '../utils';
import '../styles/HomeStyles.css';

//our giant unrefactored component containing everything
class Home extends Component {

//our state, airports is what is stored in localstorage and rendered in table,
//search term is used to trigger a new fetch for our weather api,
//and our error message checks for bad search input

  constructor(props) {
      super(props);
      this.state = {
        airports: [],
        searchTerm: '',
        errorMessage: ''
      }

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    //used by our search input bar
    handleChange(event) {
       const target = event.target;
       const value = target.value;
       this.setState({searchTerm: value});
     }

     //this is really only used to enable refresh new info in our table. airport codes are stored in localstorage.
     //Each code still in localstorage is used to populate table.

     componentDidMount(){
       const ourCodes = window.localStorage.getItem('airportCodes').split(",");;
       console.log("our codes: ");
       console.log(ourCodes);

       if(ourCodes !== null) {
         var arrayLength = ourCodes.length;
         for (var i = 0; i < arrayLength; i++) {
            this.populateAirportRequest(ourCodes[i]);
         }
       }
     }

     //storing airport codes in our localstorage to enable refresh capability
     storeInLocalStorage(){
       const airportsArrayToIterateThrough = this.state.airports;

       const ourCodes = [];

       var i = airportsArrayToIterateThrough.length;
        while (i--) {
            ourCodes.push(airportsArrayToIterateThrough[i].code);
        }

        // console.log(JSON.stringify(ourCodes));
        window.localStorage.setItem('airportCodes', ourCodes);
     }

     //remove date from table and then we resave state airports in localstorage
     removeFromTable(code){
       const airportsArrayToManipulate = this.state.airports;

       var i = airportsArrayToManipulate.length;
        while (i--) {
            if (airportsArrayToManipulate[i].code === code) {
                airportsArrayToManipulate.splice(i, 1);
            }
        }

       this.setState({
         airports: [...this.state.airports, airportsArrayToManipulate]
       });

       this.storeInLocalStorage();
     }

     //simple check on user input in search bar
     checkIfInputIsEmpty(){

       if(this.state.searchTerm.trim().length === 0){
         this.setState({errorMessage: 'Please input a valid US airport code such as KATL, KLAX, KORD, or KDFW'});
       } else {
         this.populateAirportRequest(this.state.searchTerm);
       }
     }

     //this method is used by our searchbar to trigger search logic
     async handleSubmit(event) {
        event.preventDefault();
        this.setState({errorMessage:''});

        this.checkIfInputIsEmpty();

        this.setState({searchTerm: ''});
      }

      //after all of our logic is completed to build a new airport object, we save it to state.
      saveAirportInfoToState(newAirplaneObject){
        this.setState({
          airports: [...this.state.airports, newAirplaneObject]
        });
        // console.log("Our Airports:");
        // console.log(this.state.airports);

        this.storeInLocalStorage();
      }

      //this method is used to render error on page
    checkIfSearchErrorPresent(){
      return this.state.errorMessage;
    }

    //this is our real method to trigger building an airport object which will eventually get rendered to table.
    //method takes an optional argument, as i realized late in the process i needed to do so
    //(called from just code from localstorage or user inputted search).

    async populateAirportRequest(optionalArg) {
      var ourSearchTerm;

      if(optionalArg === "undefined") {
         ourSearchTerm = this.state.searchTerm.toUpperCase();
      } else {
         ourSearchTerm = optionalArg;
      }

      var url = WEATHERGOVSTATIONS + ourSearchTerm;

      var myRequest = new Request(url);
      fetch(myRequest)
      .then((response) => {
        if(!response.ok){
          this.setState({errorMessage: 'The weather API returned a ' + response.status + ' response. Please try again with a modified search input such as KATL, KLAX, KORD, or KDFW'});
        } else {
          return response.json();
        }
      })
      .then(data => {
        // console.log("populateAirportRequest");

        //this is our airport object that gets passed around between a few javascript functions as multiple fetches are required.
        var airport = {
          latLong: '',
          forecastEndpoint: '',
          forecastGridData: '',
          code: '',
          name: '',
          localTime: '',
          currentWeather: '',
          temperature: '',
          relativeHumidity: '',
          windDirection: '',
          windSpeed: ''
        };

      airport.latLong = data.geometry.coordinates;
      airport.code = data.properties.stationIdentifier;
      airport.name = data.properties.name;
      airport.localTime =  data.properties.timeZone;
      airport.currentWeather =  data.properties.forecast;

      this.populateWeatherForecastUrl(airport);

      }).catch(function(error) {
        console.log(error);
    });

    }

    //an additional API call is requried to get specific weather information
    async populateWeatherForecastUrl(airplaneObject) {
      var ourString = airplaneObject.latLong[1] + ',' + airplaneObject.latLong[0];
      var url = WEATHERGOVPOINTS + ourString;
      // console.log(ourString);
      var myRequest = new Request(url);
      fetch(myRequest)
      .then((response) => {
        if(!response.ok){
          this.setState({errorMessage: 'The weather API returned a ' + response.status + ' response. Please try again with a modified search input such as KATL, KLAX, KORD, or KDFW'});
        } else {
          return response.json();
        }
      })
      .then(data => {

        // console.log("populateWeatherForecaseUrl");

        airplaneObject.forecastEndpoint = data.properties.forecast;
        airplaneObject.forecastGridData = data.properties.forecastGridData;
        this.populateWeatherData(airplaneObject);

      }).catch(function(error) {
        console.log(error);
    });
    }

    //an additional API call is requried to get specific weather information
    async populateWeatherData(airplaneObject) {

      var url = airplaneObject.forecastEndpoint;
      // console.log("url: " + url);

      var myRequest = new Request(url);
      fetch(myRequest)
      .then((response) => {
        if(!response.ok){
          this.setState({errorMessage: 'The weather API returned a ' + response.status + ' response. Please try again with a modified search input such as KATL, KLAX, KORD, or KDFW'});
        } else {
          return response.json();
        }
      })
      .then(data => {

        // console.log("populateWeatherData");
        // console.log(data);

        airplaneObject.currentWeather = data.properties.periods[0].shortForecast;
        airplaneObject.temperature = data.properties.periods[0].temperature;
        airplaneObject.windDirection = data.properties.periods[0].windDirection;
        airplaneObject.windSpeed = data.properties.periods[0].windSpeed;

        // console.log("Current airplane");
        // console.log(JSON.stringify(airplaneObject));

        this.populateRelativeHumidity(airplaneObject);

      }).catch(function(error) {
        console.log(error);
    });
    }

    //an additional API call is requried to get specific weather information
    async populateRelativeHumidity(airplaneObject) {

      var url = airplaneObject.forecastGridData;
      // console.log("url: " + url);

      var myRequest = new Request(url);
      fetch(myRequest)
      .then((response) => {
        if(!response.ok){
          this.setState({errorMessage: 'The weather API returned a ' + response.status + ' response. Please try again with a modified search input such as KATL, KLAX, KORD, or KDFW'});
        } else {
          return response.json();
        }
      })
      .then(data => {

        // console.log("populateWeatherData");
        // console.log(data);

        airplaneObject.relativeHumidity = data.properties.relativeHumidity.values[0].value + '%';

        // console.log("Current airplane");
        // console.log(JSON.stringify(airplaneObject));

        this.saveAirportInfoToState(airplaneObject);
      }).catch(function(error) {
        console.log(error);
    });
    }

//rendering table headers
  renderTableHeader() {
    const airportKeys = [
      "Delete",
      "Name",
      "Local Time",
      "Current Weather",
      "Temperature",
      "Relative Humidity",
      "Wind Direction",
      "Wind Speed"
    ];

     let header = (airportKeys);
     return header.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>
     })
  }

//rendering table data and cells
  renderTableData(){
    return this.state.airports.map((airport, index) => {
      const {
        name,
        code,
        localTime,
        currentWeather,
        temperature,
        relativeHumidity,
        windDirection,
        windSpeed
      } = airport
      return (
        <tr key={index}>
          <td className="errorCity" onClick={() => this.removeFromTable(code)}>{code}</td>
          <td>{name}</td>
          <td>{localTime}</td>
          <td>{currentWeather}</td>
          <td>{temperature}</td>
          <td>{relativeHumidity}</td>
          <td>{windDirection}</td>
          <td>{windSpeed}</td>
        </tr>
      )
    })
  }
//our render method
  render(){
    return (
      <div>
      <Header />
      <div className="centerIt">
      <form onSubmit={this.handleSubmit}>
        Search for an airport by code:
          <input type="text" name="searchTerm" id="searchTerm" placeholder="e.g. KJFK" value={this.state.searchTerm}
          onChange={this.handleChange}
          />
          <input type="submit" value="Submit" />
          <button onClick={(e) => window.location.reload()}>Refresh</button>

       </form>
     </div>
       <p className="errorCity">{this.checkIfSearchErrorPresent()}</p>
       <div>
         <h1 id='title'>United States Airport Data Table</h1>
         <table id='airplanes'>
             <tbody>
               <tr>{this.renderTableHeader()}</tr>
                {this.renderTableData()}
             </tbody>
        </table>
      </div>
      </div>
    );
  }
}

export default Home;
