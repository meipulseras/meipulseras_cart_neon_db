import express from 'express';
import compression from 'compression';
import verifyJWT from "./middleware/verifyJWT.js";
import cartNumeration from './middleware/cartCount.js';
import redisClientInstance from './middleware/redisClient.js';
import getFromTable from './middleware/queries/select.js';

const redisClient = redisClientInstance;

const router = express.Router();

router.use(compression());

//Ruta carrito - Mostrar items en carrito
router.get('/cart', async (req, res) => {

    try {
        // const token = req.session.token;
        const token = req.cookies.token;
        const user = verifyJWT(token);

        var length = await redisClient.get(user);

        const selecterRadio = await redisClient.get(user+'radiobutton');

        const items = cartNumeration(length, user);

        if(user == ''){
            return res.status(401).redirect('/');
        }

        const clientData = await getFromTable('fullname, address, comune, region, phone, mail', 'user_info', 'username', user);

        const clientName = clientData[0].fullname;
        const clientAddress = clientData[0].address;
        const clientComune = clientData[0].comune;
        const clientRegion = clientData[0].region;
        const clientPhone = clientData[0].phone;
        const clientMail = clientData[0].mail;

        const regionPrice = await getFromTable('blue_price', 'regions', 'region_name', clientRegion);

        var jsonCart = JSON.parse(length);

        var subtotal = 0;

        if(jsonCart === undefined || jsonCart === null){
            return res.status(401).redirect('/');
        }

        for(let i = 0; i < jsonCart.carrito.length; i++){

            var object = jsonCart.carrito[i];

            var stock = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', object.id); 
        
            subtotal = subtotal + (object.precio * object.cantidad);
            object.stock = stock[0].product_quantity;
        }

        var array = JSON.stringify(jsonCart.carrito);

        var envio = jsonCart.envio;

        var newTotal = (subtotal + parseInt(envio));

        const data = {
            username: user.charAt(0) + user.slice(1).toLowerCase(),
            clientname: clientName,
            clientaddress: clientAddress,
            clientcomune: clientComune,
            clientregion: clientRegion,
            clientphone: clientPhone,
            clientmail: clientMail.toLowerCase(),
            clientshipmentprice: regionPrice[0].blue_price,
            array: array,
            count: items,
            subtotal: subtotal,
            total: newTotal,
            radiobtn: selecterRadio
        };
      
        if(array.length === 2 && array === '[]' || data.username === ''){
            await redisClient.del(user+'radiobutton');
            await redisClient.del(user);
            return res.status(401).redirect('/');
        } else {
            res.render('cart', data);
        }

    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }

});

router.post('/cart', async (req, res) => {

    // const token = req.session.token;
    const token = req.cookies.token;
    const idtochange = req.body.cart;
    const prodqty = parseInt(req.body.prodquantity);
    const user = verifyJWT(token);
       
    try {

        var cart = await redisClient.get(user);

        var jsonCart = JSON.parse(cart);
        
        for(let i = 0; i < jsonCart.carrito.length; i++){

            var item = jsonCart.carrito[i];
        
            if(item.id === idtochange) {
                if(prodqty > 0) {
                    item.cantidad = prodqty;
                    await redisClient.set(user, JSON.stringify(jsonCart));
                    break;
                } else {
                    const index = jsonCart.carrito.indexOf(item);                
                    jsonCart.carrito.splice(index, 1);
                    await redisClient.set(user, JSON.stringify(jsonCart));
                }
            }
        }

        res.redirect('/cart');
        
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }
});

export default router;