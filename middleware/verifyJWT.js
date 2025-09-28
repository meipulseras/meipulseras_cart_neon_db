import jwt from 'jsonwebtoken';

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

export default verifyJWT;