const express = require('express')

const auth = require('./auth.js')
const user = require('./user')
const article = require('./article')
const diachicongbo = require('./diachicongbo')
const category = require('./category')
const junk = require('./junk');
const update = require('./update');

const router = express.Router()

router.use('/', auth)
router.use('/users', user)
router.use('/articles', article)
router.use('/diachicongbo', diachicongbo)
router.use('/category', category)
router.use('/update', update);
router.use('/junk', junk);


module.exports = router
