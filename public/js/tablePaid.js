const array = document.getElementById("array").textContent;

var parsedJson = JSON.parse(array);

for(let i = 0; i < parsedJson.length; i++){
    var precio = parsedJson[i].precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    parsedJson[i].precio = precio
}

const jsonData = {
    "data": parsedJson
}

function generateTable(data) {
    if(!data || data.length === 0) return 'No data available';

    const table = document.createElement("table");

    const headerRow = document.createElement("tr");

    const keys = Object.keys(data[0]);

    keys.forEach(key => {
        const th = document.createElement("th");

        if(key == 'nombre' || key == 'precio' || key == 'cantidad') {
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        }

        if(key == 'stock') {
            th.textContent = 'Subtotal';
        }

        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    data.forEach(item => {
        const row = document.createElement("tr");

        keys.forEach(key => {
            const td = document.createElement("td");
            if(key == 'precio') {
                td.textContent = "$" + item[key] || "";
            } else if(key == 'nombre'){
                td.textContent = item[key] || "";           
            } else if(key == 'cantidad'){
                td.textContent = item[key] || ""; 
            } else if(key == 'imagen') {
                var image = document.createElement("img");
                image.setAttribute("src", item['imagen']);
                image.setAttribute("alt", "Producto");
                image.setAttribute("class", "fotopagado");
                td.append(image);
            } else if(key == 'stock'){
                var newPrice = item['precio'].toString().replace(".", "");
                var subtotal = parseInt(newPrice) * parseInt(item['cantidad']);
                td.textContent = "$" + subtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
            
            row.appendChild(td);
            
        });
        table.appendChild(row);
    });
    return table;
}

const container = document.getElementById('table-container');
const table = generateTable(jsonData.data);
const td = document.getElementsByTagName('table');
if (table) container.appendChild(table);