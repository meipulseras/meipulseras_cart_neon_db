import Cart from '../models/Cart.js';
import ProductQuantity from '../models/ProductQuantity.js';
import Product from '../models/Products.js';

async function cartDuration(user){
    var newCartsProducts = await Cart.findOne({username: user, active: true, waitingpayment: false, sold: false});

    const oneHour = 15 * 60 * 1000

    if(newCartsProducts !== null){
        if((new Date - newCartsProducts.sellsdate) > oneHour){
            newCartsProducts.active = false;
            newCartsProducts.save();

            newCartsProducts.products.forEach(async product => {
                const recoverStock = await ProductQuantity.findOne({_id: product});
    
                const productToRecoverStock = await Product.findOne({productid: recoverStock.productid});
            
                const newStock = productToRecoverStock.productstock + recoverStock.productquantity;
    
                await Product.updateOne({productid: recoverStock.productid},
                    { 
                      $set: { productstock: newStock }
                    }
                 );
    
            });
        }
        
    }
}

export default cartDuration;
