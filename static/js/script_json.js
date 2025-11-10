// Load JSON dataset and school code mappings, then render educational establishments on the map
Promise.all([
    fetch('data/educational_establishment.json').then(res => res.json()),
    fetch('data/school_code_mappings.json').then(res => res.json())
])
.then(([establishmentData, mappingData]) => {
    
    const data = establishmentData.entities;
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

    data.forEach(item => {
        const type = item['educational-establishment-type'];
        if (!typeColours[type]) typeColours[type] = getRandomColour();
    });

    // Create a Leaflet marker
    function createMarker(item) {
        const match = item.point.match(/POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/);
        if (!match) return null;

        const lon = parseFloat(match[1]);
        const lat = parseFloat(match[2]);
        const typeCode = item['educational-establishment-type'];
        const statusCode = item['educational-establishment-status'];
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

        const ladLink = `<a href="https://www.planning.data.gov.uk/prefix/statistical-geography/reference/${item['local-authority-district']}" target="_blank">${item['local-authority-district']}</a>`;
        const wardLink = `<a href="https://www.planning.data.gov.uk/prefix/statistical-geography/reference/${item['ward']}" target="_blank">${item['ward']}</a>`;
        const websiteLink = item['website-url'] ? `<a href="${item['website-url']}" target="_blank">${item['website-url']}</a>` : 'N/A';
        const referenceLink = `<a href="https://www.planning.data.gov.uk/entity/${item.entity}" target="_blank">${item.reference}</a>`;

        marker.bindPopup(`
            <b>${item.name}</b><br>
            Educational Establishment Number: ${item['educational-establishment-number']}<br>
            Local Authority District: ${ladLink}<br>
            Ward: ${wardLink}<br>
            Educational Establishment Type: ${typeCode} (${typeName})<br>
            School Capacity: ${item['school-capacity']}<br>
            Educational Establishment Status: ${statusCode} (${statusName})<br>
            Website: ${websiteLink}<br>
            Reference: ${referenceLink}
        `);

        return { marker, typeCode };
    }

    // Populate clusters
    data.forEach(item => {
        const result = createMarker(item);
        if (!result) return;

        const { marker, typeCode } = result;

        if (!markersAll[typeCode]) markersAll[typeCode] = [];
        markersAll[typeCode].push(marker);
        allMarkersCluster.addLayer(marker);

        if (item['local-authority-district'] === 'E08000025') {
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
.catch(err => console.error('Failed to load JSON:', err));