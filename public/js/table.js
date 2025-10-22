const array = document.getElementById("array").textContent;

var parsedJson = JSON.parse(array);

console.log(parsedJson)

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
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ' Tienda';
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
                var buttonminus = document.createElement("button");
                buttonminus.setAttribute("id", "minus");
                buttonminus.setAttribute("name", "cart");
                buttonminus.setAttribute("type", "submit");
                buttonminus.setAttribute("data-action", "decrement");
                buttonminus.setAttribute("class", "minplus");
                buttonminus.setAttribute("value", item['id']);

                var spanminus = document.createElement("span");
                spanminus.innerText = "-";
                buttonminus.append(spanminus);

                var input = document.createElement("input");
                input.setAttribute("class", "inputminplus");
                input.setAttribute("type", "number");
                input.setAttribute("name", "prodquantity");
                input.setAttribute("value", item[key]);
                input.setAttribute("id", item['id']);
                input.setAttribute("max", item['stock']);

                var buttonplus = document.createElement("button");
                buttonplus.setAttribute("id", "plus");
                buttonplus.setAttribute("name", "cart");
                buttonplus.setAttribute("type", "submit");
                buttonplus.setAttribute("data-action", "increment");
                buttonplus.setAttribute("class", "minplus");
                buttonplus.setAttribute("value", item['id']);

                var spanplus = document.createElement("span");
                spanplus.innerText = "+";
                buttonplus.append(spanplus);

                var form = document.createElement("form");
                form.setAttribute("action", "/cart");
                form.setAttribute("method", "post");
                form.append(buttonminus);
                form.append(input);
                form.append(buttonplus);

                td.setAttribute("class", "btnqty");
                td.append(form);
            } else if (key == 'stock') {
                td.textContent = item[key] || ""; 
            }
            
            row.appendChild(td);
            
        });
        table.appendChild(row);
        table.setAttribute('class', 'tablaproductos')
    });
    return table;
}

const container = document.getElementById('table-container');
const table = generateTable(jsonData.data);
const td = document.getElementsByTagName('table');
if (table) container.appendChild(table);

setInterval(function() {
        window.location.reload();
    }, 1000 * 60 * 15); 