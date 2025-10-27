import connectionToDB from "./connection.js";

async function getSaleOrder(campo, tabla, comp1, comp2) {
    
    const query = `SELECT sale_order FROM sales ORDER BY sale_order DESC LIMIT 1`;
    const result = await connectionToDB().query(query);
    return result;
};
        
export default getSaleOrder;