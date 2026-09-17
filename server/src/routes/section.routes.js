const express = require('express');
const { getAll, create, update, remove } = require('../controllers/section.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/').get(getAll).post(protect, create);
router.route('/:id').put(protect, update).delete(protect, remove);

module.exports = router;
