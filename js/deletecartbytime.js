import deleteShoppingCart from './deletecart.js';
import { jwtDecode } from 'jwt-decode';

async function deleteShoppingCartByTime(token, user){
    try {

        if(!token) {
            return false;
        }

        const decoded = jwtDecode(token);

        const oneHourExpiration = decoded.iat + (60 * 60);

        const currentTime = Date.now() / 1000;

        if(oneHourExpiration < currentTime) {
            await deleteShoppingCart(user);
        }

        return true;
        
    } catch (error) {
        console.log(error);
        return false;
    }
}

export default deleteShoppingCartByTime;