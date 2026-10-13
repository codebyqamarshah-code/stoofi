const express = require('express');
const { 
  getFeesGroups, createFeesGroup, updateFeesGroup, deleteFeesGroup,
  getFeesTypes, createFeesType, updateFeesType, deleteFeesType,
  getCarryForward, saveCarryForward
} = require('../controllers/fees.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/group').get(getFeesGroups).post(authorize('Super Admin', 'Admin', 'Accountant'), createFeesGroup);
router.route('/group/:id')
  .put(authorize('Super Admin', 'Admin', 'Accountant'), updateFeesGroup)
  .delete(authorize('Super Admin', 'Admin', 'Accountant'), deleteFeesGroup);

router.route('/type').get(getFeesTypes).post(authorize('Super Admin', 'Admin', 'Accountant'), createFeesType);
router.route('/type/:id')
  .put(authorize('Super Admin', 'Admin', 'Accountant'), updateFeesType)
  .delete(authorize('Super Admin', 'Admin', 'Accountant'), deleteFeesType);

router.route('/carry-forward')
  .get(getCarryForward)
  .post(authorize('Super Admin', 'Admin', 'Accountant'), saveCarryForward);

module.exports = router;
