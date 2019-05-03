const {query, get_all} = require("./query");
const {crud} = require("./crud");

const lines = (lines) => {
    let query_string = 'INSERT INTO _lines (name, longName) VALUES ';
    lines = lines.map(el => ({name: el.name, longName: el.longName}));
    //For every tuple insert a row
    return crud("_lines", "INSERT", lines);
}

const stops = (stops) => {
    stops = stops.map(el => ({originalid: el.id, lat: el.lat, lng: el.lng, location: el.location, name: el.name, _lines: el.lines, placeName: el.placeName, type: el.type}))
    return crud("stops","INSERT", stops)
}

const line2stop = () => {
    let tuples = [];
    let lines = null;
    let stops = null;

    Promise.all([get_all("_lines"), get_all("stops")])
    .then(arr => {
        lines = [...arr[0]];
        stops = [...arr[1]];
        stops.forEach( (stop, st_index )=> {
            const passing_lines = stop._lines.split(",");
            passing_lines.forEach( (passing_line, pass_index )=> {
                const found = lines.find(line => line.name === passing_line);
                if(found){
                    tuples = [...tuples, {lineID: found.id, stopID: stop.id}];
                }
            })
        })      
        return crud("lineid2stopid","INSERT", tuples);
    })
    .catch(console.log);
    return Promise.resolve();
}

const cleanup = () => {
    return query("ALTER TABLE stops DROP IF EXISTS _lines;");
}

const get_bay_info = (id) => {
    return query("SELECT l.name, l.longName FROM _lines as l INNER JOIN lineid2stopid as l2s ON l.id = l2s.lineID WHERE stopID = '" + id + "';");
}

module.exports = {populate: {lines, stops, line2stop, cleanup}, interact: {get_bay_info}};

