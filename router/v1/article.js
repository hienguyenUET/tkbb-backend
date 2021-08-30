const express = require('express')

const { Article, User, Category } = require('../../models/index')
const { verifyToken } = require('../../middleware/auth')
const gsCrawlQueue = require('../../job/queue')


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
})


module.exports = router
