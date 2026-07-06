import connectionToDB from "./connection.js";

async function getFromTableOrder(campo, tabla, comp1, comp2, comp3, comp4) {
    const sql = connectionToDB();
    let where = '';
    let order = '';
    let params = [];

    if(comp1 != null){
        if (comp1.includes('$1') || comp1.includes('$2')) {
            where = `WHERE ${comp1}`;
        } else {
            where = `WHERE ${comp1} = $1`;
        }
        params = Array.isArray(comp2) ? comp2 : [comp2];
    }

    if(comp3 != null && comp4 != null){
        order = `ORDER BY ${comp3} ${comp4}`;
    }

    const query = `SELECT ${campo} FROM ${tabla} ${where} ${order}`;
    const result = await sql.query(query, params);
    return result;
};
        
export default getFromTableOrder;