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
    let weeks = ['week1.json', 'week2.json', 'week3.json', 'week4.json', 'week5.json', 'week6.json', 'week7.json', 'week8.json',
        'week9.json', 'week10.json', 'week11.json', 'week12.json', 'week13.json', 'week14.json', 'week15.json', 'week16.json',
        'week17.json', 'week18.json', 'week19.json', 'week20.json', 'week21.json', 'week22.json', 'week23.json', 'week24.json', 
        'week25.json', 'week26.json', 'week27.json', 'week28.json', 'week29.json', 'week30.json', 'week31.json', 'week32.json',
        'week33.json', 'week34.json', 'week35.json', 'week36.json', 'week37.json', 'week38.json', 'week39.json', 'week40.json',
        'week41.json', 'week42.json', 'week43.json', 'week44.json', 'week45.json', 'week46.json', 'week47.json', 'week48.json',
        'week49.json', 'week50.json', 'week51.json', 'week52.json'
    ]
    for (let i = 0; i < weeks.length; i++) {
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
    "cases-per-100000": 150,
    "weekly-cases": 450,
    "difference": 200,
    "total-cases": 3000,
    "square-mile-cases": 75
}

function setMaxValue(MAX_CHART_VALUES) {
    let keys = Object.keys(MAX_CHART_VALUES)
    let maxValue = 100
    for (let i = 0; i < keys.length; i++) {
        let id = '#' + keys[i] + ':checked'
        if (document.querySelector(id) !== null) {
            maxValue = MAX_CHART_VALUES[keys[i]]
        }
    }
    return maxValue;
}

const VARIABLES = {
    "cases-per-100000": "Cases per 100,000",
    "weekly-cases": "Weekly Cases",
    "difference": "Difference",
    "square-mile-cases": "Cases per Square Mile",
    "total-cases": "Total Cases"
}

function setVariables(VARIABLES) {
    let keys = Object.keys(VARIABLES)
    let variable;
    for (let i = 0; i < keys.length; i++) {
        let id = '#' + keys[i] + ':checked'
        if (document.querySelector(id) !== null) {
            variable = VARIABLES[keys[i]]
        }
    }
    return variable
}

function setChart(VARIABLES) {
    let variable = setVariables(VARIABLES)
    let type;
    if (variable === "Total Cases") {
        type = "line"
    } else type = "bar"

    return type;
}

function newChart(ctx, VARIABLES, previousWeeks, MAX_CHART_VALUES) {
    let val = setMaxValue(MAX_CHART_VALUES);

    let chart = new Chart(ctx, {
        type: setChart(VARIABLES),
        data: {
            labels: [
                ['Aug 31-', 'Sep 6'], ['Sep 7-', 'Sep 13'], ['Sep 14-', 'Sep 20'], ['Sep 21-', 'Sep 27'],
                ['Sep 28-', 'Oct 4'], ['Oct 5-', 'Oct 11'], ['Oct 12-', 'Oct 18'], ['Oct 19-', 'Oct 25'],
                ['Oct 25-', 'Nov 1'], ['Nov 2-', 'Nov 8'], ['Nov 9-', 'Nov 15'], ['Nov 16-', 'Nov 22'],
                ['Nov 23- Nov 29'], ['Nov 30- Dec 6'], ['Dec 7-', 'Dec-13'], ['Dec 14-', 'Dec-20'],
                ['Dec 21-', 'Dec 27'], ['Dec 28-', 'Jan 3'], ['Jan 4-', 'Jan 10'], ['Jan 11-', 'Jan 17'],
                ['Jan 18-', 'Jan 24'], ['Jan 25-', 'Jan 31'], ['Feb 1-', 'Feb 7'], ['Feb 8-', 'Feb 14'],
                ['Feb 15-', 'Feb 21'], ['Feb 22-', 'Feb 28'], ['Mar 1-', 'Mar 7'], ['Mar 8-', 'Mar 14'],
                ['Mar 15-', 'Mar 21'], ['Mar 22-', 'Mar 28'], ['Mar 29-', 'Apr 4'], ['Apr 5-', 'Apr 11'],
                ['Apr 12-', 'Apr 18'], ['Apr 19-', 'Apr 25'], ['Apr 26-', 'May 2'], ['May 3-', 'May 9'], 
                ['May 10-', 'May 16'], ['May 17-', 'May 23'], ['May 24-', 'May 30'], ['May 31-', 'Jun 6'],
                ['Jun 7-', 'Jun 13'], ['Jun 14-', 'Jun 20'], ['Jun 21-', 'Jun 27'], ['Jun 28-', 'Jul 4'],
                ['Jul 5-', 'Jul 11'], ['Jul 12-', 'Jul 18'], ['Jul 19-', 'Jul 25'], ['Jul 26-', 'Aug 1'],
                ['Aug 2-', 'Aug 8'],  ['Aug 9-', 'Aug 15'], ['Aug 16-', 'Aug 22'], ['Aug 23-', 'Aug 29']
            ],
            datasets: [{
                label: setVariables(VARIABLES),
                data: previousWeeks,
                backgroundColor: '#bababa',
                borderColor: '#000',
                borderWidth: 1,
                barPercentage: 0.5
            }],
            responsive: false
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
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 3
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
    document.getElementById('myChart').style.height = '250px';
    let chart = newChart(ctx, variable, previousWeeks, MAX_CHART_VALUES);

    return chart
}


function selectBorough(map, coronaData, id, data, variable) {
    map.on('click', id, function(e) {
        let currentBorough = e.features;

        if (!map.getLayer('current-borough')) {
            addBoroughsOutline(map, 'current-borough', currentBorough, 5);
        } else {
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
    "MIN_VALUE": 200,
    "MIN_COLOR": "#ffe6e6",
    "SMALL_VALUE": 400,
    "SMALL_COLOR": "#ff8080",
    "MEDIUM_VALUE": 600,
    "MEDIUM_COLOR": "#ff1a1a",
    "LARGE_COLOR": "#8b0000"
}

const WEEKLY_COLORS = {
    "MIN_VALUE": 300,
    "MIN_COLOR": "#f2ecf9",
    "SMALL_VALUE": 600,
    "SMALL_COLOR": "#bf9fdf",
    "MEDIUM_VALUE": 900,
    "MEDIUM_COLOR": "#8c53c6",
    "LARGE_COLOR": "#592d86"
}
const SQUARE_MILE_COLORS = {
    "MIN_VALUE": 30,
    "MIN_COLOR": "#b3ffff",
    "SMALL_VALUE": 60,
    "SMALL_COLOR": "#00ffff",
    "MEDIUM_VALUE": 90,
    "MEDIUM_COLOR": "#008b8b",
    "LARGE_COLOR": "#001a1a"
}

const WEEKLY_DIFFERENCE_COLORS = {
    "MIN_VALUE": 0,
    "MIN_COLOR": "#00ab66",
    "SMALL_VALUE": 150,
    "SMALL_COLOR": "#FF0",
    "MEDIUM_VALUE": 300,
    "MEDIUM_COLOR": "#FFBF00",
    "LARGE_COLOR": "#F00"
}

const TOTAL_COLORS = {
    "MIN_VALUE": 20000,
    "MIN_COLOR": "#fff2e6",
    "SMALL_VALUE": 27000,
    "SMALL_COLOR": "#ffb366",
    "MEDIUM_VALUE": 34000,
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
        } else if (objectData >= colorObject["MIN_VALUE"] && objectData < colorObject["SMALL_VALUE"]) {
            color = colorObject["SMALL_COLOR"];
        } else if (objectData >= colorObject["SMALL_VALUE"] && objectData < colorObject["MEDIUM_VALUE"]) {
            color = colorObject["MEDIUM_COLOR"];
        } else {
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


function toggleLegend(currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3, inactiveLegend4) {
    const INACTIVE_LEGENDS = [inactiveLegend1, inactiveLegend2, inactiveLegend3, inactiveLegend4];
    document.getElementById(currentLegend).style.display = 'block';
    INACTIVE_LEGENDS.map(legend => document.getElementById(legend).style.display = 'none');
}

function toggleLayers(map, currentLayer, inactiveLayer1, inactiveLayer2, inactiveLayer3, inactiveLayer4,
    currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3, inactiveLegend4) {
    const INACTIVE_LAYERS = [inactiveLayer1, inactiveLayer2, inactiveLayer3, inactiveLayer4];
    const ACTIVE_LAYERS = [currentLayer];

    document.getElementById(currentLayer).addEventListener('click', function() {
        INACTIVE_LAYERS.map(layer => map.setLayoutProperty(layer, 'visibility', 'none'));
        ACTIVE_LAYERS.map(layer => map.setLayoutProperty(layer, 'visibility', 'visible'));
        toggleLegend(currentLegend, inactiveLegend1, inactiveLegend2, inactiveLegend3, inactiveLegend4)
    });
}



function formatCursor(map, layer) {
    map.on('mouseenter', layer, function(e) {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layer, function(e) {
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


    map.on('load', async function() {
        //Fetches the polygons of all the London Boroughs. 
        let boroughPolygons = await fetchData('london_boroughs.json');
        let coronaData = await fetchData('week52.json');
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
        selectBorough(map, coronaData, 'weekly-cases', "Cases in Last Week", "Number of Cases from 23-29 August")
        map.setLayoutProperty('weekly-cases', 'visibility', 'none');

        const SQUARE_MILES_EXPRESSION = expression.concat(calculateCountyColors(coronaData, SQUARE_MILE_COLORS, "Cases per Square Mile"));
        addChoroplethLayer(map, 'square-mile-cases', boroughPolygons, SQUARE_MILES_EXPRESSION);
        selectBorough(map, coronaData, 'square-mile-cases', "Cases per Square Mile", "Cases per Square Mile")
        map.setLayoutProperty('square-mile-cases', 'visibility', 'none');

        const DIFFERENCE_EXPRESSION = expression.concat(calculateCountyColors(coronaData, WEEKLY_DIFFERENCE_COLORS, "Difference From Previous Week"));
        addChoroplethLayer(map, 'difference', boroughPolygons, DIFFERENCE_EXPRESSION);
        selectBorough(map, coronaData, 'difference', "Difference From Previous Week", "Difference from Previous Week")
        map.setLayoutProperty('difference', 'visibility', 'none');

        const TOTAL_CASES_EXPRESSION = expression.concat(calculateCountyColors(coronaData, TOTAL_COLORS, "Total Cases"));
        addChoroplethLayer(map, 'total-cases', boroughPolygons, TOTAL_CASES_EXPRESSION);
        selectBorough(map, coronaData, 'total-cases', "Total Cases", "Total Number of Cases to 2nd September")
        map.setLayoutProperty('total-cases', 'visibility', 'none');

        toggleLayers(map, 'cases-per-100000', 'weekly-cases', 'difference', 'total-cases', 'square-mile-cases',
            "cases-per-100000-legend", "weekly-cases-legend", "weekly-difference-legend", "total-legend", "square-mile-cases-legend");
        toggleLayers(map, 'weekly-cases', 'cases-per-100000', 'difference', 'total-cases', 'square-mile-cases',
            "weekly-cases-legend", "cases-per-100000-legend", "weekly-difference-legend", "total-legend", "square-mile-cases-legend");
        toggleLayers(map, 'difference', 'weekly-cases', 'cases-per-100000', 'total-cases', 'square-mile-cases',
            "weekly-difference-legend", "cases-per-100000-legend", "weekly-cases-legend", "total-legend", "square-mile-cases-legend");
        toggleLayers(map, 'total-cases', 'difference', 'weekly-cases', 'cases-per-100000', 'square-mile-cases',
            "total-legend", "cases-per-100000-legend", "weekly-cases-legend", "weekly-difference-legend", "square-mile-cases-legend");
        toggleLayers(map, 'square-mile-cases', 'total-cases', 'difference', 'weekly-cases', 'cases-per-100000',
            "square-mile-cases-legend", "total-legend", "cases-per-100000-legend", "weekly-cases-legend", "weekly-difference-legend");

        addBoroughsOutline(map, 'boroughs-outline', boroughPolygons, 2.5);

        formatCursor(map, 'cases-per-100000');
        formatCursor(map, 'weekly-cases');
        formatCursor(map, 'square-mile-cases')
        formatCursor(map, 'difference');
        formatCursor(map, 'total-cases');;

    });
}