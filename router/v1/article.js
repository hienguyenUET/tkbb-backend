const express = require('express')

const {sequelize, Article, User, Category} = require('../../models/index');
const {verifyToken} = require('../../middleware/auth')
const gsCrawlQueue = require('../../job/queue')
const ARTICLE_CLASSIFIED_TYPE = require('../../consts')
const {QueryTypes} = require('sequelize');

const router = express.Router()

router.post('/crawling', verifyToken, async (req, res, next) => {
    const users = await User.findAll()
    const yearWindow = isNaN(req.body.yearWindow) ? -1 : parseInt(req.body.yearWindow);
    for (const {dataValues: user} of users) {
        gsCrawlQueue.add({
            type: 0,
            start: 0,
            user,
            yearWindow
        })
    }

    return res.success()
})

router.post('/crawling/user/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')
    const yearWindow = isNaN(req.body.yearWindow) ? -1 : parseInt(req.body.yearWindow);
    const user = await User.findByPk(id)
    user.crawlStatus = '';
    await user.save();

    gsCrawlQueue.add({
        type: 0,
        start: 0,
        user,
        yearWindow
    })
    return res.success()
})

router.get('/reload/:id', verifyToken, async (req, res) => {
    let aid = req.getParam('id');
    let article = await Article.findOne({
        where: {
            id: aid
        },
        include: [{model: User}]
    });
    gsCrawlQueue.add({
        type: 1,
        citationLink: article.citedUrl.replace('https://scholar.google.com', ''),
        user: article.user
    });
    await article.destroy();
    return res.success();
});

router.put('/:id', verifyToken, async (req, res, next) => {
    try {
        const id = req.getParam('id');
        let articleData = req.body;
        const article = await Article.findByPk(id)
        article.categoryId = articleData.categoryId || article.categoryId;
        article.uid = articleData.uid || articleData.uid;
        article.classified = (articleData.classified === undefined) ? article.classified : articleData.classified;
        article.isFirstAuthor = articleData.isFirstAuthor;
        article.isCorrespondingAuthor = articleData.isCorrespondingAuthor;
        article.classifiedType = (articleData.classifiedType === undefined || articleData.classifiedType === null)
            ? ARTICLE_CLASSIFIED_TYPE.AUTO
            : articleData.classifiedType;
        article.venue = (articleData.venue === undefined) ? article.venue : articleData.venue;
        article.publicationDate = (articleData.publicationDate === undefined) ? article.publicationDate : articleData.publicationDate;
        await article.save();
        return res.success("Update successfully");
    } catch (e) {
        return res.error("Update failed");
    }
})

router.delete('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id');
    const article = await Article.findByPk(id)

    await article.destroy()

    res.success()
});

router.get('/', verifyToken, async (req, res, next) => {
    let articles = await Article.findAll({
        order: [
            ['publicationDate', 'DESC'],
            ['id', 'ASC']
        ],
        include: [{
            model: User
        }, {
            model: Category
        }]
    });
    articles = articles.map(e => {
        return {
            ...e.dataValues,
            authorName: e?.dataValues?.user?.dataValues?.fullName || "[Missing]"
        }
    })

    return res.success(articles)
});

router.post('/query', verifyToken, async (req, res) => {
    const criteria = req.body;
    let whereFaculty = "";
    let whereCategory = "";
    let whereStartDate = "";
    let whereEndDate = "";
    if (criteria.faculty) {
        whereFaculty = "AND users.faculty = :faculty"
    }
    if (criteria.category) {
        whereCategory = "AND category.id = :category"
    }
    if (criteria.startDate) {
        whereStartDate = 'AND articles.publicationDate >= :startDate'
    }
    if (criteria.endDate) {
        whereEndDate = 'AND articles.publicationDate < :endDate'
    }
    const articles = await sequelize.query(`SELECT title,
                                                   id,
                                                   SUBSTRING_INDEX(authors, '|', 1)         as authors,
                                                   SUBSTRING_INDEX(faculty, '|', 1)         as faculty,
                                                   SUBSTRING_INDEX(publicationDate, '|', 1) as publicationDate,
                                                   SUBSTRING_INDEX(venue, '|', 1)           as venue,
                                                   SUBSTRING_INDEX(publisher, '|', 1)       as publisher,
                                                   category
                                            FROM (SELECT title,
                                                         MIN(articles.id)                                     as id,
                                                         GROUP_CONCAT(distinct authors SEPARATOR '|')         as authors,
                                                         GROUP_CONCAT(distinct users.faculty SEPARATOR '|')   as faculty,
                                                         GROUP_CONCAT(distinct publicationDate SEPARATOR '|') as publicationDate,
                                                         GROUP_CONCAT(distinct venue SEPARATOR '|')           as venue,
                                                         GROUP_CONCAT(distinct publisher SEPARATOR '|')       as publisher,
                                                         GROUP_CONCAT(distinct category.name SEPARATOR '|')   as category
                                                  FROM articles
                                                           INNER JOIN users on users.id = articles.uid
                                                           INNER JOIN category on articles.categoryId = category.id
                                                  WHERE category.id > 1
                                                    AND articles.classified is TRUE
                                                      ${whereFaculty} ${whereCategory} ${whereStartDate} ${whereEndDate}
                                                  GROUP BY title) as t
    `, {
        replacements: criteria,
        type: QueryTypes.SELECT
    });

    res.success(articles);
});

router.get('/dedup', verifyToken, async (req, res) => {
    const articles = await sequelize.query(`SELECT MIN(id) id, uid, title, COUNT(cat) cnt
                                            FROM (SELECT title,
                                                         uid,
                                                         c.name    as cat,
                                                         min(a.id) as id
                                                  FROM articles a
                                                           INNER JOIN category c ON a.categoryId = c.id
                                                  WHERE c.id > 1
                                                  GROUP BY a.title, a.uid, c.name) t
                                            GROUP BY uid, title
                                            HAVING cnt > 1
                                            ORDER BY id DESC`, {type: QueryTypes.SELECT});

    res.success(articles);
});
module.exports = router
