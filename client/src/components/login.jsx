import React, {useState} from 'react';
import "./css/login.css";

export default function Login(props) {
    const [mode, set_mode] = useState("login");

    const login = (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);
        props.login(formdata);
    }

    const sign_up = (e) => {
        e.preventDefault();
        const formdata = new FormData(e.target);
        props.sign_up(formdata);
    }

    const switch_mode = (e) => {
        e.preventDefault();
        if(mode === "login") {
            set_mode("sign_up");
        } else if (mode === "sign_up") {
            set_mode("login");
        }
        return false;
    }

    return (
        <div className="login_container d-flex flex-row position-relative justify-content-center align-items-center">
            <div className="login_overlay">
                <div className="image_holder d-flex justify-content-center">
                    <img src={require("../assets/images/user.svg")} alt="User"/>
                </div>
                <h1 className="h4 text-center">{`${mode === "login"? "Login" : "Crea account" }`}</h1>
                <form action="/" encType="multipart/form-data" onSubmit={mode === "login" ? login : sign_up }>
                    <label htmlFor="email" id="label_for_email" className="d-block">Email
                        <input type="email" name="email" id="email" aria-labelledby="label_for_email" className="form-control"/>
                    </label>
                    <label htmlFor="password" id="label_for_password" className="d-block">Password
                        <input type="password" name="password" id="password" aria-labelledby="label_for_password" className="form-control"/>
                    </label>
                    <button type="submit" className={`${mode === "login"? "btn-primary" : "btn-info" } btn ml-auto mr-auto d-block mt-5`}>{mode === "login" ? "Login" : "Invia"}</button>
                </form>
                <a href="/" className="d-flex justify-content-center" onClick={switch_mode}>{mode === "login" ? "Voglio creare un account." : "Ho già un account"}</a>
            </div>
        </div>
    )
}