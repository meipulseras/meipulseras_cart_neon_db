import express from 'express';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import { toZonedTime } from 'date-fns-tz';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import verifyJWT from "./middleware/verifyJWT.js";
import getFromTable from './middleware/queries/select.js';
import cartNumeration from './middleware/cartCount.js';
import redisClientInstance from './middleware/redisClient.js';
import checkPayment from './public/js/checkpayment.js';
import deleteShoppingCartByTime from './public/js/deletecartbytime.js';

const router = express.Router();

router.use(compression());

const resend = new Resend(process.env.RESEND_KEY);

const redisClient = redisClientInstance;

//Contacto
router.get('/contact', async (req, res) => {

    try {
        const token = req.cookies.token;
        const user = verifyJWT(token)

        await checkPayment(user);
        await deleteShoppingCartByTime(token, user);

        var length = await redisClient.get(user);

        const items = cartNumeration(length, user);
        
        let dataUser;

        if(user === ''){
            dataUser = {
                fullname: '',
                phone: '',
                mail: '',
                username: '',
                count: items
            }
        } else {
            const datosContacto = await getFromTable('fullname, phone, mail', 'user_info', 'username', user);

            dataUser = {
                fullname: datosContacto[0].fullname,
                phone: datosContacto[0].phone,
                mail: datosContacto[0].mail,
                username: user.charAt(0) + user.slice(1).toLowerCase(),
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
router.post("/contact", (req, res) => {

    const userName = req.body.name;
    const userMail = req.body.mail;
    const phone = req.body.phone;
    const comment = req.body.comment;

    const fecha = new Date().toLocaleDateString('es-CL', { timezone: 'America/Adak' });

    const hora = toZonedTime(new Date(), 'America/Santiago').toLocaleTimeString();

    try {
        resend.emails.send({
            from: process.env.MAIL_CONTACTO_MEI,
            to: process.env.MAIL_MEI,
            subject: 'Contacto ' + fecha + ' ' + hora,
            html: '<ol>'+
            '<li><b>Nombre completo:</b> '+userName+'</li>'+
            '<li><b>Teléfono:</b> '+phone+'</li>'+
            '<li><b>Email:</b> '+userMail+'</li>'+
            '</ol>'+
            '<p><b>Comentario contacto:</b> '+comment+'</p>'
        });

        res.redirect('/page/enviado');

    } catch (e) {
        console.log(e);
        res.redirect('/page/noenviado');
    } 
});

//Contacto Enviado
router.get('/enviado', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/ok.html'));
});

//Contacto No Enviado
router.get('/noenviado', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/error.html'));
});

export default router;