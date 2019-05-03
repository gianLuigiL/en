const {connect} = require("./connect");

const query = (query_string, args) => {
    return new Promise((resolve, reject) => {
        connect().then(connection => {
            connection.query(query_string, args, (err, results) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            })
        })
    })
}

const get_all = (table_name) => {
    return query(`SELECT * FROM ${table_name}`);
}


module.exports = {query, get_all};
