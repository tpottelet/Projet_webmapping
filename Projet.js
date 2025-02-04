const map = L.map("map", {
    minZoom: 2
}).setView([43.57, 1.3], 10);

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
});

let ndvi = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:Serie_temp_S2_ndvi',
    styles: 'Style_ndvi', // Style par défaut
    format: 'image/png',
    transparent: true,
});

const essences = L.tileLayer.wms('https://www.geotests.net/geoserver/ThomasP/wms?', {
    version: '1.1.0',
    layers: 'ThomasP:carte_essences_echelle_pixel',
    format: 'image/png',
    transparent: true,
});

// Ajout des couches WMS dans un objet séparé
const overlayLayers = {
    "Masque Forêt": mask,
    "Série temporelle NDVI": ndvi,
    "Essences": essences
};

// Ajout du contrôle des couches
L.control.layers(basemapLayers, overlayLayers, { collapsed: true }).addTo(map);

// Éléments HTML
const legend = document.getElementById("legend");
const styleSelector = document.getElementById("style-selector");
const styleSelect = document.getElementById("styleSelect");

// Définition des URLs des légendes
const legendUrls = {
    "Masque Forêt": "https://www.geotests.net/geoserver/ThomasP/wms?REQUEST=GetLegendGraphic&LAYER=ThomasP:masque_foret&FORMAT=image/png",
    "Série temporelle NDVI": "https://www.geotests.net/geoserver/ThomasP/wms?REQUEST=GetLegendGraphic&LAYER=ThomasP:Serie_temp_S2_ndvi&FORMAT=image/png&STYLE=",
    "Essences": "https://www.geotests.net/geoserver/ThomasP/wms?REQUEST=GetLegendGraphic&LAYER=ThomasP:carte_essences_echelle_pixel&FORMAT=image/png"
};

function updateLegend() {
    legend.innerHTML = ""; // Réinitialiser la légende avant de l'actualiser
    let activeLegends = [];

    map.eachLayer(layer => {
        // On vérifie si la couche est dans la liste des couches superposées
        for (let layerName in overlayLayers) {
            if (map.hasLayer(overlayLayers[layerName])) {
                let legendUrl = legendUrls[layerName];

                // Mise à jour du style NDVI dynamiquement
                if (layerName === "Série temporelle NDVI") {
                    legendUrl += styleSelect.value;
                }

                // Ajout de l'élément de légende s'il n'existe pas déjà
                if (!activeLegends.some(legend => legend.includes(layerName))) {
                    activeLegends.push(`
                        <div class="legend-item">
                            <strong>${layerName} :</strong><br>
                            <img src="${legendUrl}" alt="Légende ${layerName}">
                        </div>
                    `);
                }
            }
        }
    });

    if (activeLegends.length > 0) {
        legend.innerHTML = activeLegends.join(""); // Mise à jour avec la nouvelle légende
        legend.style.display = "block";
        styleSelector.style.display = map.hasLayer(ndvi) ? "block" : "none";
    } else {
        legend.style.display = "none";
        styleSelector.style.display = "none";
    }
}


// Gestion des changements de couches
map.on("overlayadd", updateLegend);
map.on("overlayremove", updateLegend);
map.on("baselayerchange", updateLegend);

// Sélectionner un style dynamique pour NDVI sans décocher la couche
styleSelect.addEventListener("change", function() {
    let newStyle = styleSelect.value;

    // Mise à jour directe de la couche NDVI sans la supprimer
    ndvi.setParams({ styles: newStyle });

    // Mettre à jour la légende après le changement de style
    updateLegend();
});

// Ajouter un contrôle d'échelle
L.control.scale().addTo(map);