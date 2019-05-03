const fetch = require("node-fetch");
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();


const stops_url = `http://www.5t.torino.it/ws2.1/rest/stops/all`;
const lines_url = `http://www.5t.torino.it/ws2.1/rest/lines/all`;

const escape_parentheses = (str) => str.replace(/\)/, (match) => "\)");

const get_stops = () => {
    return fetch(stops_url)
    .then(res => res.json())
    .then( ({stops}) => {
        //Normalize data to a workable degree
        stops = stops.map(el => {
            el.lat = +el.lat;
            el.lng = +el.lng;
            el.lines = el.lines.split(",");
            el.name = escape_parentheses(entities.encode(el.name));
            el.placeName = escape_parentheses(entities.encode(el.placeName));
            el.location = escape_parentheses(entities.encode(el.location));
            el.type = entities.encode(el.type);
            return el;
        });
        return Promise.resolve(stops);
    })
    .catch(err => {
        console.log(err);
        Promise.reject(err);
    });
};


const get_lines = () => {
    return fetch(lines_url)
    .then(res => res.json())
    .then(lines => {
        lines = lines.map(el => {
            el.name = escape_parentheses(entities.encode(el.name));
            el.longName = escape_parentheses(entities.encode(el.longName));
            el.azienda = escape_parentheses(entities.encode(el.azienda));
            return el;
        })
        return Promise.resolve(lines);

    })
    .catch(err => {
        console.log(err);
        Promise.reject(err);
    });
}

const get_bay_arrivals = (id) => {
    return fetch(`http://www.5t.torino.it/ws2.1/rest/stops/${id}/departures`)
            .then(res => {
                let response;
                try {
                    response = res.json()
                } catch (error) {
                    response = [];
                }
                return response;
            })
            .then(arrivals => {
                let sorted_arrivals = [];
                arrivals.forEach(line => {
                    if(!line.departures) {
                        return sorted_arrivals;
                    }
                    line.departures.forEach(departure => {
                        const mapped = {...departure, name: line.name, longName: line.longName};
                        sorted_arrivals = [...sorted_arrivals, mapped];
                    })
                })
                return sorted_arrivals.sort( (a,b) => {
                    if(a < b) return -1;
                    if(a > b) return 1;
                    else return 0;
                    } )
            })
            .catch(err => {
                //Too many errors from the api maybe log later
                //console.log(`An error occured while retrieving details for the stops with id ${id}.`);
                return fetch(`https://gpa.madbob.org/query.php?stop=${id}`)
                        .then(res => res.json())
                        //Send an array so that at least it doesn't crash
                        .catch(err => []);
            });
}

const get_data = () => {
    return Promise.all([
        get_lines(),
        get_stops()
    ])
    .then(arr => {
        return Promise.resolve({lines: arr[0], stops: arr[1]});
    })
    .catch(err => Promise.reject(err));
}

module.exports = {get_data, get_lines, get_stops, get_bay_arrivals};

