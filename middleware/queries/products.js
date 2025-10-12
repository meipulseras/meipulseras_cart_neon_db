import connectionToDB from "./connection.js";

async function getProducts() {
    const result = await connectionToDB()`SELECT * FROM products`;
};
        
export default getProducts;