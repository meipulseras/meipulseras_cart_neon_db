import compression from 'compression';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Resend } from 'resend';
import path from 'path';
import Randomstring from 'randomstring';
import cartNumeration from './middleware/cartCount.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import verifyJWT from "./middleware/verifyJWT.js";
import getFromTable from './middleware/queries/select.js';
import intoTable from './middleware/queries/insert.js';
import updateTable from './middleware/queries/update.js';
import variables from './js/config.js';
import producto from './productRoutes.js';
import contact from './contactRoutes.js';
import login from './loginRoutes.js';
import info from './infoRoutes.js';
import cart from './cartRoutes.js';
import redisClientInstance from './middleware/redisClient.js';
import deleteShoppingCart from './js/deletecart.js';
import checkPayment from './js/checkpayment.js';
import deleteShoppingCartByTime from './js/deletecartbytime.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

app.set('trust proxy', 2);

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        if (req.headers['cf-connecting-ip']) {
            return req.headers['cf-connecting-ip'];
        }
        return ipKeyGenerator(req, res);
    }
});

const resend = new Resend(process.env.RESEND_KEY);

const whitelist = [
    'https://meipulseras.cl',
    'https://www.meipulseras.cl',
    'https://meipulseras-cart-neon-db.vercel.app',
    'http://localhost:3000'
];


app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        credentials: true
    })
);

app.use(compression());
app.use(cookieParser());

const redisClient = redisClientInstance;

// //express.urlencoded y express.json para que pesque datos de form.html
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');
app.use('/user', info);
app.use('/auth', login);
app.use('/page', contact);
app.use('/', producto);
app.use('/', cart);
app.use('/api/', apiLimiter);
app.use(helmet());

// //Para que pesque imagenes y estilos
app.use(express.static(__dirname + '/public'));

//Indice de aplicacion web, INDEX
app.get('/', async (req, res) => {

    try {
        const token = req.cookies.token;

        const username = verifyJWT(token) == '' ? '' : verifyJWT(token);

        await checkPayment(username);
        await deleteShoppingCartByTime(token, username);

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

        im_1 = variables(1).product_image;
        im_2 = variables(2).product_image;
        im_3 = variables(3).product_image;
        im_4 = variables(4).product_image;
        im_5 = variables(5).product_image;
        im_6 = variables(6).product_image;
        im_7 = variables(7).product_image;
        im_8 = variables(8).product_image;


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

    const token = req.cookies.token;
    const selectedOption = req.body.selectedOption;
    const user = verifyJWT(token);

    try {

        var cart = await redisClient.get(user);

        var jsonCart = JSON.parse(cart);

        jsonCart.envio = selectedOption;
        await redisClient.set(user + 'radiobutton', selectedOption);
        await redisClient.set(user, JSON.stringify(jsonCart));

        res.redirect('/cart');

    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }
});

//Pagar usando flujo transferencia electronica
app.post('/pagar', async (req, res) => {

    const token = req.cookies.token;
    const user = verifyJWT(token);

    try {

        var cart = await redisClient.get(user);
        const carro = JSON.parse(cart);

        var concepto = [];
        var totalToPay = 0;

        for (let x = 0; x < carro.carrito.length; x++) {

            var item = carro.carrito[x];

            concepto.push(item.nombre + ' x ' + item.cantidad)
            totalToPay = totalToPay + (parseInt(item.precio) * parseInt(item.cantidad))

        }

        const subtotalToPay = totalToPay;

        var order = Randomstring.generate(9);

        carro.orden = order;

        await redisClient.set(user, JSON.stringify(carro));

        const emailFromDB = await getFromTable('mail', 'user_info', 'username', user);

        const amount = totalToPay;
        const commerceOrder = order;
        const emailpayer = emailFromDB[0].mail;
        const concept = concepto.toString();

        resend.emails.send({
            from: process.env.MAIL_CONTACTO_MEI,
            to: emailpayer,
            subject: 'Compra Nº Orden ' + commerceOrder,
            html: '<br>' +
                '<br>' +
                '<div style="text-align: center;">' +
                '<img width="300px" src="https://meipulseras.cl/images/webp/logo.webp" alt="logo">' +
                '</div>' +
                '<br>' +
                '<br>' +
                '<div style="text-align: center;">' +
                '<p style="font-family: Quicksand;">Número Orden: ' + commerceOrder + '</p>' +
                '<p style="font-family: Quicksand;">Monto tranferencia electrónica: $' + amount + '</p>' +
                '<br>' +
                '<p style="font-family: Quicksand;">Productos:</p>' +
                '<p style="font-family: Quicksand;">' + concept + '</p>' +
                '<br>' +
                '<p style="font-family: Quicksand;">Datos tranferencia electrónica:</p>' +
                '<p style="font-family: Quicksand;">Giro: ' + process.env.GIRO_MEI + '</p>' +
                '<p style="font-family: Quicksand;">RUT: ' + process.env.RUT_MEI + '</p>' +
                '<p style="font-family: Quicksand;">Email: ' + process.env.MAIL_MEI + '</p>' +
                '<p style="font-family: Quicksand;">Tipo Cuenta: ' + process.env.TIPO_CUENTA_MEI + '</p>' +
                '<p style="font-family: Quicksand;">Número Cuenta: ' + process.env.NRO_CUENTA_MEI + '</p>' +
                '<p style="font-family: Quicksand;">Banco: ' + process.env.BANCO_CUENTA_MEI + '</p>' +
                '<br>' +
                '<p style="font-family: Quicksand;">Cuenta con una hora para realizar la tranferencia electrónica,</p>' +
                '<p style="font-family: Quicksand;">de otra forma su reserva será anulada.</p>' +
                '<p style="font-family: Quicksand;">Una vez pagado, envíe el comprobante de pago a ' + process.env.MAIL_CONTACTO_MEI + ' junto al número de orden de compra: ' + commerceOrder + '.</p>' +
                '<br>' +
                '<p style="font-family: Quicksand;">Atentamente, Mei Pulseras.</p>' +
                '</div>' +
                '<br>' +
                '<br>'
        });

        const saleDate = new Date();
        const formattedDate = saleDate.toISOString().split('T')[0];
        const columns = 'sale_order, cart, subtotal, shipping, total, username, sale_date, paid, ready_to_dispatch';
        const values = [order, JSON.stringify(carro.carrito), subtotalToPay, carro.envio, totalToPay, user, formattedDate, false, false];
        const insertedCart = await getFromTable('username, cart, shipping, sale_date, paid', 'sales', 'paid = $1 AND sale_date = $2 AND username = $3', [false, formattedDate, user]);

        if (JSON.stringify(insertedCart) === '[]' || JSON.stringify(insertedCart).trim() === '') {
            await intoTable('sales', columns, values);
        } else {
            const formattedDateDB = insertedCart[0].sale_date.toISOString().split('T')[0];

            if (!insertedCart[0].paid && formattedDateDB == formattedDate && insertedCart[0].cart !== carro.carrito && insertedCart[0].total !== totalToPay) {
                const set = `sale_order = $1,
                            cart = $2,
                            subtotal = $3, 
                            shipping = $4, 
                            total = $5`;
                const params = [order, JSON.stringify(carro.carrito), subtotalToPay, carro.envio, totalToPay, false, formattedDate, user];
                await updateTable('sales', set, 'paid = $6 AND sale_date = $7 AND username = $8', params);
            }
        }

        res.redirect('/orden');

    } catch (error) {
        const dataError = {
            error: "Hubo un error al iniciar el proceso de pago."
        }

        await redisClient.del(user + 'radiobutton');

        res.status(500).render('notconfirmed', dataError);
    }
});

//Borrar carrito entero
app.post('/borrarcarro', async (req, res) => {
    const token = req.cookies.token;
    const user = verifyJWT(token);
    var deleted = await deleteShoppingCart(user);

    if (deleted) {
        res.status(200).redirect('/');
    }
});

//Contacto Enviado
app.get('/orden', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/waitingpayment.html'));
});

//LOG OUT usuario LOGGED
app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/terms.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}`));