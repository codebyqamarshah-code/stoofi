const express = require('express');
const { 
  getFeesGroups, createFeesGroup, deleteFeesGroup,
  getFeesTypes, createFeesType, deleteFeesType
} = require('../controllers/fees.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/group').get(getFeesGroups).post(createFeesGroup);
router.route('/group/:id').delete(deleteFeesGroup);

router.route('/type').get(getFeesTypes).post(createFeesType);
router.route('/type/:id').delete(deleteFeesType);

module.exports = router;
