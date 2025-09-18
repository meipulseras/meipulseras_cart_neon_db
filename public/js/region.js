var region = document.getElementById("region").value;
var regionSelect = document.getElementById("regionSelect");

var jsonRegion = JSON.parse(region);

for(let i = 0; i < jsonRegion.length; i++){
    var option = document.createElement("option");
    option.text = jsonRegion[i].region;
    option.setAttribute("name", jsonRegion[i].region);
    regionSelect.add(option)
}