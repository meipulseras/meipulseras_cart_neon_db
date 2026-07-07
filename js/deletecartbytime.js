import deleteShoppingCart from './deletecart.js';
import deleteFromTable from '../middleware/queries/delete.js';
import { jwtDecode } from 'jwt-decode';
import redisClientInstance from '../middleware/redisClient.js';
const redisClient = redisClientInstance;

async function deleteShoppingCartByTime(token, user) {
    try {

        if (!token) {
            return false;
        }

        const decoded = jwtDecode(token);

        const oneHourExpiration = decoded.iat + (60 * 60);

        const currentTime = Math.floor(Date.now() / 1000);

        if (oneHourExpiration <= currentTime) {

            var cart = await redisClient.get(user);

            var jsonCart = JSON.parse(cart);

            await deleteFromTable('sales', 'sale_order', jsonCart.orden);

            await deleteShoppingCart(user);
        }

        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
}

export default deleteShoppingCartByTime;