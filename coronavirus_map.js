import { addMapFeatures } from "./coronavirus_functions.js"


const API_KEY = "H1xjzAwzi4GGgXdlszV4nMri4CXd1Gmw"

let vectorUrl = 'https://api.os.uk/maps/vector/v1/vts';

// Initialize the map object.
let map = new mapboxgl.Map({
    container: 'map',
    minZoom: 8,
    maxZoom: 17,
    style: vectorUrl + '/resources/styles?key=' + API_KEY,
    center: [-0.1318827, 51.5158643],
    zoom: 9,
    transformRequest: url => {
        if (! /[?&]key=/.test(url)) url += '?key=' + API_KEY
        return {
            url: url + '&srs=3857'
        }
    }
});


addMapFeatures(map)