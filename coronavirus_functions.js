export { fetchData, formatCursor, addMapFeatures }

//fetches json data from json files
async function fetchData(data) {
    let fetchedData = await fetch(data);
    let json = await fetchedData.json();
    let features = json.features;
    return features
}


//function that formats the cursor when hovering over a marker
function formatCursor(cursor, map) {
    event.preventDefault();
    map.getCanvas().style.cursor = cursor;
    event.stopPropagation();
}


function addBoroughsOutline(map, id, boroughPolygons, lineWidth) {
    map.addLayer({
        'id': id,
        'type': 'line',
        'source': {
            'type': 'geojson',
            'data': {
                "type": "FeatureCollection",
                "features": boroughPolygons
            }
        },
        'paint': {
            'line-color': '#000',
            'line-width': lineWidth
        }
    });
}


function getInformation(currentBorough, coronaData){
    for(let i=0; i<coronaData.length; i++){
        let borough = coronaData[i]["Borough"]
        let weeklyCases = coronaData[i]["Cases per 100,000 in Past Week"];
        if(currentBorough[0].properties["NAME"] === borough){
            document.getElementById("information").innerHTML = "Borough: " + borough + 
            "<br>Weekly Cases per 100,000: " + weeklyCases
        }
    }
}

function selectBorough(map, coronaData, id){
    map.on('click', id, function(e){
        let currentBorough = e.features;
        
        if (!map.getLayer('current-borough')) {
            addBoroughsOutline(map, 'current-borough', currentBorough, 7);
        }
        else {
            let currentBoroughData = {
                "type": "FeatureCollection",
                "features": currentBorough
            }
            map.getSource('current-borough').setData(currentBoroughData)
        }
       getInformation(currentBorough, coronaData); 
    });
};

//LARGE_VALUE is anything greater than the MEDIUM_VALUE
const CASES_PROPORTION_COLORS = {
    "MIN_VALUE": 9,
    "MIN_COLOR": "#ffe6e6",
    "SMALL_VALUE": 18,
    "SMALL_COLOR": "#ff8080",
    "MEDIUM_VALUE": 27,
    "MEDIUM_COLOR": "#ff1a1a",
    "LARGE_COLOR": "#8b0000"
}

const WEEKLY_COLORS = {
    "MIN_VALUE": 30,
    "MIN_COLOR": "#f2ecf9",
    "SMALL_VALUE": 60,
    "SMALL_COLOR": "#bf9fdf",
    "MEDIUM_VALUE": 90,
    "MEDIUM_COLOR": "#8c53c6",
    "LARGE_COLOR": "#592d86"
}

/**
 * 
 * @param {*Object[]} 
 * @param {*Object} 
 * @param {*Object} 
 */
function calculateCountyColors(coronaData, colorObject, data) {
    
    let boroughColors = [];
    let color;

    for(let i=0; i<coronaData.length; i++){
        let borough = coronaData[i]["Borough"];
        let objectData = coronaData[i][data];
        if(objectData < colorObject["MIN_VALUE"]){
            color = colorObject["MIN_COLOR"];
        }
        else if(objectData >= colorObject["MIN_VALUE"] && objectData < colorObject["SMALL_VALUE"]){
            color = colorObject["SMALL_COLOR"];
        }
        else if(objectData >= colorObject["SMALL_VALUE"] && objectData < colorObject["MEDIUM_VALUE"]){
            color = colorObject["MEDIUM_COLOR"];
        }
        else {
            color = colorObject["LARGE_COLOR"];
        }
        boroughColors.push(borough, color);
    }
    boroughColors.push("#000");
    return boroughColors;
}

function addChoroplethLayer(map, id, boroughPolygons, expression) {
    map.addLayer({
        "id": id,
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": boroughPolygons
            }
        },
        "layout": {},
        "paint": {
            "fill-color": expression,
            "fill-opacity": 0.6
        }
    });
}



function addMapFeatures(map) {
    map.dragRotate.disable(); // Disable map rotation using right click + drag.
    map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

    // Add navigation control (excluding compass button) to the map.
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false
    }));

    map.on('mouseenter', 'boroughs', function(e){
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'boroughs', function(e){
        map.getCanvas().style.cursor = '';
    });
   




    map.on('load', async function () {
        //Fetches the polygons of all the London Boroughs. 
        let boroughPolygons = await fetchData('london_boroughs.json');
        let coronaData = await fetchData('london_corona_31_Aug.json')

        
        

        // expression gives the colours for the map based on its value
        let expression = ['match', ['get', 'NAME']];
        const CASES_EXPRESSION = expression.concat(calculateCountyColors(coronaData, CASES_PROPORTION_COLORS, "Cases per 100,000 in Past Week"));
        addChoroplethLayer(map, 'cases-per-100,000', boroughPolygons, CASES_EXPRESSION);
        selectBorough(map, coronaData, 'cases-per-100,000')

        const WEEKLY_EXPRESSION = expression.concat(calculateCountyColors(coronaData, WEEKLY_COLORS, "Cases in Last Week"));
        addChoroplethLayer(map, 'weekly-cases', boroughPolygons, WEEKLY_EXPRESSION);
        selectBorough(map, coronaData, 'weekly-cases')

        addBoroughsOutline(map, 'boroughs-outline', boroughPolygons, 3); 
        
    });

}
