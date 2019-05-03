import React from 'react'
import { Map, GoogleApiWrapper, Marker } from "google-maps-react";

const turin_coords = {
    lat: 45.06889,
    lng: 7.698155
}

const styles = {
    height: "100%",
}

//Workaround for styling unaccessible elements
const set_position = () => {
    const target = document.querySelector(".col-sm-12.map").children[0];
    target.style.height = "100%";
    target.style.position = "relative"; 
}

export class MapWrapper extends React.Component {
    constructor(props){
        super(props);

        this.marker_clicked = this.marker_clicked.bind(this);
    }

    marker_clicked(originalid, id){
        this.props.marker_clicked(originalid, id);
    }

    render(){
        const markers = (this.props.stops).map(el => {
            return (
                <Marker key={el.id} position={{lat: el.lat, lng: el.lng}} name={el.name} title={el.name} el={ {...el}} onClick={this.marker_clicked.bind(this, el.originalid, el.id)}/>
            )
        })


        return (
            <Map 
            google={this.props.google}
            initialCenter={turin_coords}
            style={styles}
            zoom={16}
            showControls={false}
            onReady={set_position}
            >
            {markers}
            </Map>
        )
    }
}

export default GoogleApiWrapper({apiKey: "AIzaSyBN3JPSLmhARBsi_ld4qIV-9GfR2nyFl6g",className: "hello"})(MapWrapper);