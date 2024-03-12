const express = require('express')
const config = require('config')
const { verifyToken } = require('../../middleware/auth')
const { Category } = require('../../models')

const router = express.Router()

router.get('/', verifyToken, async (req, res, next) => {
  const categories = await Category.findAll()

  res.success(categories);
});

router.post('/', verifyToken, async (req, res) => {
  let name = req.getParam('name');
  let desc = req.getParam('description');
  let researchHours = parseInt(req.getParam('researchHours'));
  name = (!name || !name.length) ? undefined:name;
  researchHours = isNaN(researchHours)?NaN:researchHours;
  let instance = await Category.create({
    name, description: desc,
    researchHours
  });
  res.success(instance);
});

router.put('/:id', verifyToken, async (req, res) => {
  let changeObj = req.body;
  let id = req.getParam('id');
  let category = await Category.findByPk(id);
  if (category) {
    category.name = changeObj.name || category.name;
    category.description = changeObj.description || category.description;
    category.researchHours = parseInt(changeObj.researchHours || category.researchHours);
    await category.save();
    res.success();
  }
  else res.status(502).send({
    errorMessage: 'No item found'
  });
});

router.delete('/:id', verifyToken, async (req, res) => {
  let id = req.getParam('id');
  let category = await Category.findByPk(id);
  if (category) {
    category.destroy();
    res.success();
  }
  else res.status(502).send({
    errorMessage: 'No item found'
  });  
});

module.exports = router;
