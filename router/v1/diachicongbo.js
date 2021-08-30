const express = require('express')

const { User, DiaChiCongBo, Category } = require('../../models/index')
const { Op } = require("sequelize");
const { verifyToken } = require('../../middleware/auth')

const router = express.Router()

router.post('/', verifyToken, async (req, res, next) => {
    const raw = req.body;
    raw.name = (!raw.name || !raw.name.length)?undefined:raw.name;

    const exsistPub = await DiaChiCongBo.findOne({
        where: { name: raw.name }
    })

    if (exsistPub) {
        return res.error('DiaChiCongBo name existed')
    }

    await DiaChiCongBo.create(raw)

    return res.success()
})

router.get('/', verifyToken, async (req, res, next) => {
    const pubName = req.getParam('pubName', '')

    const query = {
      where: {},
      include: [{
        model: Category
      }]
    }

    if (pubName) {
        query.where.name = pubName
    }

    const publication = await DiaChiCongBo.findAll(query)

    return res.success(publication)
})

router.put('/:pId', verifyToken, async (req, res, next) => {
    const pId = req.getParam('pId')
    
    const description = req.getParam('description', '')
    const name = req.getParam('name')

    const diachicongbo = await DiaChiCongBo.findOne({
        where: {id: pId}
    })

    res.assert(diachicongbo, 'DiaChiCongBo is not available')

    diachicongbo.description = description || diachicongbo.description;

    if (name) {
        const existSameName = await DiaChiCongBo.findOne({
            where: { 
                name, 
                id: { [Op.not]: pId } 
            }
        })

        res.assert(!existSameName, 'DiaChiCongBo name existed')
        
        diachicongbo.name = name
    }

    await diachicongbo.save()

    return res.success()
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const pub = await DiaChiCongBo.findByPk(id)

    await pub?.destroy()

    return res.success()
})


module.exports = router
