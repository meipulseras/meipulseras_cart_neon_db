import express from 'express';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import User from "./models/User.js";
// import Blue from './models/Blue.js';
import cartDuration from './middleware/cartSession.js';
import Randomstring from 'randomstring';
// import { MongoClient } from "mongodb";
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
// import Config from './config.json' with { type: 'json' };
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { config } from "dotenv";
import { comparePassword, hashPassword } from './hash/hashing.js';
import UserInfo from './models/UserInfo.js';
// import getFromTable from './middleware/queries/select.js';
// const uri = Config.MONGODB_DB_URI;
// const resend = new Resend(Config.RESEND);

// const region = await getFromTable('regions');

// console.log(region);

const app = express();

// app.use(session({
//     name: "token",
//     secret: process.env.JWT_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         maxAge: (60 * 60 * 1000),
//         httpOnly: false
//     }
// }));

config();

//express.urlencoded y express.json para que pesque datos de form.html
app.use(express.urlencoded({extended: true}));

app.use(
    cors({
        origin: process.env.PORT || 3000,
        methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
        credentials: true
    })
);

const router = express.Router();

// let client = new MongoClient(uri);
// let clientPromise = client.connect();

// router.get('/signup', async (req, res) => {

//     try {
//         // const db = (await clientPromise).db("test");
       
//         // const region = await Blue.find({}, {_id: 0, region: 1});

//         // const region = getRegions();

//         // console.log(region);

//         const region = '{ "reg": "reg_name"}';

//         res.render('register', {region: JSON.stringify(region)});
//     } catch (error) {
//         res.status(500).redirect('/');
//     }
// });


// //Ruta Signup - Registro de Usuario(s)
// router.post("/signup", async (req, res) => {
//     try {
//         const username = req.body.user;
//         const password = hashPassword(req.body.pass);
//         const email = req.body.mail;

//         const fullname = req.body.fullname;
//         const birthdate = req.body.birthdate;
//         const address = req.body.address;
//         const comune = req.body.comune;
//         const region = req.body.region;
//         const country = req.body.country;
//         const phone = req.body.phone;
        
//         const user = new User({ username, email, password });
        
//         await user.save();

//         const userInfo =  new UserInfo({username, fullname: fullname, birthdate: birthdate, address: address, comune: comune, region: region, country: country, phone: phone, mail: email});

//         await userInfo.save();

//         resend.emails.send({
//             from: 'contacto@meipulseras.cl',
//             to: email,
//             subject: 'Registro exitoso ' + username,
//             html: '<br>'+
//                 '<br>'+      
//                 '<div style="text-align: center;">'+
//                     '<img width="300px" src="https://meipulseras.cl/images/webp/logo.webp" alt="logo">'+
//                 '</div>'+
//                 '<br>'+
//                 '<br>'+
//                 '<div style="text-align: center;">'+
//                 '<p style="font-family: Quicksand;">Su usuario ' + username + ' fue creado exitosamente.</p>'+
//                     '<p style="font-family: Quicksand;">Ahora puede revisar sus datos personales y generar compras online.</p>'+
//                 '</div>'+
//                 '<br>'+
//                 '<br>'
//         });
        
//         return res.status(201).redirect('/');
        
//     } catch (error) {
//         console.log(error)
//         res.status(500).redirect('/');
//     }
// });

// router.get('/login', (req, res) => {
//     const data = {no: 'no'};
//     res.render('login', data);
//     // res.sendFile(path.join(__dirname + '/views/login.html'));
// });

// //Ruta login - Acceso de usuario
// router.post("/login", async (request, response) => {
//     const username = request.body.user;
//     const email = request.body.user;
//     const password = request.body.pass;

//     cartDuration(username);

//     try {
//         const user = username.includes('@') ? await User.findOne({ email }) : await User.findOne({ username });

//         if(!user || !comparePassword(password, user.password)){
//             const data = {no: 'yes'};
//             return response.render('login', data);
//         }

//         //Generar Token JWT
//         const token = jwt.sign(
//             { id: user._id, username: user.username },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: '6h'
//             }
//         );

//         request.session.token = token;

//         response.redirect('/personal');

//     } catch (error) {
//         console.log(error)
//         response.status(500).redirect('/auth/login');    
//     }
// });

// //Recuperación de contraseña
// router.post("/forgot", async (req, res) => {
//     try {
//         const username = req.body.user;

//         const email = req.body.mail;

//         const user = await User.findOne({ username });

//         var random = '';

//         if(user.email == email){
//             random = Randomstring.generate(7);
//         } else {
//             return response.redirect('/forgot');
//         }

//         const password = hashPassword(random);

//         const db = (await clientPromise).db("test");
       
//         const collection = db.collection("users");

//         await collection.updateOne({ username: username }, 
//             { $set: { password: password }});

//         resend.emails.send({
//             from: 'contacto@meipulseras.cl',
//             to: email,
//             subject: 'Recuperación de contraseña',
//             html: '<br>'+
//                 '<br>'+      
//                 '<div style="text-align: center;">'+
//                     '<img width="300px" src="https://meipulseras.cl/images/webp/logo.webp" alt="logo">'+
//                 '</div>'+
//                 '<br>'+
//                 '<br>'+
//                 '<div style="text-align: center;">'+
//                 '<p style="font-family: Quicksand;">Su contraseña provisoria es: ' + random + '</p>'+
//                     '<p style="font-family: Quicksand;">Por favor, inicie sesión y cambie la contraseña provisoria por una nueva.</p>'+
//                 '</div>'+
//                 '<br>'+
//                 '<br>'
//         });
        
//         return res.status(201).redirect('/');
        
//     } catch (error) {
//         res.status(500).redirect('/');
//     }
// });

// router.get('/logout', (req, res) => {
//     res.status(200).clearCookie('token', "", {
//         path: "/"
//     });
    
//     req.session.destroy(function (err) {
//         res.redirect('/');
//     });
// });

export default router;