const array = document.getElementById("array").textContent;

var parsedJson = JSON.parse(array);

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

        if(key == 'sale_order') {
            th.textContent = 'Orden Compra';
            headerRow.appendChild(th);
        }

        if(key == 'cart') {
            th.textContent = 'Productos';
            headerRow.appendChild(th);
        }

        if(key == 'subtotal') {
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            headerRow.appendChild(th);
        }

        if(key == 'shipping') {
            th.textContent = 'Envío';
            headerRow.appendChild(th);
        }

        if(key == 'total') {
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            headerRow.appendChild(th);
        }

        if(key == 'sale_date') {
            th.textContent = 'Fecha Compra';
            headerRow.appendChild(th);
        }
    });

    table.appendChild(headerRow);

    data.forEach(item => {
        const row = document.createElement("tr");

        keys.forEach(key => {
            const td = document.createElement("td");
            if(key == 'subtotal') {
                td.textContent = "$" + item[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "";
            } else if(key == 'shipping') {
                td.textContent = "$" + item[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "";
            } else if(key == 'total') {
                td.textContent = "$" + item[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "";
            } else if(key == 'sale_order'){
                td.textContent = item[key] || "";           
            } else if (key == 'sale_date') {
                td.textContent = item[key].toString().substring(0, 10) || "";
            } else if (key == 'cart') {
                const prods = JSON.parse(item[key]);

                for(let i = 0; i < prods.length; i++) {
                    var prod = prods[0];

                    td.textContent = td.textContent + '\n' + prod.nombre + ' x ' + prod.cantidad || "";
                    td.style.whiteSpace = 'pre-line';
                    td.style.paddingTop = '0px';
                    td.style.paddingBottom = '15px';
                    
                }
                
                
            }
            
            row.appendChild(td);
            
        });
        table.appendChild(row);
        table.style.width = '70%';
        table.style.marginLeft = '15%';
        table.style.marginRight = '15%';
        table.setAttribute("class", "tdproductos");
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