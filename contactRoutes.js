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

const router = express.Router();

router.use(compression());

const resend = new Resend(process.env.RESEND_KEY);

const redisClient = redisClientInstance;

//Contacto
router.get('/contact', async (req, res) => {

    try {
        const token = req.session.token;
        var data = {
            username: verifyJWT(token)
        };

        var length = await redisClient.get(data.username);

        const items = cartNumeration(length, data.username);
        
        let dataUser;

        if(data.username == ''){
            dataUser = {
                fullname: '',
                phone: '',
                mail: '',
                username: '',
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
router.post("/contact", (req, res) => {

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