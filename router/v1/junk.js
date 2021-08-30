const express = require('express')
const config = require('config')
const jwt = require('jsonwebtoken')
const excelToJson = require('convert-excel-to-json')
const gsCrawlQueue = require('../../job/queue');
const { verifyToken } = require('../../middleware/auth')
const { User, Junk } = require('../../models')

const { GOOGLE_SCHOLAR_URL_PREFIX } = require('../../consts');

const router = express.Router()

router.get('/', verifyToken, async (req, res, next) => {
  const junk = await Junk.findAll()

  res.success(junk);
});

router.delete('/:citation', verifyToken, async (req, res) => {
  let citation = req.params['citation'];
  let junk = await Junk.findByPk(citation);
  if (junk) {
    let user = await User.findByPk(junk.uid);
    gsCrawlQueue.add({
      type: 1,
      citationLink: `/citations?view_op=view_citation&hl=en&user=${junk.user}&pagesize=100&citation_for_view=${junk.citation}`,
      user
    });
    junk.destroy();
    res.success();
  }
  else res.status(502).send({
    errorMessage: 'No item found'
  });  
});

module.exports = router;
