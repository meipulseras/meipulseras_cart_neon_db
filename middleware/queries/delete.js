import connectionToDB from "./connection.js";

async function deleteFromTable(tabla, comp1, comp2) {
    const sql = connectionToDB();
    const query = `DELETE FROM ${tabla} WHERE ${comp1} = $1`;
    const result = await sql.query(query, [comp2]);
    return result;
};
        
export default deleteFromTable;