// Load GeoJSON dataset and school code mappings, then render educational establishments on the map
Promise.all([
    fetch('data/educational-establishment.geojson').then(res => res.json()),
    fetch('data/school-code-mappings.json').then(res => res.json())
])
.then(([geojsonData, mappingData]) => {

    const data = geojsonData.features;
    const mappings = mappingData;

    // Initialise map
    const map = L.map('map').setView([52.5, -1.85], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marker clusters
    const allMarkersCluster = L.markerClusterGroup();
    const brumMarkersCluster = L.markerClusterGroup();

    // Random colour generator
    function getRandomColour() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    // Type colours and marker storage
    const typeColours = {};
    const markersAll = {}, markersBrum = {};

    data.forEach(feature => {
        const type = feature.properties['educational-establishment-type'];
        if (!typeColours[type]) typeColours[type] = getRandomColour();
    });

    // Create a Leaflet marker
    function createMarker(feature) {
        const coords = feature.geometry?.coordinates;
        if (!coords || coords.length < 2) return null;

        const lon = coords[0];
        const lat = coords[1];
        const props = feature.properties;
        const typeCode = props['educational-establishment-type'];
        const statusCode = props['educational-establishment-status'];
        const typeName = mappings['educational-establishment-type'][typeCode] || typeCode;
        const statusName = mappings['educational-establishment-status'][statusCode] || statusCode;

        const marker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: typeColours[typeCode],
            color: typeColours[typeCode],
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        const ladLink = `<a href="https://www.planning.data.gov.uk/prefix/statistical-geography/reference/${props['local-authority-district']}" target="_blank">${props['local-authority-district']}</a>`;
        const wardLink = `<a href="https://www.planning.data.gov.uk/prefix/statistical-geography/reference/${props['ward']}" target="_blank">${props['ward']}</a>`;
        const websiteLink = props['website-url'] ? `<a href="${props['website-url']}" target="_blank">${props['website-url']}</a>` : 'N/A';
        const referenceLink = `<a href="https://www.planning.data.gov.uk/entity/${props.entity}" target="_blank">${props.reference}</a>`;

        marker.bindPopup(`
            <b>${props.name}</b><br>
            Educational Establishment Number: ${props['educational-establishment-number']}<br>
            Local Authority District: ${ladLink}<br>
            Ward: ${wardLink}<br>
            Educational Establishment Type: ${typeCode} (${typeName})<br>
            School Capacity: ${props['school-capacity']}<br>
            Educational Establishment Status: ${statusCode} (${statusName})<br>
            Website: ${websiteLink}<br>
            Reference: ${referenceLink}
        `);

        return { marker, typeCode, district: props['local-authority-district'] };
    }

    // Populate clusters
    data.forEach(feature => {
        const result = createMarker(feature);
        if (!result) return;

        const { marker, typeCode, district } = result;

        if (!markersAll[typeCode]) markersAll[typeCode] = [];
        markersAll[typeCode].push(marker);
        allMarkersCluster.addLayer(marker);

        if (district === 'E08000025') {
            if (!markersBrum[typeCode]) markersBrum[typeCode] = [];
            markersBrum[typeCode].push(marker);
            brumMarkersCluster.addLayer(marker);
        }
    });

    // Initial view
    let currentCluster = allMarkersCluster;
    let currentMarkers = markersAll;
    map.addLayer(currentCluster);

    // Toggle view control
    const toggleControl = L.control({ position: 'topright' });
    toggleControl.onAdd = function() {
        const div = L.DomUtil.create('div');
        div.innerHTML = `
            <select id="viewToggle">
                <option value="all">England</option>
                <option value="brum">Birmingham Only</option>
            </select>
        `;
        return div;
    };
    toggleControl.addTo(map);

    // Legend control
    function createLegend(markersObj) {
        if (window.legendControl) map.removeControl(window.legendControl);
        const legendControl = L.control({ position: 'bottomright' });
        legendControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = '<strong>Educational Establishment Types</strong><br>';
            Object.keys(markersObj).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(type=>{
                const name = mappings['educational-establishment-type'][type] || type;
                div.innerHTML += `<i style="background:${typeColours[type]};"></i> ${type} (${name})<br>`;
            });
            return div;
        };
        legendControl.addTo(map);
        window.legendControl = legendControl;
    }

    // Filter control
    function createFilter(markersObj) {
        if (window.filterControl) map.removeControl(window.filterControl);
        const filterControl = L.control({ position: 'bottomright' });
        filterControl.onAdd = function() {
            const div = L.DomUtil.create('div');
            let html = '<select id="typeFilter"><option value="All">All Educational Establishment Types</option>';
            Object.keys(markersObj).sort((a,b)=>parseInt(a)-parseInt(b)).forEach(type=>{
                const name = mappings['educational-establishment-type'][type] || type;
                html += `<option value="${type}">${type} (${name})</option>`;
            });
            html += '</select>';
            div.innerHTML = html;
            return div;
        };
        filterControl.addTo(map);
        window.filterControl = filterControl;

        document.getElementById('typeFilter').addEventListener('change', function() {
            const type = this.value;
            currentCluster.clearLayers();
            if (type === 'All') {
                Object.values(currentMarkers).forEach(arr => arr.forEach(m => currentCluster.addLayer(m)));
            } else {
                currentMarkers[type]?.forEach(m => currentCluster.addLayer(m));
            }
        });
    }

    // Initialise legend and filter
    createLegend(currentMarkers);
    createFilter(currentMarkers);

    // Handle view toggle
    document.getElementById('viewToggle').addEventListener('change', function() {
        const value = this.value;
        map.removeLayer(currentCluster);
        if (value === 'all') {
            currentCluster = allMarkersCluster;
            currentMarkers = markersAll;
            map.setView([52.5, -1.85], 6);
        } else {
            currentCluster = brumMarkersCluster;
            currentMarkers = markersBrum;
            map.setView([52.5, -1.85], 11);
        }
        map.addLayer(currentCluster);
        createLegend(currentMarkers);
        createFilter(currentMarkers);
    });

})
.catch(err => console.error('Failed to load GeoJSON:', err));