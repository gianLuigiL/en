const {query} = require("./query");

/**
 * Create a string of the type \`column_name` = value, to be used in queries.
 * @param {object} tuple 
 */

const get_column_values = (tuple, delimiter = ",") => {
    let column_values = " ";
    for(const [key, value] of Object.entries(tuple)) {
        
        column_values += " `" + key + "` = '" + value + "' " + delimiter; 
    }
    //Get rid of the last comma and return 
    return column_values = column_values.slice(0, column_values.length - delimiter.length);
}

const crud = (table, operation, tuple = {}, clause = "*") => {
    let columns;
    let column_values;
    let values;
    let conditions;

    //Create conditions
    if(typeof clause === "object") {
        conditions = get_column_values(clause, "AND");
    } else {
        conditions = " *";
    }

    //If we're inserting multiple tuples
    if(Array.isArray(tuple)) {
        columns = Object.keys(tuple[0]).map(el => "`" + el + "`").join(",");
        values = tuple.reduce( (a,b) => a + ` (${Object.values(b).map(el => "'" + el + "'").join(",")}),\n`, "" );
        values = values.slice(0, values.length - 2);

        switch(operation.toUpperCase()) {
            case "INSERT": {
                return query(`INSERT INTO ${table} (${columns}) VALUES ${values};`);
            }
        }
    }

    //Else run single row queries
    //Create a string of columns for the query
    columns = Object.keys(tuple).map(el => "`" + el + "`").join(",");
    //Create a string of values for the query
    values = Object.values(tuple).map(el => "'" + el + "'").join(",\n");
    //Create a string of column_name = column_value
    column_values = get_column_values(tuple);

    switch(operation.toUpperCase()) {
        case "SELECT": {
            if(conditions === " *") {
                return query(`SELECT * FROM ${table};`)
            } else {
                return query(`SELECT ${columns} FROM ${table} WHERE ${conditions};`)
            }
            break;
        }
        case "INSERT": {
            return query(`INSERT INTO ${table} (${columns}) VALUES (${values});`);
        }
        case "UPDATE": {
            if(conditions === "*") {
                return query(`UPDATE ${table} SET ${column_values};`)
            } else {
                return query(`UPDATE ${table} SET ${column_values} WHERE ${conditions};`)
            }
        }
        case "DELETE": {
            if(conditions === "*") {
                return query(`TRUNCATE TABLE ${table};`);
            } else {
                return query(`DELETE FROM ${table} WHERE ${conditions};`)
            }
        }
        case "INSERT": {
            return query(`INSERT INTO ${table} (${columns}) VALUES ${values};`)
        }
    }
}

module.exports = {crud};