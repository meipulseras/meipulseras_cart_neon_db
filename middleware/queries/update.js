import connectionToDB from "./connection.js";

async function updateTable(tabla, set, comp1, comp2) {
    const sql = connectionToDB();
    let query;
    let params = [];

    if (Array.isArray(comp2)) {
        if (comp1.includes('$1') || comp1.includes('$2') || comp1.includes('$3') || comp1.includes('$4')) {
            query = `UPDATE ${tabla} SET ${set} WHERE ${comp1}`;
        } else {
            query = `UPDATE ${tabla} SET ${set} WHERE ${comp1} = $${comp2.length}`;
        }
        params = comp2;
    } else {
        query = `UPDATE ${tabla} SET ${set} WHERE ${comp1} = '${comp2}'`;
    }
    const result = await sql.query(query, params);
    return result;
};
        
export default updateTable;