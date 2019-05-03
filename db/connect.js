var mysql = require('mysql');

const connect = async () => {
    let db = null;
    if(!db) {
        db  = mysql.createPool({
        connectionLimit : 10,
        host            : 'localhost',
        user            : 'root',
        password        : '',
        database        : 'moveto'
        });
        return db;
    } else {
        return db;
    }
};

module.exports = {connect};