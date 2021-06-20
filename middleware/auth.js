
const jwt = require('jsonwebtoken')
const secretKey = require('config').get('tokenSecretKey')

function verifyToken(req, res, next) {
    const token = req.headers['token']

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.error("token is invalid", { code: 403 })
            } else {
                req.tokenData = decoded
                next()
            }
        })
    } else {
        return res.error("token is missing", { code: 403 })
    }
}


module.exports = { verifyToken }