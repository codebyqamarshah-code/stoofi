const express = require('express');
const { getAll, create, update, remove } = require('../controllers/class-teacher.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(protect, getAll)
  .post(protect, authorize('Super Admin', 'Admin'), create);

router.route('/:id')
  .put(protect, authorize('Super Admin', 'Admin'), update)
  .delete(protect, authorize('Super Admin', 'Admin'), remove);

module.exports = router;

