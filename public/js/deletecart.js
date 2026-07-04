import redisClientInstance from '../../middleware/redisClient.js';
const redisClient = redisClientInstance;

async function deleteShoppingCart(user){
    try {

        await redisClient.del(user);
        await redisClient.del(user + 'radiobutton');

        return true;

    } catch (error) {
        console.log(error);
    }
}

export default deleteShoppingCart;