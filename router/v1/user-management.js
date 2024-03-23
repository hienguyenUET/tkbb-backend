const express = require("express");
const {verifyToken} = require("../../middleware/auth");
const router = express.Router()
const {Account, Role, Faculty} = require('../../models')
const bcrypt = require('bcrypt')
const {Sequelize} = require("sequelize");
const config = require('config')

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

router.post('/new-account', verifyToken, async (req, res) => {
    const newAccount = req.body;
    newAccount.password = config.get("default-password") ? config.get("default-password") : "dhcn@2024";
    newAccount.hashed_password = await bcrypt.hash(newAccount.password, 10).then(newHashedPassword => {
        return newHashedPassword;
    });
    try {
        await Account.create(newAccount);
        return res.success("Add successfully");
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.error("Username already exists")
        }
        return res.error("Add failed");
    }
});

router.get('/role/search', verifyToken, async (req, res, next) => {
    const roleList = await Role.findAll();
    return res.success(roleList);
})

router.put('/update-account', verifyToken, async (req, res) => {
    const account = req.body;
    try {
        await Account.update(account, {
            where: {
                id: account.id
            }
        })
        return res.success("Update successfully");
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.error("Username already exists")
        }
        return res.error("Update failed");
    }
});

router.put('/reset-password', verifyToken, async (req, res) => {
    let updateAccountForm = {};
    const accountId = req.body ? req.body.id : null;
    const password = config.get("default-password") ? config.get("default-password") : "dhcn@2024";
    const hashed_password = await bcrypt.hash(password, 10).then(newHashedPassword => {
        return newHashedPassword;
    });
    updateAccountForm = {
        id: accountId,
        password: password,
        hashed_password: hashed_password
    }
    try {
        await Account.update(updateAccountForm, {
            where: {
                id: updateAccountForm.id
            }
        })
        return res.success("Reset successfully");
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.error("Username already exists")
        }
        return res.error("Reset failed");
    }
})

router.delete('/delete-account/:accountId', verifyToken, async (req, res) => {
    const id = req.params.accountId;
    try {
        await Account.destroy({
            where: {
                id: id
            }
        })
        return res.success("Delete successfully")
    } catch (e) {
        res.error("Delete failed")
    }
});

router.delete('/delete-multiple-account/:accountIds', async (req, res) => {
    const accountIds = req.params.accountIds.split(",");
    try {
        await Account.destroy({
            where: {
                id: accountIds
            }
        })
        return res.success("Delete successfully")
    } catch (e) {
        res.error("Delete failed")
    }
});

module.exports = router
