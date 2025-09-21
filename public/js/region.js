var regionSelect = document.getElementById("regionSelect");

const region = '{ "1": "Región de Arica y Parinacota",'+
                '"2": "Región de Tarapacá",'+
                '"3": "Región de Antofagasta",'+
                '"4": "Región de Atacama",'+
                '"5": "Región de Coquimbo",'+
                '"6": "Región de Valparaíso",'+
                '"7": "Región Metropolitana",'+
                '"8": "Región del Libertador General Bernardo O’Higgins",'+
                '"9": "Región del Maule",'+
                '"10": "Región de Ñuble",'+
                '"11": "Región del Biobío",'+
                '"12": "Región de La Araucanía",'+
                '"13": "Región de Los Ríos",'+
                '"14": "Región de Los Lagos",'+
                '"15": "Región de Aysén del General Carlos Ibáñez del Campo",'+
                '"16": "Región de Magallanes y de la Antártica Chilena"}';

var jsonRegion = JSON.parse(region);

for(let i = 1; i <= 16; i++){
    var option = document.createElement("option");
    option.text = jsonRegion[i];
    option.setAttribute("name", jsonRegion[i]);
    regionSelect.add(option)
}