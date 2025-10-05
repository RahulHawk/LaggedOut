const bcrypt = require('bcryptjs');
const HashedPassword = (password) => {
    try {
        const salt = 10
        const hashedPassword = bcrypt.hashSync(password, salt)
        return hashedPassword

    } catch (e) {
        console.log(e)
    }
};

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword)
};

module.exports = {
    HashedPassword,
    comparePassword
}