const map = L.map("map", {
    minZoom: 2
}).setView([43.6, 1.4], 10);

const apiKey = "AAPK354eecdc7c97446693459f3eefcc426aT3yzhYO_6k9e6ki4ef2cUIFW5jr3R8VN7iOdInqVtXc-zLiPA4_x3Q492aOF7ywI";

function getBasemap(style) {
    return L.esri.Vector.vectorBasemapLayer(style, {
        apikey: apiKey
    });
}

const basemapLayers = {
    "ArcGIS:LightGray": getBasemap("ArcGIS:LightGray").addTo(map), // Ajouté par défaut
    "ArcGIS:Streets": getBasemap("ArcGIS:Streets"),
    "ArcGIS:Imagery": getBasemap("ArcGIS:Imagery"),
    "OSM:Standard": getBasemap("OSM:Standard"),
};

// Couches WMS
const mask = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:masque_foret',
    format: 'image/png',
    transparent: true,
    attribution: '&copy; GeoTests'
});

const sample = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:Sample_BD_foret_T31TCJ',
    format: 'image/png',
    transparent: true,
    attribution: '&copy; GeoTests'
});

// Ajouter une couche WMS pour NDVI
const ndvi = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:Serie_temp_S2_ndvi', // Remplace par ta couche NDVI
    styles: 'Style_ndvi', // Style par défaut
    format: 'image/png',
    transparent: true,
    attribution: '&copy; GeoTests'
});

// Masquer le sélecteur de style au départ
const styleSelector = document.getElementById("style-selector");

// Fonction pour afficher/masquer le sélecteur de style
function toggleStyleSelector(isVisible) {
    if (isVisible) {
        styleSelector.style.display = "block";
    } else {
        styleSelector.style.display = "none";
    }
}

// Lorsque la couche de base change
map.on('layeradd', function(event) {
    // Vérifier si la couche ajoutée est NDVI
    if (event.layer === ndvi) {
        toggleStyleSelector(true); // Afficher le sélecteur de style
    }
});

// Lorsque la couche de base est enlevée
map.on('layerremove', function(event) {
    // Vérifier si la couche enlevée est NDVI
    if (event.layer === ndvi) {
        toggleStyleSelector(false); // Cacher le sélecteur de style
    }
});

// Initialiser le contrôle des couches
L.control.layers({}, {
    "NDVI": ndvi
}).addTo(map);

// Sélectionner un style dynamique pour NDVI
styleSelect.addEventListener("change", function() {
    const selectedStyle = styleSelect.value;

    // Supprimer l'ancienne couche NDVI et ajouter la nouvelle avec le style choisi
    map.removeLayer(ndvi);

    // Ajouter une nouvelle couche NDVI avec le style sélectionné
    ndvi = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
        version: '1.1.0',
        layers: 'ThomasP:Serie_temp_S2_ndvi',
        styles: selectedStyle, // Appliquer le style sélectionné
        format: 'image/png',
        transparent: true,
        attribution: '&copy; GeoTests'
    }).addTo(map);
});

const essences = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:carte_essences_echelle_pixel',
    format: 'image/png',
    transparent: true,
    attribution: '&copy; GeoTests'
});

// Ajout des couches WMS dans un objet séparé
const overlayLayers = {
    "Masque Forêt": mask,
    "Sample": sample,
    "Série temporelle NDVI": ndvi,
    "Essences": essences
};

// Ajout du contrôle des couches
L.control.layers(basemapLayers, overlayLayers, { collapsed: true }).addTo(map);

const legend = document.getElementById("legend");

// Définition des légendes pour chaque couche
const legends = {
    "Masque Forêt": "Masque des forêts",
    "Sample": "Echantillons de données forestières",
    "Série temporelle NDVI": "NDVI sur chaque date",
    "Essences": "Essences des arbres"
};

// Fonction pour mettre à jour la légende
function updateLegend(layerName) {
    if (legends[layerName]) {
        legend.innerHTML = `<strong>Légende :</strong> ${legends[layerName]}`;
        legend.style.display = "block";
    } else {
        legend.style.display = "none";
    }
}

// Gestion des changements de couches
map.on("baselayerchange", function (event) {
    updateLegend(event.name);
});

map.on("overlayadd", function (event) {
    updateLegend(event.name);
});

map.on("overlayremove", function (event) {
    updateLegend(event.name);
});
