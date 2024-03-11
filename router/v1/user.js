const express = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const excelToJson = require('convert-excel-to-json')

const multer = require('../../middleware/multer')
const { verifyToken } = require('../../middleware/auth')
const { User, Faculty } = require('../../models')
const Sequelize = require('sequelize');

const router = express.Router()

router.post('/importing', verifyToken, multer.single('users'), async (req, res, next) => {
    const filePath = req.file?.path
    res.assert(filePath, 'File is missing')

    const users = excelToJson({
        sourceFile: filePath,
        header: {
            rows: 2
        },
        columnToKey: {
            A: 'STT',
            B: 'Họ và tên',
            C: 'Đơn vị',
            D: 'Tài khoản Google Scholar'
        }
    })

    for (const u of users[Object.keys(users)[0]]) {
        const raw = {
            fullName: u['Họ và tên'],
            faculty: u['Đơn vị'],
            gsUrl: u['Tài khoản Google Scholar'],
        }

        if (!raw.fullName || !raw.gsUrl) {
            continue
        }

        await User.create(raw)
    }

    res.success()
})

router.post('/', verifyToken, async (req, res, next) => {
    const fullName = req.getParam('fullName')
    const faculty = req.getParam('faculty')
    const gsUrl = req.getParam('gsUrl')

    const raw = {
        fullName,
        faculty,
        gsUrl,
    }

    await User.create(raw)

    res.success()
})

router.get('/', verifyToken, async (req, res, next) => {
    const user = await User.findAll({
        include: [{
            model: Faculty,
            as: 'facultyInfo',
        }],
    })

    res.success(user)
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const user = await User.findByPk(id)

    await user.destroy()

    res.success()
})

router.put('/:id', verifyToken, async (req, res) => {
    const id = req.getParam('id')
    const user = await User.findByPk(id);
    let userData = req.body;
    for (let p in userData) {
        user[p] = userData[p];
    }
    await user.save();
    res.success();
});


module.exports = router
