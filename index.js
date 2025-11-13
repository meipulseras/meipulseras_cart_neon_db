import compression from 'compression';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import path from 'path';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Randomstring from 'randomstring';
import cartNumeration from './middleware/cartCount.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import verifyJWT from "./middleware/verifyJWT.js";
import getFromTable from './middleware/queries/select.js';
import intoTable from './middleware/queries/insert.js';
import updateTable from './middleware/queries/update.js';
import variables from './public/js/config.js';
import producto from './productRoutes.js';
import contact from './contactRoutes.js';
import login from './loginRoutes.js';
import info from './infoRoutes.js';
import cart from './cartRoutes.js'
import redisClientInstance from './middleware/redisClient.js';
import isMobile from './public/js/mobile.js';

const app = express();

app.use(compression());
app.use(cookieParser());

const redisClient = redisClientInstance;

const redisStore = new RedisStore( { client: redisClient });

app.use(session({
    store: redisStore,
    name: 'token',
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (60 * 60 * 1000),
        httpOnly: true,
        // secure: process.env.AMBIENTE === "local" ? false : true,
        // sameSite: 'lax',
        path: "/"
    }
}));

// app.use(
//     cors({
//         origin: "https://meipulseras-cart-neon-db.vercel.app/",
//         methods: ['POST', 'GET'],
//         credentials: true
//     })
// );

// //express.urlencoded y express.json para que pesque datos de form.html
app.use(express.urlencoded({extended: true}));

app.use(express.json());
app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');
app.use('/user', info);
app.use('/auth', login);
app.use('/page', contact);
app.use('/', producto);
app.use('/', cart);

// //Para que pesque imagenes y estilos
app.use(express.static(__dirname + '/public'));

//Indice de aplicacion web, INDEX
app.get('/', async (req, res) => {

    try {
        const token = req.session.token;
        
        const username = verifyJWT(token) == '' ? '' : verifyJWT(token);

        var length = await redisClient.get(username);

        const items = username === '' ? '' : cartNumeration(length, username);
        
        let im_1;
        let im_2;
        let im_3;
        let im_4;
        let im_5;
        let im_6;
        let im_7;
        let im_8;

        if(isMobile(req)){
            im_1 = variables(1).product_image_mob;
            im_2 = variables(2).product_image_mob;
            im_3 = variables(3).product_image_mob;
            im_4 = variables(4).product_image_mob;
            im_5 = variables(5).product_image_mob;
            im_6 = variables(6).product_image_mob;
            im_7 = variables(7).product_image_mob;
            im_8 = variables(8).product_image_mob;
        } else {
            im_1 = variables(1).product_image;
            im_2 = variables(2).product_image;
            im_3 = variables(3).product_image;
            im_4 = variables(4).product_image;
            im_5 = variables(5).product_image;
            im_6 = variables(6).product_image;
            im_7 = variables(7).product_image;
            im_8 = variables(8).product_image;
        }

        var data = {
            username: username.charAt(0) + username.slice(1).toLowerCase(),
            count: items,
            prod_1: variables(1).product_name,
            prod_2: variables(2).product_name,
            prod_3: variables(3).product_name,
            prod_4: variables(4).product_name,
            prod_5: variables(5).product_name,
            prod_6: variables(6).product_name,
            prod_7: variables(7).product_name,
            prod_8: variables(8).product_name,
            prec_1: variables(1).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_2: variables(2).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_3: variables(3).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_4: variables(4).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_5: variables(5).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_6: variables(6).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_7: variables(7).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_8: variables(8).product_price.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            imag_1: im_1,
            imag_2: im_2,
            imag_3: im_3,
            imag_4: im_4,
            imag_5: im_5,
            imag_6: im_6,
            imag_7: im_7,
            imag_8: im_8
        };

        res.render('index', data);
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }
});

app.post('/envio', async (req, res) => {

    const token = req.session.token;
    const selectedOption = req.body.selectedOption;
    const user = verifyJWT(token);
       
    try {

        var cart = await redisClient.get(user);

        var jsonCart = JSON.parse(cart);

        const clientRegion = await getFromTable('fullname, address, comune, region, phone, mail', 'user_info', 'username', user);
        const regionPrice = await getFromTable('blue_price', 'regions', 'region_name', clientRegion[0].region);

        if(selectedOption == 'blue'){
            jsonCart.envio = parseInt(regionPrice[0].blue_price);
            await redisClient.set(user+'radiobutton', selectedOption);
            await redisClient.set(user, JSON.stringify(jsonCart));
        } else {
            jsonCart.envio = 0;
            await redisClient.set(user+'radiobutton', selectedOption);
            await redisClient.set(user, JSON.stringify(jsonCart));
        }
            
        res.redirect('/cart');
        
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }
});

function orderParams(params) {
    return Object.keys(params)
    .map(key => key)
    .sort((a,b) => {
        if(a > b) return 1;
        else if (a < b) return -1;
        return 0;
    });
}

//Pagar con Flow
app.post('/pagar', async (req, res) => {

    const token = req.session.token;
    const subtotalToPay = req.body.subtotal;
    const totalToPay = req.body.total;
    const user = verifyJWT(token);

    try {

        var cart = await redisClient.get(user);
        const carro = JSON.parse(cart);

        var concepto = [];

        for(let x = 0; x < carro.carrito.length; x++){

            var item = carro.carrito[x];

            concepto.push(item.nombre + ' x ' + item.cantidad)
            
        }  

        const secretKey = process.env.SECRET_KEY;
        const urlFlow = process.env.URI_FLOW;
        const createPayment = urlFlow + "/payment/create";

        var order = Randomstring.generate(9);

         const emailFromDB = await getFromTable('mail', 'user_info', 'username', user);

        const amount = totalToPay;
        const apiKey =  process.env.API_KEY;
        const commerceOrder = order;
        const currency = "CLP";
        const emailpayer = emailFromDB[0].mail;
        const paymentMethod = "9";
        const subject = concepto.toString();
        const urlConfirmation = process.env.AMBIENTE == "local" ? "http://localhost:3000/confirmed_payment" : process.env.PORT + "/confirmed_payment";
        const urlReturn = process.env.AMBIENTE == "local" ? "http://localhost:3000/result" : process.env.PORT + "/result";

        const params = {
            amount: amount,
            apiKey: apiKey,
            commerceOrder: commerceOrder,
            currency: currency,
            email: emailpayer.toLowerCase(),
            paymentMethod: paymentMethod,
            subject: subject,
            urlConfirmation: urlConfirmation,
            urlReturn: urlReturn
        }

        const keys = orderParams(params);

        let data = [];

        keys.map(key => {
            data.push(key + "=" + params[key])
        });

        data = data.join("&");

        const signed = CryptoJS.HmacSHA256(data, secretKey);

        let response = await axios.post(createPayment, `${data}&s=${signed}`)
                    .then(response => {
                        return {
                            output: response.data,
                            info: {
                                http_code: response.status
                            }
                        }
                    });
        
        const saleDate = new Date();
        const formattedDate = saleDate.toISOString().split('T')[0];
        const columns = 'sale_order, cart, subtotal, shipping, total, username, sale_date, paid, ready_to_dispatch';
        const values = `'${order}', '${JSON.stringify(carro.carrito)}', ${subtotalToPay}, ${carro.envio}, ${totalToPay}, '${user}', '${formattedDate}', ${false}, ${false}`;
        const insertedCart = await getFromTable('username, cart, shipping, sale_date, paid', 'sales', `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);

        if(JSON.stringify(insertedCart) === '[]' || JSON.stringify(insertedCart).trim() === ''){
            await intoTable('sales', columns, values);
        } else {
            const formattedDateDB = insertedCart[0].sale_date.toISOString().split('T')[0];

            if(!insertedCart[0].paid && formattedDateDB == formattedDate && insertedCart[0].cart !== carro.carrito && insertedCart[0].total !== totalToPay){
                const set = `sale_order = '${order}',
                            cart = '${JSON.stringify(carro.carrito)}',
                            subtotal = '${subtotalToPay}', 
                            shipping = '${carro.envio}', 
                            total = '${totalToPay}'`;

                await updateTable('sales', set, `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);
            }
        }

        const redirectTo = response.output.url + "?token=" + response.output.token;
        
        res.redirect(redirectTo);
        
    } catch (error) {
        const dataError = {
            error: "Hubo un error al iniciar el proceso de pago. Revise las transacciones de su banco para verificar si se cursó el pago. Si no se cursó el pago, intente nuevamente la compra."
        }

        await redisClient.del(user+'radiobutton');

        res.status(500).render('notconfirmed', dataError);
    }
});

//Borrar carrito entero
app.post('/borrarcarro', async (req, res) => {

    const token = req.session.token;
    const user = verifyJWT(token);
    
    try {

        await redisClient.del(user);
        await redisClient.del(user+'radiobutton');
        
        res.redirect('/');

    } catch (error) {
        res.json([ error ]);
    }
});

//Resultado de compra FLOW
app.post('/result', async (req, res) => {

    const apiKey = process.env.API_KEY;

    console.log(apiKey);

    try {

        const token = req.session.token;

        const user = verifyJWT(token);

        console.log(token);
        console.log(user);

        const params = {
            token: req.body.token,
            apiKey: apiKey
        }

        const secretKey = process.env.SECRET_KEY;
        const urlFlow = process.env.URI_FLOW;
        const getPayment = urlFlow + "/payment/getStatus";

        const keys = orderParams(params);

        let data = [];

        keys.map(key => {
            data.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
        });

        data = data.join("&");

        let s = [];

        keys.map(key => {
            s.push(key + "=" + params[key])
        });

        s = s.join("&");

        const signed = CryptoJS.HmacSHA256(s, secretKey);

        const urlGet = getPayment + "?" + data + "&s=" + signed;

        let response = await axios.get(urlGet)
                    .then(response => {
                        return {
                            output: response.data,
                            info: {
                                http_code: response.status
                            }
                        }
                    });
        
        const saleDate = new Date();

        const formattedDate = saleDate.toISOString().split('T')[0];

        const insertedCart = await getFromTable('cart, subtotal, shipping, total', 'sales', `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);

        if(response.info.http_code = 200) {

            const set = `paid = ${true}`;
                    
            const comp1 = `cart = '${insertedCart[0].cart}' 
                        AND sale_order = '${response.output.commerceOrder}' 
                        AND subtotal = '${insertedCart[0].subtotal}' 
                        AND shipping = '${insertedCart[0].shipping}' 
                        AND total = '${insertedCart[0].total}' 
                        AND paid = ${false} 
                        AND sale_date = '${formattedDate}' 
                        AND username`;

            await updateTable('sales', set, comp1, user);

            await redisClient.set(user+'Order', response.output.commerceOrder);
            
            res.status(200).redirect('/confirmed');
        
        } else {
            await redisClient.set(user, insertedCart[0].cart);
        }
        
    } catch (error) {

        console.log(error);

        const dataError = {
            error: "Hubo un error al procesar su pago. Revise las transacciones de su banco para verificar si se cursó el pago. Si no se cursó el pago, intente nuevamente la compra."
        }

        res.status(500).render('notconfirmed', dataError);
    }
});

//Resultado MeiPulseras a clientes
app.get('/confirmed', async (req, res) => {

    const token = req.session.token;
    const user = verifyJWT(token);

    try {

        var length = await redisClient.get(user);

        const items = cartNumeration(length, user);

        var order = await redisClient.get(user+'Order');

        if(order === null) {
            return res.status(401).redirect('/');
        }

        var array = await getFromTable('cart, subtotal, shipping, total', 'sales', `sale_order = '${order}' AND username`, user);

        const data = {
            array: array[0].cart,
            subtotal: array[0].subtotal,
            envio: array[0].shipping,
            total: array[0].total,
            count: 0
        }

        const saleDate = new Date();
        const formattedDate = saleDate.toISOString().split('T')[0];

        const insertedCart = await getFromTable('cart, paid, sale_order', 'sales', `sale_order = '${order}' AND paid = ${true} AND sale_date = '${formattedDate}' AND username`, user);

        if(insertedCart[0].paid && insertedCart[0].sale_order !== 0){

            await redisClient.del(user);
            
            await redisClient.del(user+'Order');

            var jsonCart = JSON.parse(insertedCart[0].cart);

            for(let x = 0; x < jsonCart.length; x++){

                var item = jsonCart[x];

                var stockDB = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', item.id);

                var newStock = parseInt(stockDB[0].product_quantity) - parseInt(item.cantidad);

                const set = `product_quantity = ${newStock}`;
                await updateTable('price_quantity_products', set, 'product_id', item.id);
                
            }

            await redisClient.del(user+'radiobutton');

            res.status(200).render('confirmed', data);
            
        } else {
            await redisClient.set(user, insertedCart[0].cart);
        }
    } catch (error) {
        const dataError = {
            error: "Hubo un error al confirmar su pago. Revise las transacciones de su banco para verificar el pago y el correo electrónico de Flow y envíe un contacto con su Número de orden de comercio para que confirmemos el pago."
        }

        await redisClient.del(user+'radiobutton');

        res.status(500).render('notconfirmed', dataError);
    }
});

//LOG OUT usuario LOGGED
app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/terms.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}`));