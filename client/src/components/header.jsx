import React from 'react';
import "./css/header.css";

export default function Footer(props) {

    if(props.is_logged_in) {
        return(
            props.is_logged_in &&
            <header className="navbar navbar-exapnd-sm">
                <a href="/" className="navbar-brand"><img src={require("../assets/images/logo.svg")} alt="Logo MoveTO"/></a>
                <div className="command ml-auto text-right">
                    <button className="btn btn-primary" onClick={props.logout}>
                        Logout
                    </button>
                </div>
            </header> 
        )
    } else {
        return "";
    }
}