import connectionToDB from "./connection.js";

async function deleteFromTable(tabla, comp1, comp2) {
    const query = `DELETE FROM ${tabla} WHERE ${comp1} = '${comp2}'`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default deleteFromTable;