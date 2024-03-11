const { Faculty } = require("../../models");
const express = require('express')
const { verifyToken } = require('../../middleware/auth')
const router = express.Router()

router.get('/faculties', verifyToken, async (req, res) => {
    const faculties = await Faculty.findAll();
    res.success(faculties);
});

module.exports = router
