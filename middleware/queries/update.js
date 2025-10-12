import connectionToDB from "./connection.js";

async function updateTable(tabla, set, comp1, comp2) {
    const query = `UPDATE ${tabla} SET ${set} WHERE ${comp1} = '${comp2}'`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default updateTable;