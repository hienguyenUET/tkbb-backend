const express = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')

const router = express.Router()


router.post('/login', (req, res, next) => {
    const username = req.getParam('username')
    const password = req.getParam('password')

    const A_YEAR = 24 * 60 * 60 * 30 * 365

    const admin = config.get(username)

    if (!admin || username !== admin.username) {
        return res.error('username or password mistake')
    }

    const checkPass = bcrypt.compareSync(password, admin.hashPassword)

    if (!checkPass) {
        return res.error('username or password mistake')
    }

    const token = jwt.sign({role: admin.role || 'user'}, config.get('tokenSecretKey'), {expiresIn: A_YEAR});

    res.success( { token, role: admin.role } )
})


module.exports = router
