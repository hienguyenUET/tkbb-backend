const express = require('express')

const auth = require('./auth.js')
const user = require('./user')
const article = require('./article')
const publishcation = require('./publishcation')

const router = express.Router()

router.use('/', auth)
router.use('/users', user)
router.use('/articles', article)
router.use('/publishcation', publishcation)


module.exports = router