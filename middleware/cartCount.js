import Cart from '../models/Cart.js';

async function cartNumeration(user){
    const newProduct = await Cart.findOne({username: user, active: true, sold: false}, { _id: 0, products: 1});

    if(newProduct !== null) {
        return newProduct.products.length;
    } else {
        return 0
    }
}
        
export default cartNumeration;
