import connectionToDB from "./connection.js";

async function getFromTable(campo, tabla, comp1, comp2) {
    const sql = connectionToDB();
    let where = '';
    let params = [];
    if(comp1 != null){
        if (comp1.includes('$1') || comp1.includes('$2')) {
            where = `WHERE ${comp1}`;
        } else {
            where = `WHERE ${comp1} = $1`;
        }
        params = Array.isArray(comp2) ? comp2 : [comp2];
    }
    const query = `SELECT ${campo} FROM ${tabla} ${where}`;
    const result = await sql.query(query, params);
    return result;
};
        
export default getFromTable;