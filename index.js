import { Resend } from 'resend';
import express from 'express';
import session from 'express-session';
import path from 'path';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Randomstring from 'randomstring';
import cartNumeration from './middleware/cartCount.js';
import cartDuration from './middleware/cartSession.js';
import {utcToZonedTime} from 'date-fns-tz';
import ProductQuantity from './models/ProductQuantity.js';
import Cart from './models/Cart.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { config } from "dotenv";
import mongoose from "mongoose";
import verifyJWT from "./middleware/verifyJWT.js";
import authRouter from "./authorization.js";
import userInfo from "./setUserInfo.js";
import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_DB_URI;


const app = express();
config();

mongoose.connect(process.env.MONGODB_URL).then( () => {
    console.log("Conectado a la DB de Mongo");
});

app.use(session({
    name: 'token',
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: (60 * 60 * 1000),
        httpOnly: true,
        path: "/"
    }
}));

//express.urlencoded y express.json para que pesque datos de form.html
app.use(express.urlencoded({extended: true}));

app.use(express.json());
app.use('/auth', authRouter);
app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');
app.use('/user', userInfo);

const resend = new Resend(process.env.RESEND);

//Para que pesque imagenes y estilos
app.use(express.static(__dirname + '/public'));

let client = new MongoClient(uri);
let clientPromise = client.connect();

app.get('/', async (req, res) => {

    try {
        const token = req.session.token;
        
        const db = (await clientPromise).db("test");

        const prod1 = await db.collection("products").findOne({ productid: "PrMP1"});
        const prod2 = await db.collection("products").findOne({ productid: "PrMP2"});
        const prod3 = await db.collection("products").findOne({ productid: "PrMP3"});
        const prod4 = await db.collection("products").findOne({ productid: "PrMP4"});
        const prod5 = await db.collection("products").findOne({ productid: "PrMP5"});
        const prod6 = await db.collection("products").findOne({ productid: "PrMP6"});
        const prod7 = await db.collection("products").findOne({ productid: "PrMP7"});
        const prod8 = await db.collection("products").findOne({ productid: "PrMP8"});
        const prod9 = await db.collection("products").findOne({ productid: "PrMP9"});
        const prod10 = await db.collection("products").findOne({ productid: "PrMP10"});
        const prod11 = await db.collection("products").findOne({ productid: "PrMP11"});
        const prod12 = await db.collection("products").findOne({ productid: "PrMP12"});

        const username = verifyJWT(token) == '' ? 'index' : verifyJWT(token);

        if(username != 'index') {
            cartDuration(username);
        }

        const items = await cartNumeration(username);

        var data = {
            username: username,
            count: items,
            prod_1: prod1.productname,
            prod_2: prod2.productname,
            prod_3: prod3.productname,
            prod_4: prod4.productname,
            prod_5: prod5.productname,
            prod_6: prod6.productname,
            prod_7: prod7.productname,
            prod_8: prod8.productname,
            prod_9: prod9.productname,
            prod_10: prod10.productname,
            prod_11: prod11.productname,
            prod_12: prod12.productname,
            prec_1: prod1.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_2: prod2.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_3: prod3.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_4: prod4.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_5: prod5.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_6: prod6.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_7: prod7.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_8: prod8.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_9: prod9.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_10: prod10.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_11: prod11.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            prec_12: prod12.productprice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
            imag_1: prod1.productimage,
            imag_2: prod2.productimage,
            imag_3: prod3.productimage,
            imag_4: prod4.productimage,
            imag_5: prod5.productimage,
            imag_6: prod6.productimage,
            imag_7: prod7.productimage,
            imag_8: prod8.productimage,
            imag_9: prod9.productimage,
            imag_10: prod10.productimage,
            imag_11: prod11.productimage,
            imag_12: prod12.productimage,
        };

        res.render('index', data);
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }

    
});

app.get('/cart', async (req, res) => {

    try {
        const token = req.session.token;

        const user = verifyJWT(token);

        cartDuration(user);
        const items = await cartNumeration(user);

        if(user == ''){
            return res.status(401).redirect('/');
        }
    
        const db = (await clientPromise).db("test");

        const prodtosell = await db.collection("carts").aggregate([
            {
                $lookup: {
                    from: 'productquantities',
                    localField: "products",
                    foreignField: "_id",
                    as: "shopping"
                }
            },
            {
                $match: { username: user, active: true, sold: false }
            },
            {
                $project: {
                    _id: '$shopping._id',
                    productid: '$shopping.productid',
                    productname: '$shopping.productname',
                    productprice: '$shopping.productprice',
                    productquantity: '$shopping.productquantity',
                    producttotalamount: { $sum: '$shopping.producttotalamount'}
                }
            },
        ]).toArray();

        var dataArray = []

        const clientData = await db.collection("userinfos").findOne({ username: user});

        const clientName = clientData.fullname;
        const clientAddress = clientData.address;
        const clientComune = clientData.comune;
        const clientRegion = clientData.region;
        const clientPhone = clientData.phone;
        const clientMail = clientData.mail;

        const regionPrice = await db.collection("blues").findOne({ region: clientRegion});

        if(prodtosell.length > 0){
            const pid = prodtosell[0]._id;
            const productid = prodtosell[0].productid;
            const pname = prodtosell[0].productname;
            const pprice = prodtosell[0].productprice;
            const pquantity = prodtosell[0].productquantity;
            const ptotal = prodtosell[0].producttotalamount;

            for(let i = 0; i < prodtosell[0].productid.length; i++){
                dataArray.push({ "nombre": pname[i], "precio": pprice[i], "cantidad": pquantity[i], "id": pid[i] });
            }

            const data = {
                username: user,
                clientname: clientName,
                clientaddress: clientAddress,
                clientcomune: clientComune,
                clientregion: clientRegion,
                clientphone: clientPhone,
                clientmail: clientMail,
                clientshipmentprice: regionPrice.priceregion,
                array: JSON.stringify(dataArray),
                count: items,
                subtotal: ptotal,
                total: (ptotal + regionPrice.priceregion)
            };
            
            if(data.username == ''){
                return res.status(401).redirect('/');
            } else {
                res.render('cart', data);
            }
        } else {
            res.redirect('/');
        }

    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }

});

app.post('/cart', async (req, res) => {

    const token = req.session.token;
    const idtochange = req.body.cart;
    const prodqty = parseInt(req.body.prodquantity);
    const user = verifyJWT(token);
   
    try {

        if(prodqty == 0){

            await Cart.updateMany({username: user, active: true, sold: false}, 
                {
                    $pull: {
                        products: idtochange
                    }
            });

            const price = await ProductQuantity.deleteOne({ _id: idtochange});

            const cartToDeleteProducts = await Cart.findOne({username: user, active: true, sold: false});

            if(cartToDeleteProducts.products.length == 0){
                await Cart.updateOne({username: user, active: true, sold: false}, 
                    { 
                        $set: { active: false }
                    });
            }

            return res.redirect('/cart');
            
        }

        const price = await ProductQuantity.findOne({ _id: idtochange}, {_id: 0, productprice: 1});

        const subtotal = (price.productprice * prodqty);

        const cartProduct = await ProductQuantity.updateOne({ _id: idtochange}, 
            { 
                $set: { productquantity: prodqty,
                    producttotalamount: subtotal
                }
            });

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

app.post('/pagar', async (req, res) => {

    const token = req.session.token;

    const user = verifyJWT(token);

    const db = (await clientPromise).db("test");

    const clientData = await db.collection("userinfos").findOne({ username: user});

    const clientRegion = clientData.region;
       
    const regionPrice = await db.collection("blues").findOne({ region: clientRegion});

    await Cart.updateOne({username: user, active: true, waitingpayment: false, sold: false}, 
        { 
            $set: { waitingpayment: true }
        });

    const carToPay = await db.collection("carts").aggregate([
        {
            $lookup: {
                from: 'productquantities',
                localField: "products",
                foreignField: "_id",
                as: "shopping"
            }
        },
        {
            $match: { username: user, active: true, waitingpayment: true, sold: false }
        },
        {
            $project: {
                _id: '$shopping._id',
                productid: '$shopping.productid',
                productname: '$shopping.productname',
                productprice: '$shopping.productprice',
                productquantity: '$shopping.productquantity',
                producttotalamount: { $sum: '$shopping.producttotalamount'}
            }
        },
    ]).toArray();

    const totalToPay = (carToPay[0].producttotalamount + regionPrice.priceregion);

    await Cart.updateOne({username: user, active: true, waitingpayment: true, sold: false}, 
        { 
            $set: { total: totalToPay }
        });

    const secretKey = process.env.SECRET_KEY;
    const urlFlow = "https://sandbox.flow.cl/api";
    const createPayment = urlFlow + "/payment/create";

    const amount = totalToPay;
    const apiKey =  process.env.API_KEY;
    const commerceOrder = Randomstring.generate(7);
    const currency = "CLP";
    const email = "wynegsrhuntar@gmail.com";
    const paymentMethod = "9";
    const subject = "Prueba Mei Pulseras";
    const urlConfirmation = "http://localhost:3000/confirmedpayment";
    const urlReturn = "http://localhost:3000/result";
    
    const params = {

        "amount": amount,
        "apiKey": apiKey,
        "commerceOrder": commerceOrder,
        "currency": currency,
        "email": email,
        "paymentMethod": paymentMethod,
        "subject": subject,
        "urlConfirmation": urlConfirmation,
        "urlReturn": urlReturn
    }

    const keys = orderParams(params);

    let data = [];

    keys.map(key => {
        data.push(key + "=" + params[key])
    });

    data = data.join("&");

    const signed = CryptoJS.HmacSHA256(data, secretKey);

    console.log(data)

    let response = await axios.post(createPayment, `${data}&s=${signed}`)
                .then(response => {
                    return {
                        output: response.data,
                        info: {
                            http_code: response.status
                        }
                    }
                });

    
    const redirectTo = response.output.url + "?token=" + response.output.token;

    console.log(redirectTo);
    
    res.redirect(redirectTo);

});

app.post('/result', async (req, res) => {

    const apiKey = process.env.API_KEY;

    const params = {
        token: req.body.token,
        apiKey: apiKey
    }

    const secretKey = process.env.SECRET_KEY;

    const urlFlow = "https://sandbox.flow.cl/api";
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

    if(response.info.http_code = 200){
        res.status(200).redirect('/confirmedpayment');
    }

});

app.get('/confirmedpayment', async (req, res) => {
    const token = req.session.token;
    const user = verifyJWT(token);

    const soldCart = await Cart.findOne({username: user, active: true, waitingpayment: true, sold: false});

    let productosVendidos = await Promise.all(soldCart.products.map(product => ProductQuantity.findOne({_id: product}, {_id: 0, productname: 1, productquantity: 1})));

    console.log(productosVendidos);

    const data = {
        total: soldCart.total,
        productos: productosVendidos
    }

    await Cart.updateOne({username: user, active: true, waitingpayment: true, sold: false}, 
        { 
            $set: { active: false, waitingpayment: false, sold: true }
        });

    res.render('confirmed', data);
});


app.get('/personal', async (req, res) => {

    try {
        const token = req.session.token;
        const user = verifyJWT(token);
        const items = await cartNumeration(user);

        const data = {
            username: user,
            count: items
        };


        cartDuration(data.username);

        if(data.username == ''){
            return res.status(401).redirect('/');
        } else {
            res.render('personal', data);
        }

    } catch (error) {
        res.status(500).redirect('/');
    }
});

// app.get('/english', (req, res) => {
//     res.sendFile(path.join(__dirname + '/views/english.html'));
// });

// app.get('/pricing', (req, res) => {
//     res.sendFile(path.join(__dirname + '/views/formenglish.html'));
// });

app.get('/producto/:productnumber', async (req, res) => {

    const numproduct = req.params['productnumber'];

    const token = req.session.token;

    try {

        const data = verifyJWT(token);

        cartDuration(data);

        const items = await cartNumeration(data);
        
        if(data == ''){
            return res.status(401).redirect("/auth/login");
        }

        const db = (await clientPromise).db("test");

        const prodtosell = await db.collection("products").find({productid: 'PrMP' + numproduct}).toArray();

        const image = prodtosell[0].productimage;
        const id = prodtosell[0].productid;
        const name = prodtosell[0].productname;
        const description = prodtosell[0].productdescription;
        const price = prodtosell[0].productprice;
        const stock = prodtosell[0].productstock;

        var prod = {
            username: data,
            count: items,
            prodid: id,
            prodimage: image,
            prodname: name,
            proddescription: description,
            prodprice: price,
            prodstock: stock,
            prodnumber: numproduct
        }

        res.render('producto', prod);
        
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }    

});

app.post('/producto/', async (req, res) => {

    const token = req.session.token;
    const prodquantity = req.body.prodquantity;
    const prodnumber = req.body.prodnumber;
    
    const date = new Date();

    try {

        const username = verifyJWT(token);

        if(username == ''){
            return res.status(401).redirect("/auth/login");
        }

        const db = (await clientPromise).db("test");

        const prodtosell = await db.collection("products").find({productid: 'PrMP' + prodnumber}).toArray();

        const prodid = prodtosell[0].productid;
        const prodname = prodtosell[0].productname;
        const prodprice = prodtosell[0].productprice;
        const prodamount = (prodprice * prodquantity);
        const prodstock = prodtosell[0].productstock;
 
        const shoppingProd = new ProductQuantity({productid: prodid, productname: prodname, productprice: prodprice, productquantity: prodquantity, producttotalamount: prodamount});
        shoppingProd.save();

        const newCart = await Cart.findOne({username: username, active: true, waitingpayment: false, sold: false});

        if(newCart == null){
            const cart = new Cart({token: token, username: username, sellsdate: date, products: shoppingProd, total: 0});
            cart.save();
        } else {

            // Con esto puedo crear un nuevo ObjectId
            newCart.products.push(shoppingProd._id);
            newCart.save();

        }

    const newProductStock = prodstock - prodquantity;

    await db.collection("products").updateOne({productid: 'PrMP' + prodnumber},
        { 
            $set: { productstock: newProductStock }
        }
    );

    res.redirect('/producto/' + prodnumber);

    }catch(error){
        console.log(error)
        res.status(500).redirect('/');
    }
});

app.get('/forgot', (req, res) => {

    res.sendFile(path.join(__dirname + '/views/forgot.html'));

});

app.get('/contact', (req, res) => {

    try {
        const token = req.session.token;
        var data = {
            username: verifyJWT(token)
        };

        cartDuration(data.username);

        if(data.username == ''){
            data = {
                username: 'index'
            };
        }

        res.render('form', data);
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }
});

app.post("/contact", (req, res) => {

    const userName = req.body.name;
    const userMail = req.body.mail;
    const phone = req.body.phone;
    const comment = req.body.comment;

    const fecha = new Date().toLocaleDateString('es-CL', { timezone: 'America/Adak' });

    /* const hora = new Date().toLocaleTimeString('en-US', { timezone: 'America/Adak' }); */

    const hora = utcToZonedTime(new Date(), 'America/Santiago').toLocaleTimeString();

    /* console.log(fecha +' '+hora); */

        try {
            resend.emails.send({
                from: 'contacto@meipulseras.cl',
                to: 'meipulseras@gmail.com',
                subject: 'Contacto ' + fecha + ' ' + hora,
                html: '<ol>'+
                '<li><b>Nombre completo:</b> '+userName+'</li>'+
                '<li><b>Teléfono:</b> '+phone+'</li>'+
                '<li><b>Email:</b> '+userMail+'</li>'+
                '</ol>'+
                '<p><b>'+userName+' te contacta por:</b></p>'+
                '<p><b>Comentario:</b> '+comment+'</p>'
            });
    
            res.redirect('/enviado');

        } catch (e) {
            console.log(e);
            res.redirect('/noenviado');
        } 
    
});

app.get('/enviado', (req, res) => {

    res.sendFile(path.join(__dirname + '/views/ok.html'));

});

app.get('/noenviado', (req, res) => {

    res.sendFile(path.join(__dirname + '/views/error.html'));

});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}, http://localhost:${port}`));