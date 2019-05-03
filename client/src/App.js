import React from 'react';
import './App.css';
import Header from './components/header';
import MapContainer from './components/map';
import Login from './components/login';
import Overlay from './components/overlay';
import BayDetails from './components/bay_details';

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      user: {logged_in: false},
      loading: false,
      stops: [],
      modal: ""
    }

    this.alert = this.alert.bind(this);
    this.close_modal = this.close_modal.bind(this);
    this.fetch_bay_arrivals = this.fetch_bay_arrivals.bind(this);
    this.fetch_stops = this.fetch_stops.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.marker_clicked = this.marker_clicked.bind(this);
    this.sign_up = this.sign_up.bind(this);
    this.set_modal = this.set_modal.bind(this);
  }

  componentDidMount(){
    if(sessionStorage.getItem("Auth")) {
      this.setState({user: {...this.state.user, logged_in: true}})
      this.fetch_stops();
    }
  }

  alert(msg) {
    alert(msg)
  }

  close_modal(){
    this.setState({
      modal: ""
    })
  }

  fetch_bay_arrivals(originalid, id){
    const headers = new Headers({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Auth": sessionStorage.getItem("Auth")
    });
    let body = JSON.stringify({originalid, id});
    const options = {
      method: "POST",
      headers,
      body
    }
    return fetch("/api/stop", {...options})
  }

  fetch_stops(){
    let retry = 3;
    const get_stops = () => {
      //If no more trials are available
      if(retry === 0 ) {
        this.alert("Request failed multiple times, the source might be offline.");
        return;
      }
      retry--;

      if(sessionStorage.getItem("Auth")) {
          const headers = new Headers({
            "Auth": sessionStorage.getItem("Auth"),
            "Content-Type": "application/json",
            "Accept": "application/json"
          });
          const options = {
            method: "POST",
            headers
          }
          return fetch("/api/stop/all", {...options})
          .then(res => res.json())
          .then(res => {
            if(!res.ok) throw res;
            this.setState({stops: res.stops});
          })
          .catch(err => {
            return get_stops()
            .catch(console.log)
          })

      } else {
        this.logout();
      }      
    }
    get_stops();
  }

  login(formdata) {
    const options = {
      method: "POST",
      body: formdata
    };
    fetch("/api/user/login", {
      ...options
    })
    .then(res => res.json())
    .then(res => {
      if(!res.ok) throw res;
      sessionStorage.setItem("Auth", res.token);
      this.setState({
        user: {...this.state.user, logged_in: true}
      })
    })
    .catch(({msg}) => {
      this.alert(msg);
    });
  }

  logout() {
    this.setState({
      user: {...this.state.user, logged_in: false}
    });
    sessionStorage.removeItem("Auth");
  }

  marker_clicked(originalid, id){
    this.fetch_bay_arrivals(originalid, id).then(res => res.json())
    .then(res => {
        this.setState({
        modal: <BayDetails lines={res.lines || []} arrivals={res.arrivals || []} close={this.close_modal}/>
      })
    });
    
  }

  set_modal(modal){
    this.setState({modal})
  }

  sign_up(formdata) {
    const options = {
      method: "POST",
      body: formdata
    };
    fetch("/api/user/create", {
      ...options
    })
    .then(res => res.json())
    .then(res => {
      sessionStorage.setItem("Auth", res.token);
      this.setState({
        user: {...this.state.user, logged_in: true}
      });
      this.fetch_stops();
    })
    .catch(({msg}) => {
      this.alert(msg);
    });
  }

  render(){
    return (
      <div className="App container-fluid">
        <Header is_logged_in={this.state.user.logged_in} logout={this.logout} />
        <div className="col-sm-12 h-100 map" >
        {this.state.user.logged_in &&
        <MapContainer style={{position: "relative"}} stops={this.state.stops} marker_clicked={this.marker_clicked}/> }
        </div>
        {!this.state.user.logged_in &&
        <Login sign_up={this.sign_up} login={this.login}/> }
        <Overlay display={this.state.modal}>{this.state.modal}</Overlay>
      </div>
    );
  }
}

export default App;
