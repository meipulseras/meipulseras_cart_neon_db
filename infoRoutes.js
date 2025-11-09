import express from 'express';
import compression from 'compression';
import cartNumeration from './middleware/cartCount.js';
import verifyJWT from './middleware/verifyJWT.js'
import getFromTable from './middleware/queries/select.js';
import updateTable from './middleware/queries/update.js';
import getFromTableOrder from './middleware/queries/selectOrder.js';
import redisClientInstance from './middleware/redisClient.js';

const router = express.Router();

router.use(compression());

const redisClient = redisClientInstance;

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
router.get("/info", async (req, res) => {

    const token = req.session.token;
    
    try {
        const data = verifyJWT(token);

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
            mail: newMail(datos[0].mail).toLowerCase(),
            rut: newRut(datos[0].rut).toUpperCase(),
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
router.post("/info", async (req, res) => {

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
                mail: newMail(datos[0].mail).toLowerCase(),
                rut: newRut(datos[0].rut).toUpperCase(),
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

//Informacion personal de usuario LOGGED
router.get('/personal', async (req, res) => {

    try {
        const token = req.session.token;
        const user = verifyJWT(token);
        
        var length = await redisClient.get(user);

        const items = cartNumeration(length, user);

        if(user == ''){
            return res.status(401).redirect('/');
        }

        const compras = await getFromTableOrder('sale_order, cart, subtotal, shipping, total, sale_date', 'sales', `paid = ${true} AND username`, user, 'sale_date', 'DESC');

        const data = {
            username: user.charAt(0) + user.slice(1).toLowerCase(),
            array: JSON.stringify(compras),
            count: items
        };

        res.render('personal', data);
        

    } catch (error) {
        res.status(500).redirect('/');
    }
});

export default router;