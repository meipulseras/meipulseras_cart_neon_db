import jwt from 'jsonwebtoken';
import compression from 'compression';
import { Resend } from 'resend';
import express from 'express';
import Randomstring from 'randomstring';
import verifyJWT from "./middleware/verifyJWT.js";
import { comparePassword, hashPassword } from './hash/hashing.js';
import getFromTable from './middleware/queries/select.js';
import intoTable from './middleware/queries/insert.js';
import updateTable from './middleware/queries/update.js';

const app = express();

const router = express.Router();

router.use(compression());

const resend = new Resend(process.env.RESEND_KEY);

//Carga pagina LOGIN
router.get('/login', (req, res) => {
    const data = {no: 'no'};
    res.render('login', data);
});

//Ruta login - Acceso de usuario
router.post("/login", async (request, response) => {
    const credential = request.body.user;
    const password = request.body.pass;

    try {
        const credentialType = credential.includes('@') ? 'mail' : 'username';

        const credUpper = credential.toUpperCase();

        const user = await getFromTable('username, password, mail', 'user_info', credentialType, credUpper);

        if(JSON.stringify(user) === '[]' || !comparePassword(password, user[0].password)){
            const data = {no: 'yes'};
            return response.render('login', data);
        }

        //Generar Token JWT
        const token = jwt.sign(
            { id: user[0].mail, username: user[0].username },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        request.session.token = token;

        response.redirect('/user/personal');

    } catch (error) {
        console.log(error)
        response.status(500).redirect('/auth/login');    
    }
});

//Ruta Signup - Formulario registro usuario
router.get('/signup', async (req, res) => {

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
router.post("/signup", async (req, res) => {
    try {

        const onlyLettersSpaces = /^[a-zA-Z ]+$/;
        const onlyLettersNumbers = /^[a-zA-Z0-9]+$/;
        const onlyLettersNumbersSpaces = /^[a-zA-Z0-9 ]+$/;
        const plusNumbers = /^\+?\d+$/;

        const regiones = await getFromTable('region_name', 'regions', null, null);

        const username = req.body.user;
        const userUpper = username.toUpperCase();
        const mail = req.body.mail;
        const mailUpper = mail.toUpperCase();
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

            const values = `'${userUpper}', '${fullname}', '${birthdate}', '${address}', '${comune}', '${region}', '${country}', '${phone}', '${mailUpper}', '${password}', '${rut}'`;

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

//Nuevo password
router.post("/newpass", async (req, res) => {

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
router.get('/forgot', (req, res) => {

    const data = {no: 'no'};
    res.render('forgot', data);
});

//Recuperación password
router.post("/forgot", async (req, res) => {
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
        
        const data = {no: 'ok'};
        return res.render('forgot', data);
        
    } catch (error) {
        res.status(500).redirect('/');
    }
});

//LOG OUT usuario LOGGED
router.get('/logout', async (req, res) => {

    res.status(200).clearCookie('token', "", {
        path: "/"
    });
    
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

//Delete - elimina registro de usuario
router.post('/delete', async (req, res) => {

    const token = req.session.token;
    const user = verifyJWT(token);

    try {

        const set = `fullname = '',
                    birthdate = NULL,
                    address = '',
                    comune = '',
                    region = '',
                    country = '',
                    phone = '',
                    password = '', 
                    rut = ''`;

        await updateTable('user_info', set, 'username', user);

        return res.status(200).redirect('/auth/logout');
    } catch (error) {
        res.status(500).redirect('/');
    }
});

export default router;