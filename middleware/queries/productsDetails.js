import connectionToDB from "./connection.js";

async function getProductDetail(numeroProducto) {
    const id = 'PrMP' + numeroProducto;
    const query = `SELECT products.product_id, products.product_name, products.product_description, 
    products.product_image, price_quantity_products.product_price, price_quantity_products.product_quantity 
    FROM products INNER JOIN price_quantity_products 
    ON products.product_id = price_quantity_products.product_id WHERE products.product_id = '${id}'`;
    const result = await connectionToDB().query(query);
    return result[0];
};
        
export default getProductDetail;