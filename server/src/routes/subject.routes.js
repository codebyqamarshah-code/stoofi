const express = require('express');
const { getAll, create, update, remove } = require('../controllers/subject.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .get(getAll)
  .post(protect, authorize('Super Admin', 'Admin'), create);

router.route('/:id')
  .put(protect, authorize('Super Admin', 'Admin'), update)
  .delete(protect, authorize('Super Admin', 'Admin'), remove);

module.exports = router;

