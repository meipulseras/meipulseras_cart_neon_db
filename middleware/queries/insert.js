import connectionToDB from "./connection.js";

async function intoTable(tabla, columns, values) {
    const query = `INSERT INTO ${tabla} (${columns}) VALUES (${values})`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default intoTable;