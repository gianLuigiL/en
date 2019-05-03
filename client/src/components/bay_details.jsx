import React from 'react';
import "./css/baydetails.css";

export default function BayDetails(props) {
    const lines = props.lines.sort( (a,b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    } ).map(el => {
        return (
            <div className="line">
                <span className="line_name badge badge-info">{el.name} </span>
                <span> - {el.longName}</span>
            </div>
        )
    });

    const arrivals = props.arrivals
    .sort( (a,b) => {
        if(a.time < b.time) return -1;
        if(a.time > b.time) return 1;
        return 0;
    } )
    .map(el => {
        return (
            <div className="arrival">
                <span className="line_name badge badge-info">{el.name}</span>
                <span> - {el.time}</span>
            </div>
        )
    })
    return (
        <div className=" bay_details position-relative rounded">
            <div className="col-sm-12 pt-3 pb-3">
                <span className="close" onClick={props.close}>&times;</span>
                {(props.arrivals.length && <h2 className="h6">Prossimi arrivi</h2>) || ""}
                {!props.arrivals.length && <h2 className="h6">Non ho info sui prossimi arrivi...</h2>}
                {arrivals.length ? arrivals : ""}
                <hr/>
                {(props.lines.length && <h2 className="h6">Tutte le linee di questa fermata</h2>) || ""}
                {!props.lines.length && <h2 className="h6">Non ho info sulle linee che si fermano a questo stop...</h2>}
                {lines.length ? lines : ""}
            </div>
        </div>
    )
}