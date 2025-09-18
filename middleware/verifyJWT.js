import jwt from 'jsonwebtoken';

// function verifyJWT(req, res, next) {
//     const token = req.headers["authorization"];

//     if(!token){
//         return res.status(401).json({ message: "Acceso denegado" });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
//         if (err) {
//             return res.status(401).json({ message: "Fallo al validar el Token" });
//         }
//         req.user = data;
//         next();
//     });
// }

function verifyJWT(token) {

    var data = '';

    jwt.verify(token, process.env.JWT_SECRET, (err, dataToken) => {
        if (err) {
            return data;
        } else {
            data = dataToken.username;
        }
    });

    return data;
}

// module.exports = verifyJWT;
export default verifyJWT;