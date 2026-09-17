const express = require('express');
const { 
  getFeesGroups, createFeesGroup, deleteFeesGroup,
  getFeesTypes, createFeesType, deleteFeesType
} = require('../controllers/fees.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/group').get(getFeesGroups).post(authorize('Super Admin', 'Admin', 'Accountant'), createFeesGroup);
router.route('/group/:id').delete(authorize('Super Admin', 'Admin', 'Accountant'), deleteFeesGroup);

router.route('/type').get(getFeesTypes).post(authorize('Super Admin', 'Admin', 'Accountant'), createFeesType);
router.route('/type/:id').delete(authorize('Super Admin', 'Admin', 'Accountant'), deleteFeesType);

module.exports = router;
