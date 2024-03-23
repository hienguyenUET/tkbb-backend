const {Faculty} = require("../../models");
const express = require('express')
const {verifyToken} = require('../../middleware/auth')
const {Op} = require("sequelize");
const router = express.Router()

router.get('/faculties', verifyToken, async (req, res) => {
    const faculties = await Faculty.findAll({
            where: {
                id: {
                    [Op.not]: 0
                }
            }
        }
    );
    res.success(faculties);
});

module.exports = router
