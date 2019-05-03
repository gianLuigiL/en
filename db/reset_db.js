const {connect} = require("./connect");
const {query} = require("./query");
const {populate} = require("./populate_db");
const {get_data} = require("../utils/gtt_api.js");


const reset = () => {
    return connect().then(connection => {
        return query("DROP TABLE IF EXISTS `users`")
        .then(results => query("DROP TABLE IF EXISTS `lineid2stopid`"))
        .then(results => query("DROP TABLE IF EXISTS `stops`"))
        .then(results => query("DROP TABLE IF EXISTS `_lines`"))
        .then(results => query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT(10) NOT NULL AUTO_INCREMENT,
            username VARCHAR(255),
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            last_position VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB AUTO_INCREMENT=1`))
        .then(results => query(`
        CREATE TABLE IF NOT EXISTS stops (
            id INT(10) NOT NULL AUTO_INCREMENT,
            originalid VARCHAR(255) NOT NULL,
            lat DOUBLE(13,10),
            lng DOUBLE(13,10),
            location VARCHAR(255) NOT NULL,
            _lines VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            placeName VARCHAR(255) NOT NULL,
            type VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB AUTO_INCREMENT=1`))
        //The following line is separated because lines is also a reserved word
        .then(results => query(
        "CREATE TABLE IF NOT EXISTS `_lines` (" +
           `id INT(10) NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            longName VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB AUTO_INCREMENT=1`))
        .then(results => query(`
        CREATE TABLE IF NOT EXISTS lineid2stopid (
            lineID INT(10) NOT NULL,
            stopID INT(10) NOT NULL,
            CONSTRAINT l2sfkline FOREIGN KEY (lineID) REFERENCES _lines (id) ON DELETE CASCADE,
            CONSTRAINT l2sfkstop FOREIGN KEY (stopID) REFERENCES stops (id) ON DELETE CASCADE
        ) ENGINE=InnoDB`))
        .then(results => get_data())
        .then(data => {
            const stops = data.stops;
            return populate.stops(stops)
                    .then(results => data)
        })
        .then(data => {
            const lines = data.lines;
            return populate.lines(lines)
                    .then(results => data)
        })        
        .then(results => populate.line2stop())
        .then(results => populate.cleanup())
        .then(results => Promise.resolve(true))
        .catch(err => Promise.reject(err));
    });
}

module.exports = {reset};