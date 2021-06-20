const express = require('express')

const { Article, User, Publishcation } = require('../../models/index')
const { verifyToken } = require('../../middleware/auth')
const gsCrawlQueue = require('../../job')
const { listeners } = require('../../job')


const router = express.Router()

router.post('/crawling', verifyToken, async (req, res, next) => {
    const users = await User.findAll()

    for (const { dataValues: user } of users) {
        gsCrawlQueue.add({ user })
    }

    return res.success()
})

router.post('/crawling/user/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const user = await User.findByPk(id)

    gsCrawlQueue.add({ user })

    return res.success()
})

router.put('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const pubId = req.getParam('pubId')

    const publication = await Publishcation.findByPk(pubId)

    res.assert(publication, 'Publishcation Id invalid')

    const article = await Article.findByPk(id)

    article.publishcationId = pubId

    article.save()

    return res.success()
})

router.get('/', verifyToken, async (req, res, next) => {
    let articles = await Article.findAll({
        include: [
            { model: User },
            { model: Publishcation },
        ]
    })

    articles = articles.map(e => {
        return {
            ...e.dataValues,
            authorName: e.dataValues.user.dataValues.fullName
        }
    })

    return res.success(articles)
})


module.exports = router
