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

function addChoroplethLayer(map, id, boroughPolygons) {
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
            "fill-color": '#FFF',
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

    map.on('click', 'boroughs', function(e){
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
        console.log(currentBorough[0].properties["NAME"])
    })

    map.on('load', async function () {
        //Fetches the polygons of all the UK counties. 
        let boroughPolygons = await fetchData('london_boroughs.json');
        console.log(boroughPolygons)
    
        addChoroplethLayer(map, 'boroughs', boroughPolygons)
        addBoroughsOutline(map, 'boroughs-outline', boroughPolygons, 3);
        
    });

}
