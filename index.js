import compression from 'compression';
import { Resend } from 'resend';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import path from 'path';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Randomstring from 'randomstring';
import cartNumeration from './middleware/cartCount.js';
import { comparePassword, hashPassword } from './hash/hashing.js';
import { toZonedTime } from 'date-fns-tz';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import verifyJWT from "./middleware/verifyJWT.js";
import getProductDetail from './middleware/queries/productsDetails.js'
import getFromTable from './middleware/queries/select.js';
import intoTable from './middleware/queries/insert.js';
import updateTable from './middleware/queries/update.js';
import deleteFromTable from './middleware/queries/delete.js'

const app = express();

app.use(compression());

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Error Cliente Redis', err));
redisClient.connect().catch(console.error);

const redisStore = new RedisStore( { client: redisClient });

const resend = new Resend(process.env.RESEND_KEY);

app.use(session({
    store: redisStore,
    name: 'token',
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (60 * 60 * 1000),
        httpOnly: true,
        path: "/"
    }
}));

app.use(
    cors({
        origin: process.env.PORT || 3000,
        methods: ['POST', 'GET'],
        credentials: true
    })
);

// //express.urlencoded y express.json para que pesque datos de form.html
app.use(express.urlencoded({extended: true}));

app.use(express.json());
app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');

// //Para que pesque imagenes y estilos
app.use(express.static(__dirname + '/public'));

//Indice de aplicacion web, INDEX
app.get('/', async (req, res) => {

    try {
        const token = req.session.token;
        
        const username = verifyJWT(token) == '' ? 'index' : verifyJWT(token);

        // var length = await getFromTable('cart', 'user_cart', 'username', username);

        var length = await redisClient.get(username);

        const items = cartNumeration(length, username);    

        var data = {
            username: username,
            count: items,
            prod_1: 'Pulseras para compartir',
            prod_2: 'Amuleto protector',
            prod_3: 'Pulseras para compartir',
            prod_4: 'Pulsera macramé',
            prod_5: 'Pulseras para compartir',
            prod_6: 'Pulseras para compartir',
            prod_7: 'Pulsera cuarzo rosa',
            prod_8: 'Pulsera macramé',
            prec_1: '6.500',
            prec_2: '3.500',
            prec_3: '6.500',
            prec_4: '3.500',
            prec_5: '5.500',
            prec_6: '5.500',
            prec_7: '5.500',
            prec_8: '5.500',
            imag_1: '/images/webp/1image.webp?v=2',
            imag_2: '/images/webp/2image.webp?v=2',
            imag_3: '/images/webp/3image.webp?v=2',
            imag_4: '/images/webp/4image.webp?v=2',
            imag_5: '/images/webp/5image.webp?v=2',
            imag_6: '/images/webp/6image.webp?v=2',
            imag_7: '/images/webp/7image.webp?v=2',
            imag_8: '/images/webp/8image.webp?v=2'
        };

        res.render('index', data);
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }
});

//Carga pagina LOGIN
app.get('/login', (req, res) => {
    const data = {no: 'no'};
    res.render('login', data);
});

//Ruta login - Acceso de usuario
app.post("/login", async (request, response) => {
    const credential = request.body.user;
    const password = request.body.pass;

    try {
        const credentialType = credential.includes('@') ? 'mail' : 'username';

        const user = await getFromTable('username, password, mail', 'user_info', credentialType, credential);

        if(!comparePassword(password, user[0].password)){
            const data = {no: 'yes'};
            return response.render('login', data);
        }

        //Generar Token JWT
        const token = jwt.sign(
            { id: user[0].mail, username: user[0].username },
            process.env.JWT_SECRET,
            {
                expiresIn: '6h'
            }
        );

        request.session.token = token;

        response.redirect('/personal');

    } catch (error) {
        console.log(error)
        response.status(500).redirect('/login');    
    }
});

const newRut = (rut) => {
    const numRut = rut.indexOf('-');
    const numbers = rut.substring(0, numRut - 3);
    const numbers3 = rut.substring(numRut - 3, numRut);
    const verifNum = rut.substring(numRut + 1, numRut + 2);

    var newNumbers = '';

    for(const char of numbers) {
        newNumbers = newNumbers + '*';
    }

    const newRut = newNumbers + numbers3 + '-' + verifNum;

    return newRut;
}

const newMail = (mail) => {
    const arrobaMail = mail.indexOf('@');
    const mailInit = mail.substring(0, arrobaMail - 3);
    const mail3 = mail.substring(arrobaMail - 3, arrobaMail);
    const afterArroba = mail.substring(arrobaMail + 1, mail.length);

    var newMailInit = '';

    for(const char of mailInit) {
        newMailInit = newMailInit + '*';
    }

    const newmail = newMailInit + mail3 + '@' + afterArroba;

    return newmail;
}

//Ruta Signup - Info de Usuario(s)
app.get("/user/info", async (req, res) => {

    const token = req.session.token;
    
    try {
        const data = verifyJWT(token);

        // var length = await getFromTable('cart', 'user_cart', 'username', data);

        var length = await redisClient.get(data);

        const items = cartNumeration(length, data);

        if(data == ''){
            return res.status(401).redirect("/auth/logout");
        }

        const datos = await getFromTable('fullname, birthdate, address, comune, region, country, phone, mail, rut', 'user_info', 'username', data);

        const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago' };

        const dataUser = {
            fullname: datos[0].fullname,
            birthdate: datos[0].birthdate.toLocaleDateString('es-CL', dateOptions).replace(/\//g, '-'),
            address: datos[0].address,
            comune: datos[0].comune,
            region: datos[0].region,
            country: datos[0].country,
            phone: datos[0].phone,
            mail: newMail(datos[0].mail),
            rut: newRut(datos[0].rut),
            count: items,
            problem: 'no'
        }
        
        res.render('userinfo', dataUser);

    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }

});

//Actualizar datos usuario LOGGED
app.post("/user/info", async (req, res) => {

    const onlyLettersSpaces = /^[a-zA-Z ]+$/;
    const onlyLettersNumbersSpaces = /^[a-zA-Z0-9 ]+$/;
    const plusNumbers = /^\+?\d+$/;

    const token = req.session.token;

    const fullnameRB = req.body.fullname;
    const addressRB = req.body.address;
    const comuneRB = req.body.comune;
    const regionRB = req.body.region;
    const countryRB = req.body.country;
    const phoneRB = req.body.phone;

    try {

        const data = verifyJWT(token);

        var length = await redisClient.get(data);

        const items = cartNumeration(length, data);
        
        if(data == ''){
            return res.status(401).redirect("/auth/logout");
        }

        var erroresValidar = 0;

        if(!onlyLettersSpaces.test(fullnameRB)){
            erroresValidar++;
        }

        if(!onlyLettersNumbersSpaces.test(addressRB)){
            erroresValidar++;
        }

        if(!onlyLettersSpaces.test(comuneRB)){
            erroresValidar++;
        }
        
        if(!onlyLettersSpaces.test(countryRB)){
            erroresValidar++;
        }

        if(!plusNumbers.test(phoneRB)){
            erroresValidar++;
        }

        async function actualizar(code){
            const datos = await getFromTable('fullname, birthdate, address, comune, region, country, phone, mail, rut', 'user_info', 'username', data);

            const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago' };

            const userData = {
                fullname: datos[0].fullname,
                birthdate: datos[0].birthdate.toLocaleDateString('es-CL', dateOptions).replace(/\//g, '-'),
                address: datos[0].address,
                comune: datos[0].comune,
                region: datos[0].region,
                country: datos[0].country,
                phone: datos[0].phone,
                mail: newMail(datos[0].mail),
                rut: newRut(datos[0].rut),
                count: items,
                problem: code
            }
            
            return res.render('userinfo', userData);
        }   

        if(erroresValidar === 0) {
            const set = `fullname = '${fullnameRB}', 
                address = '${addressRB}', 
                comune = '${comuneRB}', 
                region = '${regionRB}',
                country = '${countryRB}', 
                phone = '${phoneRB}'`;

            await updateTable('user_info', set, 'username', data);

            actualizar('ok');
        } else {
            actualizar('yes');
            
        }
        
    } catch (error) {
        res.status(500).redirect('/');
    }

});

//Nuevo password
app.post("/user/newpass", async (req, res) => {

    const oldpass = req.body.oldpass;
    const newpass = req.body.newpass;
    const token = req.session.token;

    try {
        const data = verifyJWT(token);

        if(data == ''){
            return res.status(401).redirect("/auth/logout");
        }

        const user = await getFromTable('password', 'user_info', 'username', data);

        var password = '';

        if(comparePassword(oldpass, user[0].password)){
            password = hashPassword(newpass);
        }

        const set = `password = '${password}'`;

        await updateTable('user_info', set, 'username', data);

        return res.status(201).redirect("/auth/logout");


    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }
});

//Acceso recuperación password
app.get('/forgot', (req, res) => {

    const data = {no: 'no'};
    res.render('forgot', data);
});

//Recuperación password
app.post("/auth/forgot", async (req, res) => {
    try {
        const username = req.body.user;
        const email = req.body.mail;

        const user = await getFromTable('mail', 'user_info', 'username', username);

        var random = '';

        if(user[0].mail == email){
            random = Randomstring.generate(7);
        } else {
            const data = {no: 'yes'};
            return res.render('forgot', data);
        }

        const password = hashPassword(random);

        const set = `password = '${password}'`;

        await updateTable('user_info', set, 'username', username);

        resend.emails.send({
            from: 'contacto@meipulseras.cl',
            to: email,
            subject: 'Recuperación de contraseña',
            html: '<br>'+
                '<br>'+      
                '<div style="text-align: center;">'+
                    '<img width="300px" src="https://meipulseras.cl/images/webp/logo.webp" alt="logo">'+
                '</div>'+
                '<br>'+
                '<br>'+
                '<div style="text-align: center;">'+
                '<p style="font-family: Quicksand;">Su contraseña provisoria es: ' + random + '</p>'+
                    '<p style="font-family: Quicksand;">Por favor, inicie sesión y cambie la contraseña provisoria por una nueva.</p>'+
                '</div>'+
                '<br>'+
                '<br>'
        });
        
        return res.status(201).redirect('/');
        
    } catch (error) {
        res.status(500).redirect('/');
    }
});

//LOG OUT usuario LOGGED
app.get('/auth/logout', async (req, res) => {

    const token = req.session.token;

    const user = verifyJWT(token);

    await redisClient.del(user);

    res.status(200).clearCookie('token', "", {
        path: "/"
    });
    
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

//Informacion personal de usuario LOGGED
app.get('/personal', async (req, res) => {

    try {
        const token = req.session.token;
        const user = verifyJWT(token);
        
        // var length = await getFromTable('cart', 'user_cart', 'username', user);

        var length = await redisClient.get(user);

        const items = cartNumeration(length, user);

        const data = {
            username: user,
            count: items
        };

        if(data.username == ''){
            return res.status(401).redirect('/');
        } else {
            res.render('personal', data);
        }

    } catch (error) {
        res.status(500).redirect('/');
    }
});

//Ruta Signup - Formulario registro usuario
app.get('/signup', async (req, res) => {

    try {

        const region = await getFromTable('region_name', 'regions', null, null);

        const data = {
            registrado: 'no',
            region: JSON.stringify(region)
        }

        res.render('register', data);
    } catch (error) {
        res.status(500).redirect('/');
    }
});

//Ruta Signup - Registro de Usuario(s)
app.post("/signup", async (req, res) => {
    try {

        const onlyLettersSpaces = /^[a-zA-Z ]+$/;
        const onlyLettersNumbers = /^[a-zA-Z0-9]+$/;
        const onlyLettersNumbersSpaces = /^[a-zA-Z0-9 ]+$/;
        const plusNumbers = /^\+?\d+$/;

        const regiones = await getFromTable('region_name', 'regions', null, null);

        const username = req.body.user;
        const mail = req.body.mail;
        const rut = req.body.rut;
        const password = hashPassword(req.body.pass);
        const fullname = req.body.fullname;
        const birthdate = req.body.birthdate;
        const address = req.body.address;
        const comune = req.body.comune;
        const region = req.body.region;
        const country = req.body.country;
        const phone = req.body.phone;

        function errorValidarDatos(code) {
            const data = {
                registrado: code,
                region: JSON.stringify(regiones)
            }

            res.render('register', data);
        }

        const userExists = await getFromTable('username', 'user_info', 'username', username);
        const mailExists = await getFromTable('mail', 'user_info', 'mail', mail);

        var erroresValidar = 0;

        if(!onlyLettersNumbers.test(username)){
            erroresValidar++;
        }

        if(!onlyLettersSpaces.test(fullname)){
            erroresValidar++;
        }

        if(!onlyLettersNumbersSpaces.test(address)){
            erroresValidar++;
        }

        if(!onlyLettersSpaces.test(comune)){
            erroresValidar++;
        }
        
        if(!onlyLettersSpaces.test(country)){
            erroresValidar++;
        }

        if(!plusNumbers.test(phone)){
            erroresValidar++;
        }

        if(userExists.toString().trim() !== '' 
            && userExists[0].username.toString().toUpperCase() === username.toString().toUpperCase() ||
            mailExists.toString().trim() !== '' && mailExists[0].mail.toString().toUpperCase() === mail.toString().toUpperCase()) {

            erroresValidar = erroresValidar + 10;
        }

        if(erroresValidar == 0) {
            const columns = 'username, fullname, birthdate, address, comune, region, country, phone, mail, password, rut';

            const values = `'${username}', '${fullname}', '${birthdate}', '${address}', '${comune}', '${region}', '${country}', '${phone}', '${mail}', '${password}', '${rut}'`;

            await intoTable("user_info", columns, values);

            resend.emails.send({
                from: 'contacto@meipulseras.cl',
                to: mail,
                subject: 'Registro exitoso, ' + username,
                html: '<br>'+
                    '<br>'+      
                    '<div style="text-align: center;">'+
                        '<img width="300px" src="https://meipulseras.cl/images/webp/logo.webp" alt="logo">'+
                    '</div>'+
                    '<br>'+
                    '<br>'+
                    '<div style="text-align: center;">'+
                    '<p style="font-family: Quicksand;">Su usuario ' + username + ' fue creado exitosamente.</p>'+
                        '<p style="font-family: Quicksand;">Ahora puede revisar sus datos personales y generar compras online.</p>'+
                        '<p style="font-family: Quicksand;">¡Recuerde seguirnos en Instagram!</p>'+
                    '</div>'+
                    '<br>'+
                    '<br>'
            });
        
            return res.status(201).redirect('/');
        } else if(erroresValidar == 10){
            errorValidarDatos('yes');
        } else if(erroresValidar >= 10){ 
            errorValidarDatos('yes+invalidregister');
        } else {
            errorValidarDatos('invalidregister');
        }
         
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/');
    }
});

//Delete - elimina registro de usuario
app.post('/delete', async (req, res) => {

    const token = req.session.token;
    const user = verifyJWT(token);

    try {
        const deleteUser = await deleteFromTable('user_info', 'username', user);

        return res.status(200).redirect('/auth/logout');
    } catch (error) {
        res.status(500).redirect('/');
    }
});

//Ruta carrito - Mostrar items en carrito
app.get('/cart', async (req, res) => {

    try {
        const token = req.session.token;
        const user = verifyJWT(token);

        // var length = await getFromTable('cart', 'user_cart', 'username', user);

        var length = await redisClient.get(user);

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

        for(let i = 0; i < jsonCart.length; i++){

            var object = jsonCart[i];

            var stock = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', object.id); 
        
            subtotal = subtotal + (object.precio * object.cantidad);
            object.stock = stock[0].product_quantity;
        }

        var array = JSON.stringify(jsonCart);

        const data = {
            username: user,
            clientname: clientName,
            clientaddress: clientAddress,
            clientcomune: clientComune,
            clientregion: clientRegion,
            clientphone: clientPhone,
            clientmail: clientMail,
            clientshipmentprice: regionPrice[0].blue_price,
            array: array,
            count: items,
            subtotal: subtotal,
            total: (subtotal + parseInt(jsonCart[0].envio))
        };

        const renewStock = setInterval(async function(){
            for(let i = 0; i < jsonCart.length; i++){

                var object = jsonCart[i];

                var stock = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', object.id);
        
                object.stock = stock[0].product_quantity;   
        
            }
        }, 1000 * 60 * 15);
            
        if(data.username == ''){
            return res.status(401).redirect('/');
        } else if(length.length == 2 && length == "[]") {
            res.redirect('/');
        } else {
            res.render('cart', data);
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
        // var cart = await getFromTable('cart', 'user_cart', 'username', user);

        var cart = await redisClient.get(user);

        var jsonCart = JSON.parse(cart);   

        for(let i = 0; i < jsonCart.length; i++){

            var item = jsonCart[i];
        
            if(item.id == idtochange) {
                if(prodqty > 0) {
                    item.cantidad = prodqty;
                    // const set = `cart = '${JSON.stringify(jsonCart)}'`;
                    // await updateTable('user_cart', set, 'username', user);
                    await redisClient.set(user, JSON.stringify(jsonCart));
                    break;
                } else {
                    const index = jsonCart.indexOf(item);                
                    jsonCart.splice(index, 1);
                    // const set = `cart = '${JSON.stringify(jsonCart)}'`;
                    // await updateTable('user_cart', set, 'username', user);
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

app.post('/envio', async (req, res) => {

    const token = req.session.token;
    const selectedOption = req.body.selectedOption;
    const user = verifyJWT(token);
       
    try {
        // var cart = await getFromTable('cart', 'user_cart', 'username', user);

        var cart = await redisClient.get(user);

        var jsonCart = JSON.parse(cart);

        const clientRegion = await getFromTable('fullname, address, comune, region, phone, mail', 'user_info', 'username', user);
        const regionPrice = await getFromTable('blue_price', 'regions', 'region_name', clientRegion[0].region);

        for(let x = 0; x < jsonCart.length; x++){

            var item = jsonCart[x];

            if(selectedOption == 'blue'){
                item.envio = parseInt(regionPrice[0].blue_price);
                // const set = `cart = '${JSON.stringify(jsonCart)}'`;
                // await updateTable('user_cart', set, 'username', user);
                await redisClient.set(user, JSON.stringify(jsonCart));
            } else {
                item.envio = 0;
                // const set = `cart = '${JSON.stringify(jsonCart)}'`;
                // await updateTable('user_cart', set, 'username', user);
                await redisClient.set(user, JSON.stringify(jsonCart));
            }
            
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

    // var cart = await getFromTable('cart', 'user_cart', 'username', user);

    var cart = await redisClient.get(user);
    const carro = JSON.parse(cart);

    var concepto = [];

    for(let x = 0; x < carro.length; x++){

        var item = carro[x];

        concepto.push(item.nombre + ' x ' + item.cantidad)
        
    }  

    const secretKey = process.env.SECRET_KEY;
    const urlFlow = process.env.URI_FLOW;
    const createPayment = urlFlow + "/payment/create";

    const amount = totalToPay;
    const apiKey =  process.env.API_KEY;
    const commerceOrder = Randomstring.generate(7);
    const currency = "CLP";
    const emailpayer = await getFromTable('mail', 'user_info', 'username', user);
    const paymentMethod = "9";
    const subject = concepto.toString();
    const urlConfirmation = process.env.AMBIENTE == "local" ? "http://localhost:3000/confirmedpayment" : process.env.PORT + "/confirmedpayment";
    const urlReturn = process.env.AMBIENTE == "local" ? "http://localhost:3000/result" : process.env.PORT + "/result";

    const params = {
        "amount": amount,
        "apiKey": apiKey,
        "commerceOrder": commerceOrder,
        "currency": currency,
        "email": emailpayer[0].mail,
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
    const columns = 'sale_order, cart, subtotal, shipping, total, username, sale_date, paid';
    const values = `'${0}', '${JSON.stringify(carro)}', ${subtotalToPay}, ${carro[0].envio}, ${totalToPay}, '${user}', '${formattedDate}', ${false}`;

    const insertedCart = await getFromTable('username, cart, shipping, sale_date, paid', 'sales', `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);

    if(insertedCart.toString().trim() === ''){
        await intoTable('sales', columns, values);
    } else {
        const formattedDateDB = insertedCart[0].sale_date.toISOString().split('T')[0];

        if(!insertedCart[0].paid && formattedDateDB == formattedDate && insertedCart[0].cart !== carro && insertedCart[0].total !== totalToPay){
            const set = `cart = '${JSON.stringify(carro)}',
                        subtotal = '${subtotalToPay}', 
                        shipping = '${carro[0].envio}', 
                        total = '${totalToPay}'`;

            await updateTable('sales', set, `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);
        }
    }

    const redirectTo = response.output.url + "?token=" + response.output.token;
    
    res.redirect(redirectTo);

});

app.post('/result', async (req, res) => {

    const apiKey = process.env.API_KEY;

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
    
    const token = req.session.token;
    const user = verifyJWT(token);

    const saleDate = new Date();
    const formattedDate = saleDate.toISOString().split('T')[0];

    const insertedCart = await getFromTable('cart, subtotal, shipping, total', 'sales', `paid = ${false} AND sale_date = '${formattedDate}' AND username`, user);

    if(response.info.http_code = 200){
        const set = `paid = ${true},
                    sale_order = '${response.output.commerceOrder}'`;
        const comp1 = `cart = '${insertedCart[0].cart}' 
                        AND subtotal = '${insertedCart[0].subtotal}' 
                        AND shipping = '${insertedCart[0].shipping}' 
                        AND total = '${insertedCart[0].total}' 
                        AND paid = ${false} 
                        AND sale_date = '${formattedDate}' 
                        AND username`;

        await updateTable('sales', set, comp1, user);

        // const set1 = `commerce_order = '${response.output.commerceOrder}'`;
        // await updateTable('user_cart', set1, 'username', user);

        await redisClient.set(user, response.output.commerceOrder);
        
        res.status(200).redirect('/confirmedpayment');
    } else {

        const dataError = {
            error: "Hubo un error al procesr su pago. Revise las transacciones de su banco para verificar si se cursó el pago. Si no se cursó el pago, intente nuevamente la compra."
        }

        await redisClient.set(user, insertedCart[0].cart);

        res.status(500).render('notconfirmed', dataError);
    }
});

app.get('/confirmedpayment', async (req, res) => {

    const token = req.session.token;
    const user = verifyJWT(token);

    var order = await redisClient.get(user);

    if(order === null) {
        return res.status(401).redirect('/');
    }

    var array = await getFromTable('cart, shipping, total', 'sales', `sale_order = '${order}' AND username`, user);

    const data = {
        array: array[0].cart,
        envio: array[0].shipping,
        total: array[0].total
    }

    const saleDate = new Date();
    const formattedDate = saleDate.toISOString().split('T')[0];

    const insertedCart = await getFromTable('cart, paid, sale_order', 'sales', `sale_order = '${order}' AND paid = ${true} AND sale_date = '${formattedDate}' AND username`, user);

    if(insertedCart[0].paid && insertedCart[0].sale_order !== 0){
        // await deleteFromTable('user_cart', 'username', user);

        await redisClient.del(user);

        var jsonCart = JSON.parse(insertedCart[0].cart);

        for(let x = 0; x < jsonCart.length; x++){

            var item = jsonCart[x];

            var stockDB = await getFromTable('product_quantity', 'price_quantity_products', 'product_id', item.id);

            var newStock = parseInt(stockDB[0].product_quantity) - parseInt(item.cantidad);

            const set = `product_quantity = ${newStock}`;
            await updateTable('price_quantity_products', set, 'product_id', item.id);
            
        }

        res.status(200).render('confirmed', data);
    } else {

        const dataError = {
            error: "Hubo un error al confirmar su pago. Revise las transacciones de su banco para verificar el pago y el correo electrónico de Flow y envíe un contacto con su Número de orden de comercio para que confirmemos el pago."
        }

        await redisClient.set(user, insertedCart[0].cart);

        res.status(500).render('notconfirmed', dataError);
    }
});

//Ruta PRODUCTO - Requiere LOGGED
app.get('/producto/:productnumber', async (req, res) => {

    const numproduct = req.params['productnumber'];
    const token = req.session.token;

    try {

        const data = verifyJWT(token) == '' ? 'index' : verifyJWT(token);

        // var length = await getFromTable('cart', 'user_cart', 'username', data);

        var length = await redisClient.get(data);

        const items = cartNumeration(length, data);  

        const prodtosell = await getProductDetail(numproduct);

        const image = prodtosell.product_image;
        const id = prodtosell.product_id;
        const name = prodtosell.product_name;
        const description = prodtosell.product_description;
        const price = prodtosell.product_price;
        const stock = prodtosell.product_quantity;

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
    let prodquantity = parseInt(req.body.prodquantity);
    const prodnumber = req.body.prodnumber;

    const username = verifyJWT(token);

    // var length = await getFromTable('cart', 'user_cart', 'username', username);

    var length = await redisClient.get(username);

    const items = cartNumeration(length, username);

    if(username == ''){
        return res.status(401).redirect("/login");
    }
    
    try {
        var cart = [];

        if(length === undefined || length === null) {
            cart = [];
        } else {
            cart = JSON.parse(length);
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

        let datosVenta = {
            imagen: cartItems.product_image,
            nombre: cartItems.product_name,
            precio: parseInt(cartItems.product_price),
            cantidad: prodquantity,
            stock: parseInt(cartItems.product_quantity),
            envio: 0,
            id: cartItems.product_id
        };
        
        cart.push(datosVenta);

        var stringfiedCart = JSON.stringify(cart);

        await redisClient.set(username, stringfiedCart);

    res.redirect('/producto/' + prodnumber);

    }catch(error){
        console.log(error)
        res.status(500).redirect('/');
    }
});

//Contacto
app.get('/contact', async (req, res) => {

    try {
        const token = req.session.token;
        var data = {
            username: verifyJWT(token)
        };

        var length = await getFromTable('cart', 'user_cart', 'username', data.username);

        const items = cartNumeration(length[0], data.username);
        
        let dataUser;

        if(data.username == ''){
            dataUser = {
                fullname: '',
                phone: '',
                mail: '',
                username: 'index',
                count: items
            }
        } else {
            const datosContacto = await getFromTable('fullname, phone, mail', 'user_info', 'username', data.username);

            dataUser = {
                fullname: datosContacto[0].fullname,
                phone: datosContacto[0].phone,
                mail: datosContacto[0].mail,
                username: data.username,
                count: items
            }
        }

        res.render('form', dataUser);
        
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/');
    }
});

//Enviar formulario contacto
app.post("/contact", (req, res) => {

    const userName = req.body.name;
    const userMail = req.body.mail;
    const phone = req.body.phone;
    const comment = req.body.comment;

    const fecha = new Date().toLocaleDateString('es-CL', { timezone: 'America/Adak' });

    const hora = toZonedTime(new Date(), 'America/Santiago').toLocaleTimeString();

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
            '<p><b>Comentario contacto:</b> '+comment+'</p>'
        });

        res.redirect('/enviado');

    } catch (e) {
        console.log(e);
        res.redirect('/noenviado');
    } 
});

//Contacto Enviado
app.get('/enviado', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/ok.html'));
});

//Contacto No Enviado
app.get('/noenviado', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/error.html'));
});

//LOG OUT usuario LOGGED
app.get('/policy', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/terms.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on ${port}`));