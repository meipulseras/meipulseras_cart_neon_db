import connectionToDB from "./connection.js";

async function getProductsPQ() {
    const result = await connectionToDB()`SELECT * FROM price_quantity_products`;
    console.log(result);
};
        
export default getProductsPQ;