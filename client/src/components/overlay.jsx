import React from 'react'
import "./css/overlay.css";

export default function Overlay(props) {
    if(props.display) {
        return (
            <div className="overlay h-100 w-100 d-flex justify-content-center align-items-center position-absolute">
                {props.children}
            </div>
        )
    } else {
        return "";
    }
}