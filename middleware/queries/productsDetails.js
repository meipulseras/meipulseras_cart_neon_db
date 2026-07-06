import connectionToDB from "./connection.js";

async function getProductDetail(numeroProducto) {
    const id = 'PrMP' + numeroProducto;
    const query = 'SELECT product_quantity FROM price_quantity_products WHERE product_id = $1';
    const result = await connectionToDB().query(query, [id]);
    return result[0];
};
        
export default getProductDetail;