import jwt from 'jsonwebtoken';

function verifyJWT(token) {

    if (!token || typeof token !== 'string') return '';

    try {
        var data = '';

        jwt.verify(token, process.env.JWT_SECRET, (err, dataToken) => {
            if (err) {
                return data;
            } else {
                data = dataToken.username;
            }
        });

        return data;
    } catch (error) {
        console.log(error);
        return '';
    }

}

export default verifyJWT;