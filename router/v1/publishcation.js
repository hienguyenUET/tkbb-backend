const express = require('express')

const { User, Publishcation } = require('../../models/index')
const { Op } = require("sequelize");
const { verifyToken } = require('../../middleware/auth')

const router = express.Router()

router.post('/', verifyToken, async (req, res, next) => {
    const type = req.getParam('type')
    const name = req.getParam('name')

    const point = +req.getParam('point', 0)

    const raw = {
        type,
        name,
    }

    if (point && point !== 0) {
        raw.point = +point
    }

    const exsistPub = await Publishcation.findOne({
        where: { name }
    })

    if (exsistPub) {
        return res.error('Publishcation name existed')
    }

    await Publishcation.create(raw)

    return res.success()
})

router.get('/', verifyToken, async (req, res, next) => {
    const pubName = req.getParam('pubName', '')

    const query = {
        where: {}
    }

    if (pubName) {
        query.where.name = pubName
    }

    const publication = await Publishcation.findAll(query)

    return res.success(publication)
})

router.put('/:pId', verifyToken, async (req, res, next) => {
    const pId = req.getParam('pId')
    
    const type = req.getParam('type', '')
    const name = req.getParam('name', '')
    const point = req.getParam('point', '')

    const publishcation = await Publishcation.findOne({
        where: {id: pId}
    })

    res.assert(publishcation, 'Publishcation is not available')

    if (type) {
        publishcation.type = type
    }

    if (name) {
        const exsitSameName = await Publishcation.findOne({
            where: { 
                name, 
                id: { [Op.not]: pId } 
            }
        })

        res.assert(!exsitSameName, 'Publishcation name existed')
        
        publishcation.name = name
    }

    if (point) {
        publishcation.point = point
    }

    await publishcation.save()

    return res.success()
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const pub = await Publishcation.findByPk(id)

    await pub?.destroy()

    return res.success()
})


module.exports = router
