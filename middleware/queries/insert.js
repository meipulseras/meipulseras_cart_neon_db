import connectionToDB from "./connection.js";

async function intoTable(tabla, columns, values) {
    const sql = connectionToDB();
    let query;
    let params = [];
    if (Array.isArray(values)) {
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        query = `INSERT INTO ${tabla} (${columns}) VALUES (${placeholders})`;
        params = values;
    } else {
        query = `INSERT INTO ${tabla} (${columns}) VALUES (${values})`;
    }
    const result = await sql.query(query, params);
    return result;
};
        
export default intoTable;