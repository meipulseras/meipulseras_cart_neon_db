import redisClientInstance from '../../middleware/redisClient.js';
import getFromTable from '../../middleware/queries/select.js';
import updateTable from '../../middleware/queries/update.js';
import deleteShoppingCart from './deletecart.js'
const redisClient = redisClientInstance;

async function checkPayment(user) {
    try {

        var cart = await redisClient.get(user);

        if (cart !== null) {
            const carro = JSON.parse(cart);
            const order = carro.orden;
            const saleDate = new Date();
            const formattedDate = saleDate.toISOString().split('T')[0];

            if (order !== 'orden') {

                const insertedCart = await getFromTable('sale_order, cart, username, paid', 'sales', 'sale_order = $1 AND sale_date = $2', [order, formattedDate]);

                if (insertedCart[0].username === user && insertedCart[0].paid === true) {
                    await deleteShoppingCart(user);

                    var jsonCart = JSON.parse(insertedCart[0].cart);

                    for (let x = 0; x < jsonCart.length; x++) {

                        var item = jsonCart[x];

                        var stockDB = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', item.id);

                        var newStock = parseInt(stockDB[0].product_quantity) - parseInt(item.cantidad);

                        const set = 'product_quantity = $1';

                        await updateTable('price_quantity_products', set, 'product_id', [newStock, item.id]);

                    }

                } else {
                    console.log('Esperando a pago...');
                }

            }
        }


    } catch (error) {
        console.log(error);
    }

}

export default checkPayment;