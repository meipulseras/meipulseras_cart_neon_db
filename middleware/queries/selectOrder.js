import connectionToDB from "./connection.js";

async function getFromTableOrder(campo, tabla, comp1, comp2, comp3, comp4) {
    let where = '';
    let order = '';
    if(comp1 != null && comp2 != null){
        where = `WHERE ${comp1} = '${comp2}'`;
    }

    if(comp3 != null && comp4 != null){
        order = `ORDER BY ${comp3} ${comp4}`;
    }

    const query = `SELECT ${campo} FROM ${tabla} ${where} ${order}`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default getFromTableOrder;