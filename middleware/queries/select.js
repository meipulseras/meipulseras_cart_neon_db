import connectionToDB from "./connection.js";

async function getFromTable(campo, tabla, comp1, comp2) {
    let where = '';
    if(comp1 != null && comp2 != null){
        where = `WHERE ${comp1} = '${comp2}'`;
    }
    const query = `SELECT ${campo} FROM ${tabla} ${where}`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default getFromTable;