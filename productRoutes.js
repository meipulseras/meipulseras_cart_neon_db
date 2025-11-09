import express from 'express';
import compression from 'compression';
import verifyJWT from './middleware/verifyJWT.js'
import cartNumeration from './middleware/cartCount.js';
import getProductDetail from './middleware/queries/productsDetails.js'
import variables from './public/js/config.js';
import redisClientInstance from './middleware/redisClient.js';
import isMobile from './public/js/mobile.js';


const router = express.Router();

router.use(compression());

const redisClient = redisClientInstance;

//Ruta PRODUCTO
router.get('/producto/:productnumber', async (req, res) => {

    const numproduct = req.params['productnumber'];
    const token = req.session.token;

    try {

        const data = verifyJWT(token) == '' ? '' : verifyJWT(token);

        var length = await redisClient.get(data);
 
        const items = data === '' ? '' : cartNumeration(length, data);

        const prodtosell = await getProductDetail(numproduct);

        const image = isMobile(req) ? variables(numproduct).product_image_mob : variables(numproduct).product_image;
        const id = variables(numproduct).product_id;
        const name = variables(numproduct).product_name;
        const description = variables(numproduct).product_description;
        const price = variables(numproduct).product_price;
        const stock = prodtosell.product_quantity;

        let carrito;

        let prodcantidad = 0;

        if(length !== null) {
            carrito = JSON.parse(length).carrito;

            for(let i = 0; i < carrito.length; i++) {
                const item = carrito[i];
                if(item.id === 'PrMP' + numproduct){
                    prodcantidad = item.cantidad;
                }
            }
        }
        
        var prod = {
            username: data.charAt(0) + data.slice(1).toLowerCase(),
            count: items,
            prodid: id,
            prodimage: image,
            prodname: name,
            proddescription: description,
            prodprice: price,
            prodstock: stock,
            prodnumber: numproduct,
            prodquantity: prodcantidad
        }

        res.render('producto', prod);
        
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }    

});

router.post('/producto/', async (req, res) => {

    const token = req.session.token;
    let prodquantity = parseInt(req.body.prodquantity);
    const prodnumber = req.body.prodnumber;

    const username = verifyJWT(token);
    
    try {

        var length = await redisClient.get(username);

        const items = cartNumeration(length, username);

        if(username == ''){
            return res.status(401).redirect("/login");
        }

        var cart = [];

        var shippment = 0;

        if(length === undefined || length === null) {
            cart = [];
        } else {
            cart = JSON.parse(length).carrito;
            shippment = JSON.parse(length).envio;
        }

        for(let x = 0; x <= cart.length; x++){

            var object = cart[x];
            
            for(var producto in object){
                if(object.id === ('PrMP' + prodnumber)){
                    prodquantity = (parseInt(prodquantity) + parseInt(cart[x].cantidad));
                    const index = cart.indexOf(object);
                    if(index > -1){
                        cart.splice(index, 1);
                    }
                    break;
                }
            }
        }

        var cartItems = await getProductDetail(prodnumber);

        let datosVenta =  {
            imagen: variables(prodnumber).product_image,
            nombre: variables(prodnumber).product_name,
            precio: parseInt(variables(prodnumber).product_price),
            cantidad: prodquantity,
            stock: parseInt(cartItems.product_quantity),
            id: variables(prodnumber).product_id
        };
        
        cart.push(datosVenta);

        let carro = {
            envio: shippment,
            carrito: cart
        }

        var stringfiedCart = JSON.stringify(carro);

        await redisClient.set(username, stringfiedCart);

    res.redirect('/producto/' + prodnumber);

    }catch(error){
        console.log(error)
        res.status(500).redirect('/');
    }
});

export default router;