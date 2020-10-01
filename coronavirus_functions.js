export { fetchData, formatCursor, addMapFeatures }

//fetches json data from json files
async function fetchData(data) {
    let fetchedData = await fetch(data);
    let json = await fetchedData.json();
    let features = json.features;
    return features
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


function getInformation(currentBorough, coronaData, data, variable) {
    for (let i = 0; i < coronaData.length; i++) {
        let borough = coronaData[i]["Borough"]
        let weeklyCases = coronaData[i][data];
        if (currentBorough[0].properties["NAME"] === borough) {
            document.getElementById("information").innerHTML = "Borough: " + borough +
                "<br>" + variable + ": " + weeklyCases
        }
    }
}

async function getWeeks(currentBorough, data) {
    let weeks = ['week1.json', 'week2.json', 'week3.json', 'week4.json']
    for (let i=0; i<weeks.length; i++){
       weeks[i] = await fetchData(weeks[i]);
    }
    weeks = weeks.flat()
    let arr = [];
    for (let i = 0; i < weeks.length; i++) {
        let borough = weeks[i]["Borough"]
        let weeklyCases = weeks[i][data];
        if (currentBorough[0].properties["NAME"] === borough) {
            arr.push(weeklyCases);
        }
    }

    return arr;
}

const MAX_CHART_VALUES = {
    "cases-per-100000": 50,
    "weekly-cases": 200,
    "difference": 75,
    "total-cases": 2500
}

function setMaxValue(MAX_CHART_VALUES){
    let keys = Object.keys(MAX_CHART_VALUES)
    let maxValue = 100
    for(let i=0; i<keys.length; i++){
        let id = '#' + keys[i] + ':checked'
        if (document.querySelector(id) !== null){
            maxValue = MAX_CHART_VALUES[keys[i]]
        }
    }
      return maxValue;
}

const VARIABLES = {
    "cases-per-100000": "Cases per 100,000",
    "weekly-cases": "Weekly Cases",
    "difference": "Difference",
    "total-cases": "Total Cases"
}

function setVariables(VARIABLES){
    let keys = Object.keys(VARIABLES)
    let variable;
    for(let i=0; i<keys.length; i++){
        let id = '#' + keys[i] + ':checked'
        if (document.querySelector(id) !== null){
            variable = VARIABLES[keys[i]]
    }
}

 return variable
}

function newChart(ctx, VARIABLES, previousWeeks, MAX_CHART_VALUES) {
    let val = setMaxValue(MAX_CHART_VALUES);
    
    let chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [['Aug 31-', 'Sep 6'], ['Sep 7-', 'Sep 13'], ['Sep 14-', 'Sep 20'], ['Sep 21-', 'Sep 27']],
            datasets: [{
                label: setVariables(VARIABLES),
                data: previousWeeks,
                backgroundColor: '#bababa',
                borderColor: '#000',
                borderWidth: 1,
                barPercentage: 0.5
            }],
            responsive: true
        },
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: val
                    }
                }],
                xAxes: [{
                    barPercentage: 0.5,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 2
                    }
                }],
            }
        }
    });
    return chart
}


async function createChart(currentBorough, data, variable, MAX_CHART_VALUES) {
    let previousWeeks = await getWeeks(currentBorough, data);

    //add new div so charts don't overlap
    let node = document.createElement("canvas");
    node.setAttribute("id", "myChart");
    node.setAttribute("style", "display: block")
    document.getElementById("chart").appendChild(node);
    let ctx = document.getElementById('myChart').getContext('2d');
    
    let chart = newChart(ctx, variable, previousWeeks, MAX_CHART_VALUES);
    
    return chart
}


function selectBorough(map, coronaData, id, data, variable) {
    map.on('click', id, function (e) {
        let currentBorough = e.features;

        if (!map.getLayer('current-borough')) {
            addBoroughsOutline(map, 'current-borough', currentBorough, 5);
        }
        else {
            let currentBoroughData = {
                "type": "FeatureCollection",
                "features": currentBorough
            }
            map.getSource('current-borough').setData(currentBoroughData)
        }
        getInformation(currentBorough, coronaData, data, variable);

        //remove current canvas to avoid overlapping
        let chartDiv = document.getElementById("chart");
        let canvas = document.getElementById("myChart");
        chartDiv.removeChild(canvas);
        createChart(currentBorough, data, VARIABLES, MAX_CHART_VALUES);
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

const WEEKLY_DIFFERENCE_COLORS = {
    "MIN_VALUE": 0,
    "MIN_COLOR": "#00ab66",
    "SMALL_VALUE": 18,
    "SMALL_COLOR": "#FF0",
    "MEDIUM_VALUE": 35,
    "MEDIUM_COLOR": "#FFBF00",
    "LARGE_COLOR": "#F00"
}

const TOTAL_COLORS = {
    "MIN_VALUE": 900,
    "MIN_COLOR": "#fff2e6",
    "SMALL_VALUE": 1350,
    "SMALL_COLOR": "#ffb366",
    "MEDIUM_VALUE": 1800,
    "MEDIUM_COLOR": "#e67300",
    "LARGE_COLOR": "#663300"
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

    for (let i = 0; i < coronaData.length; i++) {
        let borough = coronaData[i]["Borough"];
        let objectData = coronaData[i][data];
        if (objectData < colorObject["MIN_VALUE"]) {
            color = colorObject["MIN_COLOR"];
        }
        else if (objectData >= colorObject["MIN_VALUE"] && objectData < colorObject["SMALL_VALUE"]) {
            color = colorObject["SMALL_COLOR"];
        }
        else if (objectData >= colorObject["SMALL_VALUE"] && objectData < colorObject["MEDIUM_VALUE"]) {
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


function toggleLegend(currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3) {
    const INACTIVE_LEGENDS = [inactiveLegend1, inactiveLegend2, inactiveLegend3];
    document.getElementById(currentLegend).style.display = 'block';
    INACTIVE_LEGENDS.map(legend => document.getElementById(legend).style.display = 'none');
}

function toggleLayers(map, currentLayer, inactiveLayer1, inactiveLayer2, inactiveLayer3,
    currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3) {
    const INACTIVE_LAYERS = [inactiveLayer1, inactiveLayer2, inactiveLayer3];
    const ACTIVE_LAYERS = [currentLayer];

    document.getElementById(currentLayer).addEventListener('click', function () {
        INACTIVE_LAYERS.map(layer => map.setLayoutProperty(layer, 'visibility', 'none'));
        ACTIVE_LAYERS.map(layer => map.setLayoutProperty(layer, 'visibility', 'visible'));
        toggleLegend(currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3)
    });
}



function formatCursor(map, layer) {
    map.on('mouseenter', layer, function (e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layer, function (e) {
        map.getCanvas().style.cursor = '';
    });
}




function addMapFeatures(map) {
    map.dragRotate.disable(); // Disable map rotation using right click + drag.
    map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

    // Add navigation control (excluding compass button) to the map.
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false
    }));


    map.on('load', async function () {
        //Fetches the polygons of all the London Boroughs. 
        let boroughPolygons = await fetchData('london_boroughs.json');
        let coronaData = await fetchData('week4.json');
        //merge Hackney and City of London
        let hackney = boroughPolygons.filter(x => x.properties["NAME"] === "Hackney")[0]
        let city = boroughPolygons.filter(x => x.properties["NAME"] === "City of London")[0]
        let hackneyAndCity = turf.union(hackney, city)
        boroughPolygons = boroughPolygons.filter(x => x.properties["NAME"] !== "Hackney" && x.properties["NAME"] !== "City of London")
        boroughPolygons.push(hackneyAndCity)
        boroughPolygons[31].properties["NAME"] = "Hackney and City of London"

        // expression gives the colours for the map based on its value
        let expression = ['match', ['get', 'NAME']];
        const CASES_EXPRESSION = expression.concat(calculateCountyColors(coronaData, CASES_PROPORTION_COLORS, "Cases per 100,000 in Past Week"));
        addChoroplethLayer(map, 'cases-per-100000', boroughPolygons, CASES_EXPRESSION);
        selectBorough(map, coronaData, 'cases-per-100000', "Cases per 100,000 in Past Week", "Weekly Cases per 100,000")

        const WEEKLY_EXPRESSION = expression.concat(calculateCountyColors(coronaData, WEEKLY_COLORS, "Cases in Last Week"));
        addChoroplethLayer(map, 'weekly-cases', boroughPolygons, WEEKLY_EXPRESSION);
        selectBorough(map, coronaData, 'weekly-cases', "Cases in Last Week", "Number of Cases from 14th Sep - 20th Sep")
        map.setLayoutProperty('weekly-cases', 'visibility', 'none');

        const DIFFERENCE_EXPRESSION = expression.concat(calculateCountyColors(coronaData, WEEKLY_DIFFERENCE_COLORS, "Difference From Previous Week"));
        addChoroplethLayer(map, 'difference', boroughPolygons, DIFFERENCE_EXPRESSION);
        selectBorough(map, coronaData, 'difference', "Difference From Previous Week", "Difference from Previous Week")
        map.setLayoutProperty('difference', 'visibility', 'none');

        const TOTAL_CASES_EXPRESSION = expression.concat(calculateCountyColors(coronaData, TOTAL_COLORS, "Total Cases"));
        addChoroplethLayer(map, 'total-cases', boroughPolygons, TOTAL_CASES_EXPRESSION);
        selectBorough(map, coronaData, 'total-cases', "Total Cases", "Total Number of Cases")
        map.setLayoutProperty('total-cases', 'visibility', 'none');

        toggleLayers(map, 'cases-per-100000', 'weekly-cases', 'difference', 'total-cases',
            "cases-per-100000-legend", "weekly-cases-legend", "weekly-difference-legend", "total-legend");
        toggleLayers(map, 'weekly-cases', 'cases-per-100000', 'difference', 'total-cases',
            "weekly-cases-legend", "cases-per-100000-legend", "weekly-difference-legend", "total-legend");
        toggleLayers(map, 'difference', 'weekly-cases', 'cases-per-100000', 'total-cases',
            "weekly-difference-legend", "cases-per-100000-legend", "weekly-cases-legend", "total-legend");
        toggleLayers(map, 'total-cases', 'difference', 'weekly-cases', 'cases-per-100000',
            "total-legend", "cases-per-100000-legend", "weekly-cases-legend", "weekly-difference-legend");

        addBoroughsOutline(map, 'boroughs-outline', boroughPolygons, 2.5);

        formatCursor(map, 'cases-per-100000');
        formatCursor(map, 'weekly-cases');
        formatCursor(map, 'difference');
        formatCursor(map, 'total-cases');

    });
}
