const express = require('express')

const { sequelize, Article, User, Category } = require('../../models/index');
const { verifyToken } = require('../../middleware/auth')
const gsCrawlQueue = require('../../job/queue')

const {QueryTypes} = require('sequelize');

const router = express.Router()

router.post('/crawling', verifyToken, async (req, res, next) => {
    const users = await User.findAll()

    for (const { dataValues: user } of users) {
        gsCrawlQueue.add({ 
          type: 0, 
          start: 0,
          user 
        })
    }

    return res.success()
})

router.post('/crawling/user/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id')

    const user = await User.findByPk(id)
    user.crawlStatus = '';
    await user.save();

    gsCrawlQueue.add({ 
      type: 0,
      start: 0,
      user 
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
  console.log(article);
  gsCrawlQueue.add({
    type: 1,
    citationLink: article.citedUrl.replace('https://scholar.google.com', ''),
    user: article.user
  });
  await article.destroy();
  return res.success();
});

router.put('/:id', verifyToken, async (req, res, next) => {
    const id = req.getParam('id');
    let articleData = req.body;
    const article = await Article.findByPk(id)
    article.categoryId = articleData.categoryId || article.categoryId;
    article.uid = articleData.uid || articleData.uid;
    article.classified = (articleData.classified === undefined)?article.classified:articleData.classified;
    article.venue = (articleData.venue === undefined)?article.venue:articleData.venue;
    article.publicationDate = (articleData.publicationDate === undefined)?article.publicationDate:articleData.publicationDate;
    article.save();

    return res.success()
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
    console.log(criteria);
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
    const articles = await sequelize.query(`SELECT 
        articles.id as id, title, authors, users.faculty as faculty, publicationDate, venue, publisher, category.name as category
      FROM articles 
        INNER JOIN users on users.id = articles.uid
        INNER JOIN category on articles.categoryId = category.id
      WHERE 
        category.id > 1 
      ${whereFaculty}
      ${whereCategory}
      ${whereStartDate}
      ${whereEndDate}
    `, {
      replacements: criteria,
      type: QueryTypes.SELECT
    });

    res.success(articles);
});

module.exports = router
