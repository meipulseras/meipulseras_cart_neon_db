import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashed = bcrypt.hashSync(password, salt);
    return hashed;
};

export const comparePassword = (password, ecryptedPassword) => {
    return bcrypt.compareSync(password, ecryptedPassword);
};
