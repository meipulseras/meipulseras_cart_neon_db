import express from 'express';
import { config } from "dotenv";
import User from "./models/User.js";
// import Blue from './models/Blue.js';
// import { MongoClient } from "mongodb";
import { comparePassword, hashPassword } from './hash/hashing.js';
// import cartNumeration from './middleware/cartCount.js';
// import cartDuration from './middleware/cartSession.js';
// const uri = process.env.MONGODB_DB_URI;
import verifyJWT from './middleware/verifyJWT.js';
import path from 'path';
import { fileURLToPath } from 'url';
import getRegions from './middleware/queries/regions.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

config();

const router = express.Router();

app.set('views', path.join(__dirname + '/views/'));
app.set('view engine', 'ejs');

// let client = new MongoClient(uri);
// let clientPromise = client.connect();

// //Ruta Signup - Registro de Usuario(s)
// router.get("/info", async (req, res) => {

//     // const token = req.session.token;
    
//     // const db = (await clientPromise).db("test");
           
//     // const region = await Blue.find({}, {_id: 0, region: 1});

//     const region = await getRegions();

//     try {
//         // const data = verifyJWT(token);

//         // const items = await cartNumeration(data);

//         // cartDuration(data);

//         // if(data == ''){
//         //     return res.status(401).redirect("/auth/logout");
//         // }
           
//         // const db = (await clientPromise).db("test");
       
//         // const collection = db.collection("userinfos");

//         // const datos = await collection.findOne({ username: data });

//         // const dataUser = {
//         //     fullname: datos.fullname,
//         //     birthdate: datos.birthdate,
//         //     address: datos.address,
//         //     comune: datos.comune,
//         //     region: datos.region,
//         //     regionOption: JSON.stringify(region),
//         //     country: datos.country,
//         //     phone: datos.phone,
//         //     mail: datos.mail,
//         //     count: items
//         // }
        
//         res.render('userinfo', dataUser);

//     } catch (error) {
//         console.log(error);
//         res.status(500).redirect('/');
//     }

// });

// router.post("/info", async (req, res) => {

//     const token = req.session.token;

//     const fullnameRB = req.body.fullname;
//     const birthdateRB = req.body.birthdate;
//     const addressRB = req.body.address;
//     const comuneRB = req.body.comune;
//     const regionRB = req.body.region;
//     const countryRB = req.body.country;
//     const phoneRB = req.body.phone;

//     try {
//         const data = verifyJWT(token);

//         if(data == ''){
//             return res.status(401).redirect("/auth/logout");
//         }
           
//         const db = (await clientPromise).db("test");
       
//         const collection = db.collection("userinfos");

//         await collection.updateOne({ username: data }, 
//             { $set: { fullname: fullnameRB, 
//                 birthdate: birthdateRB,
//                 address: addressRB, 
//                 comune: comuneRB, 
//                 region: regionRB,
//                 country: countryRB, 
//                 phone: phoneRB }
//             }
            
//         );

//         res.redirect('/user/info');

//     } catch (error) {
//         res.status(500).redirect('/');
//     }

// });

// router.post("/newpass", async (req, res) => {

//     const oldpass = req.body.oldpass;
//     const newpass = req.body.newpass;
//     const token = req.session.token;

//     try {
//         const data = verifyJWT(token);

//         if(data == ''){
//             return res.status(401).redirect("/auth/logout");
//         }

//         const user = await User.findOne({ username: data });

//         var password = '';

//         if(comparePassword(oldpass, user.password)){
//             password = hashPassword(newpass);
//         }

//         const db = (await clientPromise).db("test");
       
//         const collection = db.collection("users");

//         await collection.updateOne({ username: user.username }, 
//             { $set: { password: password }});

//         return res.status(201).redirect("/auth/logout");


//     } catch (error) {
//         console.log(error)
//         res.status(500).redirect('/');
//     }
// });

export default router;