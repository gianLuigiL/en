require("dotenv").config();

//Express and middleware
const express = require("express");
const body_parser = require("body-parser");
const compression = require("compression");
const {logged_in} = require("./custom_middleware");
const multer = require("multer");
const path = require("path");
const app = express();
//Multer middleware for form data
const formdata = multer();
//Configuration
const {config} = require("./config");
const environment = process.env.NODE_ENV;
const port = config[environment].port;
//Utilities
const {crud} = require("./db/crud");
const {reset} = require("./db/reset_db");
const { interact: {get_bay_info} } = require("./db/populate_db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {get_bay_arrivals} = require("./utils/gtt_api");

//Apply middleware
app.use(compression());  //Compress data
app.use(body_parser.json());  //Parse body of requests
app.use(body_parser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'client/build')));  //Serve client build

//Reset database then listen
reset().then(results => {
    app.listen(port, () => {
        console.log(`Database has been reset and app is listening on port. ${port}` );
    })
})

app.post("/api/stop/",logged_in, (req,res) => {
    const {id, originalid} = req.body;
    get_bay_arrivals(originalid).then(arrivals => {
        get_bay_info(id).then(lines => {
            res.status(200).send({ok: true, error: false, msg: "OK", arrivals, lines});
        })
        .catch(err => {
            res.status(200).send({ok: true, error: false, msg: "OK",arrivals, lines: [] ,err});
        });
    })
    .catch(err => {
        get_bay_info(id).then(lines => {
            res.status(200).send({ok: true, error: false, msg: "OK", arrivals: [], lines});
        })
        .catch(err => {
            res.status(500).send({ok: false, error: true, msg: "An error occured while fetching lines for this bay.", err})
        });
    });
});

app.post("/api/stop/all", logged_in,(req, res) => {
    crud("stops", "SELECT", {}, "*")
    .then(stops => res.status(200).send({ok: true, error: false, msg: "OK", stops}))
    .catch(err => {
        res.status(500).send({ok: false, error: true, msg: "An error occured while trying to retrieve all stops"});
    })
})


app.post("/api/user/create", formdata.none(), (req, res) => {
    let {email, password} = req.body;

    const valid_email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i.test(email);
    if(!valid_email) {
        res.status(400).send({ok: false, error: true, msg: "L'email non è valida."});
    }
    bcrypt.hash(password, 10, (err, encrypted) => {
        if(err) {
            console.log("Unable to encrypt user password");
            res.status(500).send({ok: false, error: true, msg: "È successo un errore.."})
        }
        const user = {email, password: encrypted};
        crud("users", "insert", user)
        .then(results => {
            const payload = {user: email};
            const options = {expiresIn: "1d"};
            const secret = process.env.SECRET;
            const token = jwt.sign(payload, secret, options);
            res.status(201).send({ok: true, error: false, msg: `User with email ${email} created.`, token});
        })
        .catch(err => {
            res.status(500).send({ok: false, error: true, msg: "Prova con credenziali diverse.", err})
        })
    })
})

app.post("/api/user/login", formdata.none(), (req,res) => {
    let {email, password} = req.body;
    const valid_email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i.test(email);
    if(!valid_email) {
        res.status(400).send({ok: false, error: true, msg: "L'email non è valida."});
    }
    //Get the password associated with the email
    crud("users","select", {password}, {email})
    .then(  found => {
        bcrypt.compare(password, found[0].password)
        .then(match => {
            if(!match) {

                res.status(401).send({ok: false, error: true, msg: "Prova con una diversa mail o password."});
            } else {
                const payload = {user: email};
                const options = {expiresIn: "1d"};
                const secret = process.env.SECRET;
                const token = jwt.sign(payload, secret, options);
                res.status(200).send({ok: true, error: false, msg: "Correctly logged in.", token});
            }
        })
        .catch(err => res.status(500).send({ok: false, error: true, msg: "È successo un errore.", err}))
    })
    .catch(err => res.status(404).send({ok: false, error: true, msg: "Non c'è un account collegato a questa email."}))

})
