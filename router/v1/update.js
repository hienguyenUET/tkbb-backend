const express = require('express')
const config = require('config')
const { verifyToken } = require('../../middleware/auth')
const { ISI, SCOPUS } = require('../../models')
const multer = require('../../middleware/multer')

const convert = require('../../convert');

const router = express.Router()

const columns = ['journalTitle', 'issn', 'eissn','publisherName', 'publisherAddress', 'language', 'wosc'];
router.post('/isi', verifyToken, multer.single('isi'), async (req, res) => {
  const filePath = req.file?.path
  res.assert(filePath, 'File is missing');
  ISI.destroy({truncate: true});
  convert(filePath, ISI, columns, function(e) {
    if (!e) res.success();
    else res.status(502).send(e.message);
  });
});

router.post('/scopus', verifyToken, multer.single('scopus'), async (req, res) => {
  const filePath = req.file?.path
  res.assert(filePath, 'File is missing')
  SCOPUS.destroy({truncate: true});
  convert(filePath, SCOPUS, columns, function(e) {
    if (!e) res.success();
    else res.status(502).send(e.message);
  });
});

router.post('/lookup', verifyToken, async (req, res) => {
  const venue = req.body['venue'];
  res.assert(venue, 'Journal title missing');
  let results = await Promise.all([
    ISI.findAll({where: { journalTitle: venue }}),
    SCOPUS.findAll({where: {journalTitle: venue}})
  ]);
  res.success({isISI:results[0].length, isSCOPUS:results[1].length});
});
module.exports = router;
