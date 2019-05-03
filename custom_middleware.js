require("dotenv").config();
const jwt = require("jsonwebtoken");

const logged_in = (req, res, next) => {
    const auth_header = req.headers.auth;
    if(auth_header) {
        const options = {expiresIn: "1d"};
        try {                
            const decoded = jwt.verify(auth_header, process.env.SECRET, options);
            req.decoded = decoded;
        } catch (err) {
            console.log("Unable to decode token");
            res.status(500).send({ok: false, error: true, msg: "An error occured during authorization.", err});
            return;
        }
        next();
    } else {
        res.status(401).send({ok: false, error: true, msg: "Unauthorized."})
    }
}

module.exports = {logged_in};