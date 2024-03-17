const express = require("express");
const {verifyToken} = require("../../middleware/auth");
const router = express.Router()
const {Account, Role, Faculty} = require('../../models')

router.get(`/search`, verifyToken, async (req, res, next) => {
    const accountList = await Account.findAll(
        {
            include: [{
                model: Faculty,
                as: 'facultyInfo'
            }, {
                model: Role
            }]
        }
    );

    return res.success(accountList);
})

module.exports = router
