const express = require('express')
const bcrypt = require('bcrypt')
const config = require('config')
const jwt = require('jsonwebtoken')
const excelToJson = require('convert-excel-to-json')
const { Op } = require('sequelize');
const multer = require('../../middleware/multer')
const { verifyToken } = require('../../middleware/auth')
const { User, Faculty } = require('../../models')
const Sequelize = require('sequelize');

const router = express.Router()

router.post('/importing', verifyToken, multer.single('users'), async (req, res, next) => {
    try {
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
        await Faculty.findAll().then(faculties => {
            for (const u of users[Object.keys(users)[0]]) {
                const raw = {
                    fullName: u['Họ và tên'],
                    faculty: u['Đơn vị'],
                    gsUrl: u['Tài khoản Google Scholar'],
                }

                if (!raw.fullName || !raw.gsUrl) {
                    continue
                }

                const faculty = faculties.find(f => f.dataValues.facultyName === raw.faculty)
                if (faculty === undefined || faculty === null) {
                    continue;
                }
                if (faculty) {
                    raw.faculty_id = faculty.id
                }

                User.create(raw)
            }
            return res.success("Upload successfully")
        })
    } catch (error) {
        console.log(error);
        return res.error("Upload failed")
    }

    // for (const u of users[Object.keys(users)[0]]) {
    //     const raw = {
    //         fullName: u['Họ và tên'],
    //         faculty: u['Đơn vị'],
    //         gsUrl: u['Tài khoản Google Scholar'],
    //     }
    //
    //     if (!raw.fullName || !raw.gsUrl) {
    //         continue
    //     }
    //
    //     await User.create(raw)
    // }
})

router.post('/', verifyToken, async (req, res, next) => {
    const fullName = req.getParam('fullName')
    const faculty = req.getParam('faculty')
    const gsUrl = req.getParam('gsUrl')
    const englishName = req.getParam('englishName')

    const raw = {
        fullName,
        englishName,
        gsUrl,
    }
    raw["faculty_id"] = faculty;
    raw["accounts_id"] = -1;

    try {
        await User.create(raw);
        return res.success("Add successfully")
    } catch (e) {
        return res.error("Add failed");
    }
})


router.get('/', verifyToken, async (req, res, next) => {
    try {
        let facultyId = req.query.facultyId;
        let whereClause = {};
        if (facultyId !== undefined && facultyId !== null && facultyId !== '0') {
            whereClause.faculty_id = facultyId;
        }
        const user = await User.findAll({
            where: whereClause,
            order: ['fullName', 'id'],
            include: [{
                model: Faculty,
                as: 'facultyInfo',
            }],
        })
        return res.success(user)
    } catch (e) {
        console.log(e)
        return res.error("Get user info failed");
    }
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    try {
        const id = req.getParam('id')
        await User.destroy({
            where: {
                id: id
            }
        })
        return res.success("Delete successfully");
    } catch (e) {
        console.log(e)
        return res.error("Delete failed");
    }
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

router.get('/search/add-account', verifyToken, async (req, res) => {
    try {
        const action = req.getParam("action")
        let whereCondition = {}
        if (action === "edit") {
            const authorEditId = req.getParam("id")
            whereCondition = {
                account_id: authorEditId
            }
        } else if (action === "add") {
            whereCondition = {
                account_id: null
            }
        } else {
            return res.error("Get user info failed");
        }

        const users = await User.findAll({
            where: whereCondition,
            order: ["fullName"],
            include: [{
                model: Faculty,
                as: 'facultyInfo',
            }],
        })
        return res.success(users)
    } catch (error) {
        return res.error("Get user info failed");
    }
})


module.exports = router
